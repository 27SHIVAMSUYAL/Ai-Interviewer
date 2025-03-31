"use client";
import React, { useRef, useEffect, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import Webcam from 'react-webcam';

const WebcamDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [eyeGazeData, setEyeGazeData] = useState(null);
  const [expressionData, setExpressionData] = useState(null);

  useEffect(() => {
    async function createFaceLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const faceLandmarkerInstance = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          refineLandmarks: true,
          shouldLoadIrisModel: true,
        });
        setFaceLandmarker(faceLandmarkerInstance);
      } catch (error) {
        console.error("Failed to load MediaPipe Face Landmarker:", error);
      }
    }
    createFaceLandmarker();
  }, []);

  useEffect(() => {
    let animationFrameId;

    async function detectFaces() {
      if (faceLandmarker && webcamRef.current && webcamRef.current.video) {
        const video = webcamRef.current.video;

        if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
          animationFrameId = requestAnimationFrame(detectFaces);
          return;
        }

        try {
          const timestamp = Date.now();
          const faceResults = await faceLandmarker.detectForVideo(video, timestamp);

          if (faceResults && faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
            drawCanvas(faceResults.faceLandmarks);
            detectCheating(faceResults.faceLandmarks);
            setEyeGazeData(calculateEyeGaze(faceResults.faceLandmarks[0]));
            setExpressionData(getExpressions(faceResults));
          } else {
            clearCanvas();
            setCheatingDetected(false);
            setEyeGazeData(null);
            setExpressionData(null);
          }
        } catch (error) {
          console.error("Error during detection:", error);
        }
      }
      animationFrameId = requestAnimationFrame(detectFaces);
    }

    if (faceLandmarker) {
      detectFaces();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [faceLandmarker]);

  const drawCanvas = (faceLandmarks) => {
    if (canvasRef.current && webcamRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = webcamRef.current.video;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const color = cheatingDetected ? 'red' : 'hsla(106, 62.70%, 68.40%, 0.60)';

      if (faceLandmarks && faceLandmarks.length > 0) {
        for (const landmarks of faceLandmarks) {
          for (const point of landmarks) {
            const x = point.x * canvas.width;
            const y = point.y * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          }
        }
      }
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const detectCheating = (faceLandmarks) => {
    if (faceLandmarks.length > 1) {
      setCheatingDetected(true);
    } else if (faceLandmarks.length === 1) {
      const landmarks = faceLandmarks[0];
      const eyeGaze = calculateEyeGaze(landmarks);
      if (eyeGaze && (Math.abs(eyeGaze.horizontal) > 2.5 || Math.abs(eyeGaze.vertical) > 0.3)) {
        setCheatingDetected(true);
      } else {
        setCheatingDetected(false);
      }
    } else {
      setCheatingDetected(false);
    }
  };

  const calculateEyeGaze = (landmarks) => {
    if (!landmarks) return null;

    const leftEye = { left: landmarks[33], right: landmarks[133], top: landmarks[159], bottom: landmarks[145] };
    const rightEye = { left: landmarks[362], right: landmarks[263], top: landmarks[386], bottom: landmarks[374] };

    if (leftEye.left && rightEye.right) {
      const horizontalMovement = Math.abs(leftEye.left.x - rightEye.right.x);
      const verticalMovement = Math.abs(leftEye.top.y - rightEye.bottom.y);
      return { horizontal: horizontalMovement, vertical: verticalMovement };
    }
    return null;
  };

  const getExpressions = (faceResults) => {
    if (!faceResults || !faceResults.faceLandmarks || faceResults.faceLandmarks.length === 0) {
      return null;
    }
    return { expression: "Neutral", confidence: 1 };
  };

  return (
    <div className="relative">
      <Webcam
        ref={webcamRef}
        width={640}
        height={480}
        className="rounded-lg"
        style={{ pointerEvents: "none" }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 rounded-lg"
        style={{ pointerEvents: "none" }}
      />
      {cheatingDetected && <p className="text-red-500 mt-2">Cheating Detected!</p>}
      {eyeGazeData && (
        <p className="text-white mt-2">
          Eye Gaze: H: {eyeGazeData.horizontal.toFixed(2)}, V: {eyeGazeData.vertical.toFixed(2)}
        </p>
      )}
    </div>
  );
};

export default WebcamDetection;
