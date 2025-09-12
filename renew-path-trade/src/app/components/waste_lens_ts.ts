import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';

// Define a type for the classification result for type safety
interface ClassificationResult {
  label: string;
  score: number;
}

@Component({
  selector: 'app-waste-lens',
  templateUrl: './waste-lens.component.html',
  styleUrls: ['./waste-lens.component.css']
})
export class WasteLensComponent implements OnInit, OnDestroy {
  // Get references to the HTML elements from the template
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('resultsElement') resultsElement!: ElementRef<HTMLDivElement>;

  // Component state
  isLoading: boolean = false;
  classificationResult: ClassificationResult | null = null;
  private stream: MediaStream | null = null;

  // This method is called when the component is first initialized
  ngOnInit(): void {
    this.startCamera();
  }

  // This method is called when the component is removed from the view
  ngOnDestroy(): void {
    this.stopCamera();
  }

  async startCamera() {
    try {
      // Access the user's camera
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Prefer the rear camera
      });
      // Stream the video to the video element
      this.videoElement.nativeElement.srcObject = this.stream;
    } catch (err) {
      console.error("Error accessing camera: ", err);
      alert("Could not access the camera. Please ensure you have given permission.");
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  async captureAndClassify() {
    if (!this.stream) {
      alert('Camera is not active.');
      return;
    }
    
    this.isLoading = true;
    this.classificationResult = null; // Clear previous results

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    
    // Set canvas dimensions to match the video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto the canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert the canvas image to a Blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          // *** THIS IS WHERE YOU SEND THE IMAGE TO YOUR MODEL ***
          await this.sendImageToModel(blob);
        }
        this.isLoading = false;
      }, 'image/jpeg');
    } else {
        this.isLoading = false;
    }
  }

  /**
   * Sends the captured image blob to the backend API for classification.
   * @param imageBlob The image data as a Blob.
   */
  async sendImageToModel(imageBlob: Blob) {
    // A. Create a FormData object to send the file
    const formData = new FormData();
    formData.append('image', imageBlob, 'waste.jpg');

    // B. Replace with your actual backend API endpoint
    const apiEndpoint = 'YOUR_BACKEND_API_ENDPOINT_HERE';

    console.log('Sending image to the backend...');

    // C. Use fetch to send the POST request
    try {
        /*
        // UNCOMMENT THIS SECTION WHEN YOUR BACKEND IS READY
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data: ClassificationResult = await response.json();
        this.classificationResult = data;
        console.log('Classification successful:', data);
        */

       // --- Placeholder for demonstration ---
       // Simulate a network delay and return a mock result
       await new Promise(resolve => setTimeout(resolve, 1500)); 
       const mockResult: ClassificationResult = { label: 'Plastic Bottle (PET)', score: 0.92 };
       this.classificationResult = mockResult;
       console.log('Using mock result:', mockResult);
       // --- End of placeholder ---


    } catch (error) {
        console.error('Failed to classify image:', error);
        alert('An error occurred during classification. Please try again.');
        this.classificationResult = { label: 'Error', score: 0 };
    }
  }
}