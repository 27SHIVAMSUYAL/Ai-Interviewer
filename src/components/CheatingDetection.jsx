"use client";
import React, { useRef, useEffect, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import Webcam from 'react-webcam';

const CheatingDetectionComponent = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  const [cheatingDetected, setCheatingDetected] = useState(false);

  useEffect(() => {
    async function createFaceLandmarker() {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 2, // Check for multiple faces
      });
      setFaceLandmarker(landmarker);
    }
    createFaceLandmarker();
  }, []);

  useEffect(() => {
    async function detectFaces() {
      if (faceLandmarker && webcamRef.current && webcamRef.current.video) {
        const video = webcamRef.current.video;
        const estimationResult = faceLandmarker.detectForVideo(video, Date.now());

        if (estimationResult.faceLandmarks && estimationResult.faceLandmarks.length > 0) {
          drawCanvas(estimationResult.faceLandmarks);
          detectCheating(estimationResult.faceLandmarks);
        } else {
          clearCanvas();
          setCheatingDetected(false);
        }
      }
      requestAnimationFrame(detectFaces);
    }
    detectFaces();
  }, [faceLandmarker]);

  const drawCanvas = (faceLandmarks) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const landmarks of faceLandmarks) {
        for (const point of landmarks) {
          ctx.beginPath();
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 2, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
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
      setCheatingDetected(true); // Multiple faces detected
      console.log('Cheating Detected: Multiple faces');
    } else if (faceLandmarks.length === 1) {
      const landmarks = faceLandmarks[0];
      const eyeGaze = calculateEyeGaze(landmarks);
      if (eyeGaze) {
        console.log("Eye Gaze: ", eyeGaze);
      }
      if (eyeGaze && (Math.abs(eyeGaze.horizontal) > 0.3 || Math.abs(eyeGaze.vertical) > 0.3)) {
        setCheatingDetected(true); // Excessive eye movement
        console.log('Cheating Detected: Excessive eye movement');
      } else {
        setCheatingDetected(false);
      }
    } else {
      setCheatingDetected(false);
    }

    //send data to gemini.
    sendCheatingDataToGemini(cheatingDetected);
  };

  const calculateEyeGaze = (landmarks) => {
    const leftEye = {
      left: landmarks[33],
      right: landmarks[133],
      top: landmarks[159],
      bottom: landmarks[145],
    };

    const rightEye = {
      left: landmarks[362],
      right: landmarks[263],
      top: landmarks[386],
      bottom: landmarks[374],
    };

    if (leftEye.left && leftEye.right && leftEye.top && leftEye.bottom && rightEye.left && rightEye.right && rightEye.top && rightEye.bottom) {
      const horizontalLeft = (landmarks[468].x + landmarks[468].x) / 2 - (leftEye.left.x + leftEye.right.x) / 2;
      const verticalLeft = (landmarks[468].y + landmarks[468].y) / 2 - (leftEye.top.y + leftEye.bottom.y) / 2;

      const horizontalRight = (landmarks[473].x + landmarks[473].x) / 2 - (rightEye.left.x + rightEye.right.x) / 2;
      const verticalRight = (landmarks[473].y + landmarks[473].y) / 2 - (rightEye.top.y + rightEye.bottom.y) / 2;

      return {
        horizontal: (horizontalLeft + horizontalRight) / 2,
        vertical: (verticalLeft + verticalRight) / 2,
      };
    }

    return null;
  };

  const sendCheatingDataToGemini = (cheatingDetected) => {
    // Implement your Gemini API call here.
    if(cheatingDetected){
      console.log("Cheating detected, sending data to Gemini");
    }
  };

  return (
    <div>
      <Webcam ref={webcamRef} style={{ width: 640, height: 480 }} />
      <canvas ref={canvasRef} width={640} height={480} style={{ position: 'absolute', top: 0, left: 0 }} />
      {cheatingDetected && <p style={{ color: 'red' }}>Cheating Detected!</p>}
    </div>
  );
};

export default CheatingDetectionComponent;