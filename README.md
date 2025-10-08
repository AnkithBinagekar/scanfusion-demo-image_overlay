# Segmentation-Demo

A  **medical image segmentation demo** built using **React**, **FastAPI**, and **MONAI**.  
It allows users to upload `.nii.gz` MRI brain scans (or run a sample demo) and visualize tumor segmentation results interactively.

---

##  Project Overview

Segmentation-Demo demonstrates a complete **end-to-end AI medical imaging pipeline**, combining a modern web UI with deep learning inference on the backend.

###  Tech Stack

| Layer | Technology | Purpose |
|--------|-------------|----------|
| **Frontend** | React + TailwindCSS (deployed on [Vercel]([https://vercel.com](https://scanfusion-demo-image-overlay.vercel.app/) | User interface for uploads, options, and result previews |
| **Backend** | FastAPI + MONAI (hosted on AWS EC2) | Handles uploads, runs segmentation using SegResNet |
| **Model** | MONAI SegResNet (3D brain tumor segmentation) | Performs medical image inference |
| **Networking** | AWS Elastic IP + API Gateway (HTTPS) | Ensures secure and stable frontend-backend communication |

---

##  Features

 Upload `.nii.gz` medical image files  
 Trigger segmentation and view 2D slice previews  
 Toggle between input, output, and overlay modes  
 Run a built-in **sample demo** without uploading a file  
 React Context for state persistence between pages  
 FastAPI backend for processing and static image serving  
 Secure HTTPS connection via AWS API Gateway

---

##  Folder Structure
scanfusion-demo/
├── scanfusion-frontend/ # React (Vercel)
│ ├── src/
│ │ ├── pages/FusionPage.jsx
│ │ ├── pages/FusionResult.jsx
│ │ ├── context/ImageContext.jsx
│ │ └── components/
│ └── .env (REACT_APP_API_URL)
│
└── scanfusion-backend/ # FastAPI (EC2)
├── app/
│ ├── main.py
│ ├── processor.py
│ ├── utils.py
│ ├── static/ # Output images (served publicly)
│ ├── uploads/ # Uploaded files
│ └── sample_data/ # Demo file (sample .nii.gz)
├── requirements.txt
└── model.pt # Trained MONAI SegResNet model



