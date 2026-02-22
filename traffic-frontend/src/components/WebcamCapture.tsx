import { useEffect, useRef, useState } from "react";
import type { TrafficImageResponse } from "../types/traffic";

interface WebcamCaptureProps {
  onResult: (data: TrafficImageResponse) => void;
}

const WebcamCapture = ({ onResult }: WebcamCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🎥 Start webcam safely with cleanup
  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: "environment" } },
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        }
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            if (mounted) setReady(true);
          };
        }
      } catch (err) {
        setError(
          err instanceof DOMException
            ? err.name
            : "Failed to access camera"
        );
      }
    };

    startCamera();

    // Cleanup: stop all tracks when unmounting
    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 📸 Capture frame with better error handling
  const captureFrame = async () => {
    setError(null);
    setLoading(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) {
        setError("Internal error: missing video or canvas");
        return;
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError("Camera not ready yet");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Failed to get canvas context");
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );

      if (!blob) {
        setError("Failed to create image");
        return;
      }

      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      const res = await fetch("http://localhost:8000/detect-traffic-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data: TrafficImageResponse = await res.json();
      onResult(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process image";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-xl w-full bg-black"
      />
      <canvas ref={canvasRef} className="hidden" />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        onClick={captureFrame}
        disabled={!ready || loading}
        className={`px-4 py-2 rounded-lg font-semibold transition-opacity ${
          ready && !loading
            ? "bg-cyan-500 text-black hover:bg-cyan-400"
            : "bg-slate-600 text-slate-300 cursor-not-allowed"
        }`}
      >
        {loading ? "Processing..." : "Capture Frame"}
      </button>
    </div>
  );
};

export default WebcamCapture;