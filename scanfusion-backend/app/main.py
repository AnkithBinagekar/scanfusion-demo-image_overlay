from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.processor import run_segmentation


# ✅ Add your ngrok URL here
#NGROK_URL = "https://kindlessly-interannular-jadiel.ngrok-free.app"
NGROK_URL = "https://r93u45uwjc.execute-api.ap-south-1.amazonaws.com/"
app = FastAPI()


origins = [
    "https://scanfusion-demo-image-overlay.vercel.app",  # ✅ Your Vercel frontend
   # "https://kindlessly-interannular-jadiel.ngrok-free.app",  # ✅ Your ngrok domain
    #"http://localhost:3000",  # (Optional) local dev
"https://r93u45uwjc.execute-api.ap-south-1.amazonaws.com/"
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
SAMPLE_DIR = "app/sample_data"  #sample demo data
MODEL_PATH = "app/model.pt"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(SAMPLE_DIR, exist_ok=True)

#app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
class CustomStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)



        # Add explicit CORS headers for images/static assets
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response


# ✅ Mount static folder
#app.mount("/static", StaticFiles(directory="app/static"), name="static")

# ✅ Mount static folder with custom class
app.mount("/static", CustomStaticFiles(directory=STATIC_DIR), name="static")


# Without sample demo 
#@app.post("/process")
#async def process_file(file: UploadFile = File(...)):
 #   file_location = os.path.join(UPLOAD_DIR, file.filename)
  #  with open(file_location, "wb") as f:
   #     f.write(await file.read())

    #print(f"Received file: {file_location}")

    #try:
     #   input_slices, output_slices, overlay_slices, gif_url = run_segmentation(
      #      file_location, MODEL_PATH, STATIC_DIR
       # )
        #print(f"Processed {len(input_slices)} input, {len(output_slices)} output, {len(overlay_slices)} overlay slices")


# For sample demo along with original upload logic
@app.post("/process")
async def process_file(
    file: UploadFile = File(None),
    demo_sample: str = None,
):
    """
    Processes either:
    - An uploaded file (default)
    - A built-in sample if `demo=true` query param is passed
    """
    # demo_sample can take any of these values :  "UCSF-PDGM" , "Yale" ,  "Lumiere"
    sample_demo_filepath  = {
        "UCSF-PDGM": os.path.join(SAMPLE_DIR, "UCSF-PDGM-0007_FLAIR.nii.gz"),
        "Yale" : os.path.join(SAMPLE_DIR, "YG_B3X1KYYFD63K_2013-09-19_17-59-36_FLAIR.nii.gz"),
        "Lumiere" : os.path.join(SAMPLE_DIR, "flair_skull_strip.nii.gz")
    }
    try:
        # 🧠 DEMO MODE
        if demo_sample:
            demo_sample = demo_sample.strip()
            if demo_sample not in sample_demo_filepath:
                return {"error": f"Invalid sample name '{demo_sample}'."}

            sample_path = sample_demo_filepath[demo_sample]
            if not os.path.exists(sample_path):
                return {"error": f"Sample file for {demo_sample} not found on server."}

            print(f"⚙️ Running DEMO for dataset: {demo_sample}")
            input_slices, output_slices, overlay_slices, gif_url = run_segmentation(
                sample_path, MODEL_PATH, STATIC_DIR
            )


        # 🧠 UPLOAD MODE (your original logic)
        else:
            if file is None:
                return {"error": "No file uploaded."}

            file_location = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_location, "wb") as f:
                f.write(await file.read())

            print(f"✅ Received file: {file_location}")
            input_slices, output_slices, overlay_slices, gif_url = run_segmentation(
                file_location, MODEL_PATH, STATIC_DIR
            )



        # ✅ Build full URLs dynamically for all slices
        return {
            "input": [f"{NGROK_URL}/static/{os.path.basename(p)}" for p in input_slices],
            "output": [f"{NGROK_URL}/static/{os.path.basename(p)}" for p in output_slices],
            "overlay": [f"{NGROK_URL}/static/{os.path.basename(p)}" for p in overlay_slices],
            "gif": f"{NGROK_URL}/static/{os.path.basename(gif_url)}" if gif_url else None,
        }


    except Exception as e:
        print("Segmentation Error:", e)
        return {"error": str(e)}
