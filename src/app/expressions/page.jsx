"use client"
import dynamic from "next/dynamic";
import { useState } from "react";

const WebcamDetection = dynamic(() => import("@/components/WebCamDetection"), { ssr: false });

export default function WebcamDetect() {
  const [start, setStart] = useState(false);

  return (
    

      <WebcamDetection />
  
  );
}
