import os
import shutil
import zipfile
import nibabel as nib
import numpy as np
import torch
import imageio
import cv2   # ### NEW
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
# CONFIG
# -----------------
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
STATIC_DIR = "app/static"
UPLOAD_DIR = "app/uploads"

def clear_static_folder():
    """Remove all old files in static folder."""
    if os.path.exists(STATIC_DIR):
        shutil.rmtree(STATIC_DIR)
    os.makedirs(STATIC_DIR, exist_ok=True)

# -----------------
# UTILS
# -----------------
def save_slices_as_jpg(volume, prefix):
    """Save each slice in volume as JPG and return list of file paths."""
    slice_paths = []
    volume = (volume - volume.min()) / (volume.max() - volume.min() + 1e-8)
    volume = (volume * 255).astype(np.uint8)

    for i in range(volume.shape[-1]):
        slice_img = volume[..., i]
        img = Image.fromarray(slice_img)
        filename = f"{prefix}_slice{i:03d}.jpg"
        filepath = os.path.join(STATIC_DIR, filename)
        img.save(filepath)
        slice_paths.append(filepath)
    return slice_paths

def create_gif(slice_paths, gif_name):
    images = [imageio.imread(p) for p in slice_paths]
    gif_path = os.path.join(STATIC_DIR, gif_name)
    imageio.mimsave(gif_path, images, fps=10)
    return f"static/{gif_name}"

### NEW: Overlay function
def save_overlay_slices(input_vol, mask_vol, prefix="overlay", alpha=0.4):
    """Overlay segmentation mask on input volume slices and save as JPGs."""
    slice_paths = []
    # Normalize input to 0-255 grayscale
    input_norm = (input_vol - input_vol.min()) / (input_vol.max() - input_vol.min() + 1e-8)
    input_norm = (input_norm * 255).astype(np.uint8)

    for i in range(input_norm.shape[-1]):
        base_slice = input_norm[..., i]
        mask_slice = mask_vol[..., i]

        # Convert grayscale to BGR
        base_bgr = cv2.cvtColor(base_slice, cv2.COLOR_GRAY2BGR)

        # Apply color map to mask (e.g. applyJet colormap or custom colors)
        mask_color = np.zeros_like(base_bgr)
        mask_color[mask_slice > 0] = [0, 0, 255]  # red overlay

        # Blend images
        overlay = cv2.addWeighted(base_bgr, 1.0, mask_color, alpha, 0)

        filename = f"{prefix}_slice{i:03d}.jpg"
        filepath = os.path.join(STATIC_DIR, filename)
        cv2.imwrite(filepath, overlay)
        slice_paths.append(filepath)

    return slice_paths

# -----------------
# PREPROCESSING
# -----------------
def get_transforms(pixdim=(1.0, 1.0, 1.0), spatial_size=(128, 128, 64)):
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
    clear_static_folder()

    # Handle multi-modality zip
    modalities = []
    if zipfile.is_zipfile(input_path):
        with zipfile.ZipFile(input_path, 'r') as zip_ref:
            zip_ref.extractall(UPLOAD_DIR)
        nii_files = sorted([os.path.join(UPLOAD_DIR, f) for f in os.listdir(UPLOAD_DIR) if f.endswith(".nii") or f.endswith(".nii.gz")])
        modalities = nii_files
    elif input_path.endswith(".nii.gz") or input_path.endswith(".nii"):
        modalities = [input_path]

    if len(modalities) == 1:
        print("🧠 Single FLAIR detected (4x repeat)")
        modalities = modalities * 4

    if len(modalities) != 4:
        raise ValueError(f"Expected 4 modalities, got {len(modalities)}")

    # Load data
    data_dict = [{"image": m} for m in modalities]
    transform = get_transforms()
    dataset = Dataset(data=data_dict, transform=transform)
    loader = DataLoader(dataset, batch_size=1)

    data_4ch = []
    for batch in loader:
        img = batch["image"]  # shape: (1, 1, H, W, D)
        data_4ch.append(img.squeeze(0))
    data_4ch = torch.cat(data_4ch, dim=0).unsqueeze(0).to(DEVICE)

    # Model
    model = SegResNet(
        blocks_down=(1, 2, 2, 4),
        blocks_up=(1, 1, 1),
        init_filters=16,
        in_channels=4,
        out_channels=3,
        dropout_prob=0.2
    ).to(DEVICE)
    model.load_state_dict(torch.load(model_path, map_location=DEVICE))
    model.eval()

    with torch.no_grad():
        output = sliding_window_inference(
            data_4ch, roi_size=(240, 240, 160), overlap=0.5, sw_batch_size=1, predictor=model
        )

    # Postprocess
    output = Activations(sigmoid=True)(output)
    output = AsDiscrete(threshold=0.5)(output)

    if output.shape[-1] != data_4ch.shape[-1]:
        min_d = min(output.shape[-1], data_4ch.shape[-1])
        output = output[..., :min_d]
        data_4ch = data_4ch[..., :min_d]

    # Convert tensors to numpy
    input_np = data_4ch.cpu().numpy()[0, 0, ...]
    output_np = output.cpu().numpy()[0, 1, ...]

    # Save slices
    input_slices = save_slices_as_jpg(input_np, "input")
    output_slices = save_slices_as_jpg((output_np * 255).astype(np.uint8), "output")
    overlay_slices = save_overlay_slices(input_np, output_np, prefix="overlay")  # ### NEW

    # Create GIF
    gif_url = create_gif(output_slices, "output.gif")

    return input_slices, output_slices, overlay_slices, gif_url
