# app/utils.py

import os
import shutil
import uuid
from fastapi import UploadFile

def save_upload_file(upload_file: UploadFile, save_dir: str = "app/uploads") -> str:
    os.makedirs(save_dir, exist_ok=True)
    ext = os.path.splitext(upload_file.filename)[-1]
    file_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(save_dir, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path