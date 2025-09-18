from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.processor import run_segmentation

app = FastAPI()


origins = [
    "https://scanfusion-demo-image-overlay.vercel.app",  # ✅ Your Vercel frontend
    "https://kindlessly-interannular-jadiel.ngrok-free.app",  # ✅ Your ngrok domain
    #"http://localhost:3000",  # (Optional) local dev
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "app/uploads"
STATIC_DIR = "app/static"
MODEL_PATH = "app/model.pt"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

#app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# ✅ Mount static folder
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.post("/process")
async def process_file(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as f:
        f.write(await file.read())

    print(f"Received file: {file_location}")

    try:
        input_slices, output_slices, overlay_slices, gif_url = run_segmentation(
            file_location, MODEL_PATH, STATIC_DIR
        )
        print(f"Processed {len(input_slices)} input, {len(output_slices)} output, {len(overlay_slices)} overlay slices")

        return {
        "input": [f"static/{os.path.basename(p)}" for p in input_slices],
        "output": [f"static/{os.path.basename(p)}" for p in output_slices],
        "overlay": [f"static/{os.path.basename(p)}" for p in overlay_slices],
        "gif": f"static/{os.path.basename(gif_url)}" if gif_url else None,
    }


    except Exception as e:
        print("Segmentation Error:", e)
        return {"error": str(e)}
