# main_inference.py
import torch
from transformers import AutoImageProcessor, SiglipForImageClassification
from PIL import Image

# 1. Load the pre-trained model and image processor from Hugging Face Hub
MODEL_ID = "prithivMLmods/Recycling-Net-11"

# The processor handles image resizing, normalization, and tensor conversion
processor = AutoImageProcessor.from_pretrained(MODEL_ID)

# The model is the trained SigLIP architecture for image classification
model = SiglipForImageClassification.from_pretrained(MODEL_ID)

# Set the model to evaluation mode. This disables layers like dropout
# that are only used during training.
model.eval()

# main_inference.py (continued)

def classify_image(image_path: str) -> dict:
    """
    Loads an image, runs it through the classification model, and returns
    a dictionary of class probabilities.

    Args:
        image_path (str): The file path to the image to be classified.

    Returns:
        dict: A dictionary mapping class labels to their predicted probabilities.
    """
    try:
        # 2. Load the image from the specified path using Pillow
        # The.convert("RGB") is important to ensure the image has 3 color channels
        image = Image.open(image_path).convert("RGB")
    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path}")
        return {}
    except Exception as e:
        print(f"Error loading image: {e}")
        return {}

    # 3. Preprocess the image
    # The processor converts the PIL Image into a PyTorch tensor with the
    # correct dimensions, normalization, etc.
    inputs = processor(images=image, return_tensors="pt")

    # 4. Perform inference
    # torch.no_grad() is a context manager that disables gradient calculation,
    # which is unnecessary for inference and saves memory and computation.
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits

    # 5. Post-process the output
    # The model outputs raw scores (logits). We apply the softmax function
    # to convert these scores into probabilities that sum to 1.
    probabilities = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()

    # Map the probabilities to their corresponding class labels
    # The model.config.id2label dictionary provides the mapping from
    # the output index to the human-readable class name.
    predictions = {
        model.config.id2label[i]: round(prob, 4)
        for i, prob in enumerate(probabilities)
    }

    # Sort the predictions by probability in descending order for clarity
    sorted_predictions = dict(sorted(predictions.items(), key=lambda item: item, reverse=True))

    return sorted_predictions

# Example usage:
if __name__ == "__main__":
    # Replace 'path/to/your/image.jpg' with an actual image file
    test_image_path = 'test_image.jpg'
    results = classify_image(test_image_path)

    if results:
        print(f"Classification results for {test_image_path}:")
        for label, score in results.items():
            print(f"- {label}: {score:.2%}")
