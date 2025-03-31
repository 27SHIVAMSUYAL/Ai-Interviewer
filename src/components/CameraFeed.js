"use client";
import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import cv from "opencv.js"; // Load OpenCV

const CameraFeed = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [confidence, setConfidence] = useState(0);
  const [isCheating, setIsCheating] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const faceLandmarker = await FaceLandmarker.createFromOptions(
        filesetResolver,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker.task",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        }
      );

      startCamera(faceLandmarker);
    };
    loadModel();
  }, []);

  const startCamera = (faceLandmarker) => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          processFrame(faceLandmarker);
        })
        .catch((err) => console.error("Error accessing camera: ", err));
    }
  };

  const processFrame = (faceLandmarker) => {
    const fps = 30;
    setInterval(() => {
      if (videoRef.current.readyState === 4) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const video = videoRef.current;

        // Create OpenCV Mat from Video
        const src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
        const cap = new cv.VideoCapture(video);
        cap.read(src);

        // Convert to ImageBitmap for MediaPipe
        const img = new ImageData(
          new Uint8ClampedArray(src.data),
          video.videoWidth,
          video.videoHeight
        );

        faceLandmarker.detectForVideo(img, performance.now()).then((results) => {
          handleResults(results);
        });
        src.delete(); // Clean up memory
      }
    }, 1000 / fps);
  };

  const handleResults = (results) => {
    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];
      drawCanvas(landmarks);

      // Confidence Detection
      setConfidence(results.faceBlendshapes[0].score.toFixed(2));

      // Cheating Detection
      checkCheating(landmarks);
    }
  };

  const checkCheating = (landmarks) => {
    const leftEye = landmarks[159];
    const rightEye = landmarks[386];

    const dx = rightEye.x - leftEye.x;
    const dy = rightEye.y - leftEye.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    if (angle > 15 || angle < -15) {
      setIsCheating(true);
    } else {
      setIsCheating(false);
    }
  };

  const drawCanvas = (landmarks) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 640;
    canvas.height = 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 2;

    landmarks.forEach((point) => {
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>🎥 Face Mesh Cheating & Confidence Detection</h2>
      <video
        ref={videoRef}
        style={{ width: "640px", height: "480px", borderRadius: "10px" }}
        autoPlay
        muted
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <div style={{ marginTop: "20px" }}>
        <h3>Confidence: {confidence * 100}%</h3>
        <h3>
          Status:{" "}
          <span
            style={{
              color: isCheating ? "red" : "green",
              fontWeight: "bold",
            }}
          >
            {isCheating ? "Cheating Detected 🚨" : "Focused ✅"}
          </span>
        </h3>
      </div>
    </div>
  );
};

export default CameraFeed;
