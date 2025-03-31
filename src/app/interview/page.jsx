import MonacoEditor from "@/components/MonacoEditor";
import ProtectedRoute from "@/components/ProtectedRoute";
import WebcamDetection from "@/components/WebCamDetection";

export default function Interview() {
  return (
    <ProtectedRoute>
      <div style={{ padding: "2px" }}>
        <h1 style={{ fontSize: "20px" }}>Code editor</h1>
        <div className="flex">
          <MonacoEditor />
          <div className="bg-gray-800 w-55">
            <WebcamDetection />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
