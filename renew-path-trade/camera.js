// camera.js

// Instead of using camera, allow user to upload image file for classification

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';

const captureButton = document.getElementById('capture-btn');
const canvas = document.getElementById('canvas');
const resultsDiv = document.getElementById('results');

const API_ENDPOINT = 'http://localhost:8000/predict';

captureButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', async () => {
    if (fileInput.files.length === 0) {
        resultsDiv.innerHTML = "No file selected.";
        return;
    }

    const file = fileInput.files[0];
    resultsDiv.innerHTML = "Classifying...";

    // Draw the selected image on canvas
    const img = new Image();
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
    };
    img.src = URL.createObjectURL(file);

    // Send the image file to backend
    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);

    } catch (error) {
        console.error("Error during classification:", error);
        resultsDiv.innerHTML = "Failed to get a classification. Please try again.";
    }
});

// Helper function to display results in the UI
function displayResults(data) {
    let html = '<h3>Classification Results:</h3><ul>';
    for (const [label, score] of Object.entries(data)) {
        html += `<li>${label}: ${(score * 100).toFixed(2)}%</li>`;
    }
    html += '</ul>';
    resultsDiv.innerHTML = html;
};
