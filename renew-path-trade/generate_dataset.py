from PIL import Image
import os

# Colors for classes
colors = {
    'wooden': (139, 69, 19),  # Brown
    'plastic': (0, 0, 255),   # Blue
    'metal': (128, 128, 128)  # Gray
}

# Create images
for class_name, color in colors.items():
    for i in range(5):  # 5 images per class
        img = Image.new('RGB', (224, 224), color=color)
        img.save(f'data/train/{class_name}/{class_name}{i}.jpg')

print("Dataset generated.")
