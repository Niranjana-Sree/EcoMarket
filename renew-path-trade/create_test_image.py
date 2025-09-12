from PIL import Image

def create_test_image():
    # Create a simple 224x224 red image for testing
    img = Image.new('RGB', (224, 224), color = (255, 0, 0))
    img.save('test_image.jpg')

if __name__ == "__main__":
    create_test_image()
    print("Test image created as test_image.jpg")
