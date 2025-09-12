import torch
from transformers import AutoImageProcessor, SiglipForImageClassification, TrainingArguments, Trainer
from torch.utils.data import Dataset
from PIL import Image
import os

# Model and processor
MODEL_ID = "prithivMLmods/Recycling-Net-11"
processor = AutoImageProcessor.from_pretrained(MODEL_ID)
model = SiglipForImageClassification.from_pretrained(MODEL_ID)

# Custom dataset class
class ImageDataset(Dataset):
    def __init__(self, root_dir, processor):
        self.root_dir = root_dir
        self.processor = processor
        self.classes = os.listdir(root_dir)
        self.class_to_idx = {cls: i for i, cls in enumerate(self.classes)}
        self.images = []
        for cls in self.classes:
            cls_dir = os.path.join(root_dir, cls)
            for img_name in os.listdir(cls_dir):
                self.images.append((os.path.join(cls_dir, img_name), self.class_to_idx[cls]))

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path, label = self.images[idx]
        image = Image.open(img_path).convert("RGB")
        inputs = self.processor(images=image, return_tensors="pt")
        return {
            "pixel_values": inputs["pixel_values"].squeeze(),
            "labels": torch.tensor(label, dtype=torch.long)
        }

# Dataset path
data_dir = "data/train"
train_dataset = ImageDataset(data_dir, processor)

# Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    per_device_train_batch_size=8,
    num_train_epochs=3,
    logging_dir="./logs",
    save_steps=500,
    save_total_limit=2,
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
)

# Train
trainer.train()

# Save the model
model.save_pretrained("./fine_tuned_model")
processor.save_pretrained("./fine_tuned_model")

print("Model fine-tuned and saved to ./fine_tuned_model")
