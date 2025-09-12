# api_server.py
import io
import torch
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoImageProcessor, AutoConfig, SiglipForImageClassification
from PIL import Image

# Initialize FastAPI app
app = FastAPI(title="Waste Classification API")

# Add CORS middleware to allow requests from web browsers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your chatbot's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Model Loading ---
# Load the model and processor once on startup to avoid reloading for each request.
# This is a critical performance optimization.
import os
MODEL_ID = "prithivMLmods/Recycling-Net-11"

print(f"Loading model: {MODEL_ID}")
try:
    config = AutoConfig.from_pretrained(MODEL_ID)
    model = SiglipForImageClassification.from_pretrained(MODEL_ID, config=config)
    processor = AutoImageProcessor.from_pretrained(MODEL_ID)
    model.eval()
    print("Model loaded successfully")
    print(f"Model classes: {model.config.id2label}")
except Exception as e:
    print(f"Error loading model: {e}")
    raise

# --- Helper Function for Inference ---
def run_inference(image_bytes: bytes) -> dict:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
        probabilities = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()
        predictions = {
            model.config.id2label[i]: round(prob, 4)
            for i, prob in enumerate(probabilities)
        }
        # Sort by probability descending
        return dict(sorted(predictions.items(), key=lambda item: item[1], reverse=True))
    except Exception as e:
        print(f"Error during inference: {e}")
        return {"error": "Failed to classify the image"}

# --- API Endpoint ---
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Accepts an image file, classifies it, and returns the results.
    """
    try:
        image_bytes = await file.read()
        results = run_inference(image_bytes)
        if "error" in results:
            return {"error": "Failed to classify the image"}
        return results
    except Exception as e:
        print(f"Error in predict endpoint: {e}")
        return {"error": "Failed to classify the image"}

@app.get("/")
def root():
    return {"message": "Waste Classification API is running."}

# To run this server: uvicorn api_server:app --reload