import os
import shutil
import zipfile
import nibabel as nib
import numpy as np
import torch
import imageio
import cv2
import logging
from monai.transforms import (
    LoadImaged, EnsureChannelFirstd, Spacingd, ScaleIntensityRanged,
    CropForegroundd, Orientationd, Resized, Compose, EnsureTyped, NormalizeIntensityd
)
from monai.inferers import sliding_window_inference
from monai.networks.nets import SegResNet
from monai.data import Dataset, DataLoader
from monai.transforms import Activations, AsDiscrete
from PIL import Image

# -----------------
# LOGGING SETUP
# -----------------
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
# If running standalone, you might add a handler, but uvicorn usually handles this.
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)
# -----------------
# CONFIG
# -----------------
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
STATIC_DIR = "app/static"
UPLOAD_DIR = "app/uploads"

# --- SLICE LIMITS FOR VISUALIZATION ---
# Starting index (0-based) for slices to save for visualization
START_SLICE_INDEX = 50
# Maximum number of slices to save from the start index
MAX_SLICES_TO_PROCESS = 60
# --------------------------------------

logger.info(f"Configuration loaded. DEVICE: {DEVICE}, STATIC_DIR: {STATIC_DIR}, UPLOAD_DIR: {UPLOAD_DIR}")
logger.info(f"Visualization limits set: Start Index={START_SLICE_INDEX}, Max Slices={MAX_SLICES_TO_PROCESS}")


def clear_static_folder():
    """Remove all old files in static folder."""
    logger.info(f"Attempting to clear static folder: {STATIC_DIR}")
    try:
        if os.path.exists(STATIC_DIR):
            shutil.rmtree(STATIC_DIR)
            logger.info("Existing static folder removed.")
        os.makedirs(STATIC_DIR, exist_ok=True)
        logger.info("New static folder created/ensured.")
    except Exception as e:
        logger.error(f"Failed to clear/create static folder {STATIC_DIR}: {e}")
        # Raise the error to halt execution if cleanup fails, as it's critical
        raise

# -----------------
# UTILS
# -----------------
def save_slices_as_jpg(volume, prefix):
    """
    Save all slices in the *pre-cropped* volume as JPG, 
    using the global index for the filename.
    """
    logger.info(f"Saving slices as JPG with prefix: {prefix}. Cropped Volume shape: {volume.shape}")
    slice_paths = []
    
    # Handle potential empty volume (now pre-cropped)
    if volume.size == 0 or volume.ndim < 3:
        logger.warning(f"Volume for prefix {prefix} is empty or has too few dimensions: {volume.shape}")
        return []

    try:
        # Normalization
        volume = (volume - volume.min()) / (volume.max() - volume.min() + 1e-8)
        volume = (volume * 255).astype(np.uint8)

        num_slices = volume.shape[-1]
        logger.info(f"Processing {num_slices} pre-cropped slices.")
        
        # Loop only over the pre-cropped volume size
        for i in range(num_slices):
            slice_img = volume[..., i]
            img = Image.fromarray(slice_img)
            
            # Use original index for filename consistency
            global_index = START_SLICE_INDEX + i
            filename = f"{prefix}_slice{global_index:03d}.jpg" 
            filepath = os.path.join(STATIC_DIR, filename)
            img.save(filepath)
            slice_paths.append(filepath)
            
        logger.info(f"Successfully saved {len(slice_paths)} slices for prefix: {prefix}")
        return slice_paths
    except Exception as e:
        logger.error(f"Error during saving JPG slices for prefix {prefix}: {e}")
        return [] # Return empty list on failure

def create_gif(slice_paths, gif_name):
    logger.info(f"Creating GIF: {gif_name} from {len(slice_paths)} slices.")
    if not slice_paths:
        logger.warning(f"Cannot create GIF {gif_name}: no slice paths provided.")
        return None
        
    try:
        images = [imageio.imread(p) for p in slice_paths]
        gif_path = os.path.join(STATIC_DIR, gif_name)
        imageio.mimsave(gif_path, images, fps=10)
        logger.info(f"GIF saved to {gif_path}")
        return f"static/{gif_name}"
    except Exception as e:
        logger.error(f"Error creating GIF {gif_name}: {e}")
        return None

def save_overlay_slices(input_vol, mask_vol, prefix="overlay", alpha=0.4):
    """
    Overlay segmentation mask on the *pre-cropped* input volume slices,
    using the global index for the filename.
    """
    logger.info(f"Creating overlay slices with prefix: {prefix}. Cropped Input shape: {input_vol.shape}")
    slice_paths = []

    # Basic shape check for the pre-cropped volumes
    if input_vol.shape != mask_vol.shape:
        logger.error(f"Input and mask volumes must have same shape for overlay. Got {input_vol.shape} and {mask_vol.shape}")
        return []
        
    try:
        # Normalize input to 0-255 grayscale
        input_norm = (input_vol - input_vol.min()) / (input_vol.max() - input_vol.min() + 1e-8)
        input_norm = (input_norm * 255).astype(np.uint8)

        num_slices = input_vol.shape[-1]
        logger.info(f"Processing {num_slices} pre-cropped overlay slices.")

        for i in range(num_slices):
            base_slice = input_norm[..., i]
            mask_slice = mask_vol[..., i]

            # Convert grayscale to BGR
            base_bgr = cv2.cvtColor(base_slice, cv2.COLOR_GRAY2BGR)

            # Apply color map to mask (e.g. applyJet colormap or custom colors)
            mask_color = np.zeros_like(base_bgr)
            # Use red for segmentation
            mask_color[mask_slice > 0] = [0, 0, 255]

            # Blend images
            overlay = cv2.addWeighted(base_bgr, 1.0, mask_color, alpha, 0)

            # Use original index for filename consistency
            global_index = START_SLICE_INDEX + i
            filename = f"{prefix}_slice{global_index:03d}.jpg"
            filepath = os.path.join(STATIC_DIR, filename)
            cv2.imwrite(filepath, overlay)
            slice_paths.append(filepath)

        logger.info(f"Successfully saved {len(slice_paths)} overlay slices.")
        return slice_paths
    except Exception as e:
        logger.error(f"Error during creation of overlay slices for prefix {prefix}: {e}")
        return []

# -----------------
# PREPROCESSING
# -----------------
def get_transforms(pixdim=(1.0, 1.0, 1.0), spatial_size=(128, 128, 64)):
    logger.info(f"Defining MONAI transforms with pixdim: {pixdim}")
    # Return Compose object directly
    return Compose([
        LoadImaged(keys=["image"]),
        EnsureChannelFirstd(keys=["image"]),
        EnsureTyped(keys=["image"]),
        Orientationd(keys=["image"], axcodes="RAS"),
        NormalizeIntensityd(keys="image", nonzero=True, channel_wise=True),
        Spacingd(keys=["image"], pixdim=pixdim, mode=("bilinear")),
    ])

# -----------------
# MAIN SEGMENTATION
# -----------------
def run_segmentation(input_path, model_path, output_dir):
    logger.info(f"Starting segmentation for input: {input_path}")
    
    # 1. Setup and Pre-check
    try:
        clear_static_folder()
    except Exception:
        # clear_static_folder already logs the error, just re-raise
        return [], [], [], None

    # 2. Handle Input Modalities
    modalities = []
    try:
        if zipfile.is_zipfile(input_path):
            logger.info("Input is a ZIP file. Extracting modalities.")
            with zipfile.ZipFile(input_path, 'r') as zip_ref:
                zip_ref.extractall(UPLOAD_DIR)
            nii_files = sorted([os.path.join(UPLOAD_DIR, f) for f in os.listdir(UPLOAD_DIR) if f.endswith(".nii") or f.endswith(".nii.gz")])
            modalities = nii_files
            logger.info(f"Extracted {len(modalities)} NII files from ZIP.")
        elif input_path.endswith(".nii.gz") or input_path.endswith(".nii"):
            logger.info("Input is a single NII/NII.GZ file.")
            modalities = [input_path]
        else:
            logger.error(f"Unsupported input file type: {input_path}")
            raise ValueError("Unsupported input file type. Must be .nii, .nii.gz, or a zip file.")

        if len(modalities) == 1:
            logger.warning("Single FLAIR detected (4x repeat applied).")
            modalities = modalities * 4

        if len(modalities) != 4:
            logger.error(f"Expected 4 modalities, got {len(modalities)}")
            raise ValueError(f"Expected 4 modalities, got {len(modalities)}")
            
        logger.info(f"Modalities list finalized (total {len(modalities)}): {modalities}")
        
    except (ValueError, zipfile.BadZipFile, OSError) as e:
        logger.error(f"Error handling input file/modalities: {e}")
        return [], [], [], None

    # 3. Data Loading and Preprocessing
    data_4ch = None
    try:
        data_dict = [{"image": m} for m in modalities]
        transform = get_transforms()
        dataset = Dataset(data=data_dict, transform=transform)
        loader = DataLoader(dataset, batch_size=1)
        logger.info("Data loaded and MONAI DataLoader prepared.")

        data_4ch_list = []
        for batch in loader:
            img = batch["image"]  # shape: (1, 1, H, W, D)
            data_4ch_list.append(img.squeeze(0))
        data_4ch = torch.cat(data_4ch_list, dim=0).unsqueeze(0).to(DEVICE)

        # --- CRITICAL CHANGE: SLICE INPUT VOLUME BEFORE INFERENCE ---
        total_depth = data_4ch.shape[-1]
        start = min(START_SLICE_INDEX, total_depth)
        end = min(start + MAX_SLICES_TO_PROCESS, total_depth)

        if start >= end:
            logger.error(f"Visualization limits are invalid (start: {start}, end: {end}) for total depth: {total_depth}.")
            raise ValueError("Invalid slice indices for input volume.")

        # Slice the input volume before passing to the model
        data_4ch = data_4ch[..., start:end]
        
        logger.warning(f"Input volume has been sliced from index {start} to {end-1} (new shape: {data_4ch.shape}). Segmentation quality may be reduced at the boundaries.")
        logger.info(f"4-channel data tensor created and sliced. Final Shape: {data_4ch.shape}")
        # -------------------------------------------------------------
        
    except Exception as e:
        logger.error(f"Error during data loading/preprocessing with MONAI: {e}")
        return [], [], [], None

    # 4. Model Loading
    model = None
    try:
        model = SegResNet(
            blocks_down=(1, 2, 2, 4),
            blocks_up=(1, 1, 1),
            init_filters=16,
            in_channels=4,
            out_channels=3,
            dropout_prob=0.2
        ).to(DEVICE)
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
            
        model.load_state_dict(torch.load(model_path, map_location=DEVICE))
        model.eval()
        logger.info(f"Model loaded from path: {model_path} and set to evaluation mode.")
        
    except (FileNotFoundError, RuntimeError) as e:
        logger.error(f"Error loading or initializing model: {e}")
        return [], [], [], None

    # 5. Inference (Now runs only on the sliced volume)
    output = None
    try:
        with torch.no_grad():
            logger.info("Starting sliding window inference...")
            output = sliding_window_inference(
                data_4ch, roi_size=(240, 240, 160), overlap=0.5, sw_batch_size=1, predictor=model
            )
            logger.info(f"Inference complete. Raw output shape: {output.shape}")
            
    except Exception as e:
        logger.error(f"Error during sliding window inference: {e}")
        return [], [], [], None

    # 6. Postprocessing and Final Prep
    try:
        output = Activations(sigmoid=True)(output)
        output = AsDiscrete(threshold=0.5)(output)
        logger.info(f"Post-processing (Sigmoid + Threshold 0.5) applied. Discretized output shape: {output.shape}")

        # Ensure Z-dimension consistency (this check is minimal now since the input was pre-sliced)
        if output.shape[-1] != data_4ch.shape[-1]:
            min_d = min(output.shape[-1], data_4ch.shape[-1])
            output = output[..., :min_d]
            data_4ch = data_4ch[..., :min_d]
            logger.warning(f"Z-dimension mismatch found. Slicing both to minimum dimension: {min_d}")

        # Convert tensors to NumPy (these tensors are now already sliced from step 3/5)
        input_np = data_4ch.cpu().numpy()[0, 0, ...]
        output_np = output.cpu().numpy()[0, 1, ...]
        
        logger.info(f"Final NumPy arrays for visualization created. Shape: {input_np.shape}.")
        
    except Exception as e:
        logger.error(f"Error during post-processing or final tensor conversion: {e}")
        return [], [], [], None


    # 7. Visualization and Output
    try:
        # Pass the pre-sliced NumPy arrays to the utility functions
        input_slices = save_slices_as_jpg(input_np, "input")
        output_slices = save_slices_as_jpg((output_np * 255).astype(np.uint8), "output")
        overlay_slices = save_overlay_slices(input_np, output_np, prefix="overlay")
        logger.info("All slices (input, output, overlay) saved as JPGs.")

        gif_url = create_gif(output_slices, "output.gif")
        if gif_url:
            logger.info(f"Final GIF created: {gif_url}")
        
        logger.info("Segmentation and visualization complete.")
        return input_slices, output_slices, overlay_slices, gif_url
        
    except Exception as e:
        logger.error(f"Critical error during visualization/output phase: {e}")
        return [], [], [], None
