"""
colab_infer.py
Wrapper around the Colab-exported brats_segmentation_3d_eval.py
for clean inference inside the FastAPI backend.
"""

from pathlib import Path
from typing import Dict, Optional

import numpy as np
import torch
from monai.transforms import (
    Compose,
    LoadImaged,
    EnsureChannelFirstd,
    EnsureTyped,
    Orientationd,
    Spacingd,
    NormalizeIntensityd,
)
from monai.inferers import sliding_window_inference
from monai.networks.nets import SegResNet


def predict_volume(modality_paths: Dict[str, Optional[Path]], model_path: Path, flair_only: bool = False) -> np.ndarray:
    """
    Run 3D tumor segmentation using the trained SegResNet.

    Args:
        modality_paths: dict with keys 'FLAIR','T1','T1CE','T2' (Path or None)
        model_path: path to trained model checkpoint (.pt)
        flair_only: if True, use only FLAIR (repeat 4x)

    Returns:
        np.ndarray (Z,Y,X) float32 mask/prob map in [0,1] (channel 2 tumor output)
    """

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # --- preprocessing transforms (same as in Colab) ---
    val_transform = Compose(
        [
            LoadImaged(keys=["image"]),
            EnsureChannelFirstd(keys="image"),
            EnsureTyped(keys=["image"]),
            Orientationd(keys=["image"], axcodes="RAS"),
            Spacingd(keys=["image"], pixdim=(1.0, 1.0, 1.0), mode=("bilinear")),
            NormalizeIntensityd(keys="image", nonzero=True, channel_wise=True),
        ]
    )

    # --- build dataset dict ---
    if flair_only or (modality_paths.get("T1") is None and modality_paths.get("T1CE") is None and modality_paths.get("T2") is None):
        data = [{"image": str(modality_paths["FLAIR"])}]
        flair_only = True
    else:
        imgs = [str(modality_paths[k]) for k in ["FLAIR", "T1", "T1CE", "T2"] if modality_paths.get(k)]
        data = [{"image": imgs}]

    sample = val_transform(data[0])
    image = sample["image"]  # shape [C,H,W,D]

    if flair_only:
        # repeat flair 4 times → [4,H,W,D]
        image = image.repeat(4, 1, 1, 1)

    val_input = image.unsqueeze(0).to(device)  # [1,4,H,W,D]

    # --- build model ---
    model = SegResNet(
        blocks_down=[1, 2, 2, 4],
        blocks_up=[1, 1, 1],
        init_filters=16,
        in_channels=4,
        out_channels=3,
        dropout_prob=0.2,
    ).to(device)

    state = torch.load(str(model_path), map_location=device)
    model.load_state_dict(state)
    model.eval()

    # --- inference ---
    with torch.no_grad():
        logits = sliding_window_inference(val_input, roi_size=(240, 240, 160), sw_batch_size=1, predictor=model, overlap=0.5)
        probs = torch.sigmoid(logits)  # [1,3,H,W,D]
        tumor = probs[0, 2]  # channel 2 (enhancing tumor), shape [H,W,D]

    tumor_np = tumor.cpu().numpy().astype("float32")  # [H,W,D]
    tumor_np = np.moveaxis(tumor_np, -1, 0)  # [Z,Y,X]

    # normalize [0,1]
    tumor_np = (tumor_np - tumor_np.min()) / (tumor_np.max() - tumor_np.min() + 1e-6)
    return tumor_np
