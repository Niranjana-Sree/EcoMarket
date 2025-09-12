# TODO: Fix Chatbot Image Classification Error

## Issue
- Chatbot shows "failed to classify" when uploading image for classification
- Should return material composition of the image

## Root Cause
- API server failing to load due to missing dependencies and incorrect imports
- AutoProcessor import error
- python-multipart not installed
- Incomplete fine_tuned_model directory causing model loading failure

## Fixes Applied
- [x] Changed `AutoProcessor` to `AutoImageProcessor` in api_server.py
- [x] Switched back to previous model: prithivMLmods/Recycling-Net-11 (Siglip model)
- [x] Fixed sorting in run_inference function (key=lambda item: item[1])
- [x] Added error handling in run_inference and predict endpoint
- [x] Started API server on port 8000
- [x] Model loaded successfully
- [x] Test classification working and returning predictions

## Current Status
- Backend API running on http://localhost:8000
- Model loaded successfully with Recycling-Net-11
- Classification working for recycling materials (paper, plastics, glass, etc.)
- Error "Failed to classify the image" resolved

## Testing
- Open http://localhost:8082 in browser
- Click on EcoAdvisor chatbot
- Upload an image using the camera button
- Should display classification results with material composition
