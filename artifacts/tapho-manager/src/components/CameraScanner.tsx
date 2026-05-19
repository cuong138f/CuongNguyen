import React, { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2, CheckCircle, AlertCircle, RotateCcw } from "lucide-react";

interface ScannedItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface CameraScannerProps {
  onDetected: (items: ScannedItem[]) => void;
  onClose: () => void;
}

export default function CameraScanner({ onDetected, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<"camera" | "preview" | "scanning" | "result">("camera");
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const startCamera = useCallback(async (facing: "environment" | "user") => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError("Không thể mở camera. Hãy thử upload ảnh thay thế.");
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode, startCamera]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    setMode("preview");
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result as string);
      setMode("preview");
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    reader.readAsDataURL(file);
  }, []);

  const retake = useCallback(() => {
    setCapturedImage("");
    setError("");
    setMode("camera");
    startCamera(facingMode);
  }, [facingMode, startCamera]);

  const scanImage = useCallback(async () => {
    if (!capturedImage) return;
    setMode("scanning");
    setError("");
    try {
      const base64 = capturedImage.split(",")[1];
      const mimeType = capturedImage.split(";")[0].split(":")[1] || "image/jpeg";
      const res = await fetch("/api/scan-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi phân tích");
      if (!data.items || data.items.length === 0) {
        setError("Không nhận dạng được sản phẩm nào. Hãy thử chụp rõ hơn.");
        setMode("preview");
        return;
      }
      setScannedItems(data.items);
      setMode("result");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể phân tích ảnh");
      setMode("preview");
    }
  }, [capturedImage]);

  const confirm = useCallback(() => {
    onDetected(scannedItems);
    onClose();
  }, [scannedItems, onDetected, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">
              {mode === "camera" && "Chụp ảnh sản phẩm"}
              {mode === "preview" && "Xem lại ảnh"}
              {mode === "scanning" && "Đang nhận dạng..."}
              {mode === "result" && "Kết quả nhận dạng"}
            </span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Camera view */}
          {mode === "camera" && (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70 p-6 text-center">
                    <AlertCircle className="w-10 h-10" />
                    <p className="text-sm">{cameraError}</p>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-2">
                {!cameraError && (
                  <>
                    <Button
                      type="button"
                      onClick={capture}
                      className="flex-1 gap-2 rounded-full"
                    >
                      <Camera className="w-4 h-4" />
                      Chụp ảnh
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setFacingMode((f) => f === "environment" ? "user" : "environment")}
                      title="Đổi camera"
                      className="rounded-full"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className={`gap-2 rounded-full ${cameraError ? "flex-1" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Upload ảnh
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <p className="text-xs text-muted-foreground text-center">
                Chụp ảnh các sản phẩm — AI sẽ tự nhận dạng và tính tiền
              </p>
            </div>
          )}

          {/* Preview */}
          {(mode === "preview" || mode === "scanning") && capturedImage && (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden aspect-video bg-black">
                <img src={capturedImage} alt="captured" className="w-full h-full object-contain" />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={retake} className="gap-2 rounded-full flex-1" disabled={mode === "scanning"}>
                  <RotateCcw className="w-4 h-4" />
                  Chụp lại
                </Button>
                <Button type="button" onClick={scanImage} className="gap-2 rounded-full flex-1" disabled={mode === "scanning"}>
                  {mode === "scanning" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Đang nhận dạng...</>
                  ) : (
                    <><Camera className="w-4 h-4" /> Nhận dạng</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Result */}
          {mode === "result" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle className="w-5 h-5" />
                Nhận dạng được {scannedItems.length} sản phẩm
              </div>
              <div className="rounded-xl border divide-y max-h-52 overflow-y-auto">
                {scannedItems.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between px-3 py-2.5 text-sm">
                    <span className="font-medium flex-1 pr-2 line-clamp-1">{item.productName}</span>
                    <span className="text-muted-foreground mr-3">x{item.quantity}</span>
                    <span className="text-primary font-semibold whitespace-nowrap">
                      {(item.unitPrice * item.quantity).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-1 text-sm font-semibold">
                <span>Tổng cộng</span>
                <span className="text-primary text-base">
                  {scannedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0).toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" onClick={retake} className="gap-2 rounded-full flex-1">
                  <RotateCcw className="w-4 h-4" />
                  Chụp lại
                </Button>
                <Button type="button" onClick={confirm} className="gap-2 rounded-full flex-1">
                  <CheckCircle className="w-4 h-4" />
                  Thêm vào đơn
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
