import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import { useNavigate } from "react-router-dom";

const QRScanner = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [qrResult, setQrResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();
  const videoConstraints = {
    width: 420,
    height: 420,
    facingMode: "environment", // use "user" for laptop front cam
  };

  // Scan loop with useCallback to prevent infinite re-renders
  const scanQRCode = useCallback(() => {
    if (!isScanning) return;
    
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanQRCode);
      return;
    }

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame onto canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      setQrResult(code.data);
      setIsScanning(false);
      setIsCameraStarted(false); // stop after finding QR
    } else {
      requestAnimationFrame(scanQRCode); // keep scanning
    }
  }, [isScanning]);

  // Start scanning when camera is active
  useEffect(() => {
    if (isScanning) {
      scanQRCode();
    }
  }, [isScanning, scanQRCode]);

  const startCamera = () => {
    setQrResult(null);
    setIsCameraStarted(true);
  };

  const stopCamera = () => {
    setIsCameraStarted(false);
    setIsScanning(false);
  };

  // Handle when webcam is ready
  const onUserMedia = () => {
    console.log("Camera started, beginning scan...");
    setIsScanning(true);
  };

  const onUserMediaError = (error) => {
    console.error("Camera error:", error);
    setIsCameraStarted(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '20px',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>Scan QR Code</h2>

      {qrResult && (
        <div style={{
          padding: '10px 20px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '5px',
          color: '#155724'
        }}>
          ✅ QR Code: <a href="#" onClick={()=>{navigate('/migrant')}}>{qrResult}</a>
        </div>
      )}

      {!isCameraStarted ? (
        <button 
          onClick={startCamera}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Start Camera
        </button>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '15px' 
        }}>
          <Webcam
            ref={webcamRef}
            audio={false}
            videoConstraints={videoConstraints}
            onUserMedia={onUserMedia}
            onUserMediaError={onUserMediaError}
            style={{
              width: '420px',
              height: '420px',
              border: '2px solid #ddd',
              borderRadius: '10px'
            }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={stopCamera}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Stop Camera
            </button>
            
            <button 
              onClick={() => setQrResult(null)}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Scan Again
            </button>
          </div>
          
          {isScanning && (
            <p style={{ color: '#666', fontSize: '14px' }}>
              📱 Point camera at QR code...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QRScanner;