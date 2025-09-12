import requests

API_URL = "http://localhost:8000/predict"
IMAGE_PATH = "test_image.jpg"  # You need to have a test image in this path

def test_classification():
    with open(IMAGE_PATH, "rb") as f:
        files = {"file": ("test_image.jpg", f, "image/jpeg")}
        response = requests.post(API_URL, files=files)
        if response.status_code == 200:
            print("Classification results:", response.json())
        else:
            print("Failed to classify image. Status code:", response.status_code)
            print("Response:", response.text)

if __name__ == "__main__":
    test_classification()
