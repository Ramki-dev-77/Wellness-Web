import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import { authAPI } from "../services/authAPI";

const QRScanner = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  // UI States
  const [scanMode, setScanMode] = useState('manual'); // 'manual' or 'camera'
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState('');
  
  // Camera States
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // Result States
  const [qrResult, setQrResult] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [healthRecords, setHealthRecords] = useState(null);
  const [processing, setProcessing] = useState(false);

  const videoConstraints = {
    width: 420,
    height: 420,
    facingMode: "environment", // use "user" for front camera
  };

  // Process QR data with backend
  const processQRCode = async (qrData) => {
    if (!qrData || qrData.trim() === '') {
      setError('Please enter QR data');
      return;
    }

    setProcessing(true);
    setError('');
    
    try {
      console.log('🔍 Processing QR data:', qrData);
      
      const response = await authAPI.doctorScanQR(qrData);
      console.log('📋 Scan response:', response);
      
      if (response && response.success) {
        setPatientData(response.patient);
        setHealthRecords(response.healthRecords);
        setError('');
        console.log('✅ Successfully decoded patient data');
      } else {
        setError(response?.error || 'Failed to decode QR code');
        setPatientData(null);
        setHealthRecords(null);
      }
    } catch (error) {
      console.error('❌ QR scan error:', error);
      setError('Failed to process QR code. Please try again.');
      setPatientData(null);
      setHealthRecords(null);
    } finally {
      setProcessing(false);
    }
  };

  // Handle manual input scanning
  const handleManualScan = () => {
    processQRCode(manualInput);
  };

  // Camera scanning logic
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

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      setQrResult(code.data);
      setIsScanning(false);
      setIsCameraStarted(false);
      processQRCode(code.data);
    } else {
      requestAnimationFrame(scanQRCode);
    }
  }, [isScanning]);

  useEffect(() => {
    if (isScanning) {
      scanQRCode();
    }
  }, [isScanning, scanQRCode]);

  const startCamera = () => {
    setError('');
    setPatientData(null);
    setHealthRecords(null);
    setIsCameraStarted(true);
    setScanMode('camera');
  };

  const stopCamera = () => {
    setIsCameraStarted(false);
    setIsScanning(false);
    setScanMode('manual');
  };

  const onUserMedia = () => {
    console.log("Camera started, beginning scan...");
    setIsScanning(true);
  };

  const onUserMediaError = (error) => {
    console.error("Camera error:", error);
    setIsCameraStarted(false);
    setError("Camera access denied. Please allow camera permissions.");
  };

  const resetAll = () => {
    setQrResult(null);
    setPatientData(null);
    setHealthRecords(null);
    setError('');
    setManualInput('');
    setIsCameraStarted(false);
    setIsScanning(false);
    setScanMode('manual');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '20px',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2 style={{ margin: 0, color: '#333' }}>QR Code Scanner</h2>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '15px 20px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          color: '#721c24',
          width: '100%',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Processing Indicator */}
      {processing && (
        <div style={{
          padding: '15px 20px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          color: '#856404',
          textAlign: 'center',
          width: '100%',
          maxWidth: '600px'
        }}>
          ⏳ Decrypting patient data...
        </div>
      )}

      {/* Main Content */}
      {scanMode === 'manual' && !isCameraStarted ? (
        // Manual Input Mode
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Paste encrypted QR data here"
              style={{
                width: '100%',
                height: '120px',
                padding: '15px',
                border: '1px solid #ced4da',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical',
                marginBottom: '15px'
              }}
            />
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={handleManualScan}
                disabled={processing || !manualInput.trim()}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: processing ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {processing ? '⏳ Processing...' : '🔍 Scan QR Data'}
              </button>
              
              <button 
                onClick={startCamera}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                📷 Use Camera Scanner
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Camera Mode
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '15px' 
        }}>
          <div style={{ position: 'relative' }}>
            <Webcam
              ref={webcamRef}
              audio={false}
              videoConstraints={videoConstraints}
              onUserMedia={onUserMedia}
              onUserMediaError={onUserMediaError}
              style={{
                width: '420px',
                height: '420px',
                border: '3px solid #007bff',
                borderRadius: '15px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            />
            
            {/* Scanning Overlay */}
            {isScanning && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '200px',
                border: '3px dashed #00ff00',
                borderRadius: '15px',
                pointerEvents: 'none',
                opacity: 0.8,
                animation: 'pulse 2s infinite'
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: '-40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#00ff00',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  padding: '5px 10px',
                  borderRadius: '5px'
                }}>
                  📱 Scanning...
                </div>
              </div>
            )}
          </div>
          
          <canvas ref={canvasRef} style={{ display: "none" }} />
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              onClick={stopCamera}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ⏹️ Stop Camera
            </button>
            
            <button 
              onClick={resetAll}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🔄 Start Over
            </button>
          </div>
          
          {isScanning && (
            <div style={{ 
              textAlign: 'center', 
              color: '#666', 
              fontSize: '14px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              padding: '10px 15px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <strong>📱 Point camera at patient's QR code</strong><br />
              <small>The QR code will be detected automatically</small>
            </div>
          )}
        </div>
      )}

      {/* Patient Data Display */}
      {patientData && (
        <div style={{
          padding: '20px',
          backgroundColor: '#d4edda',
          border: '2px solid #c3e6cb',
          borderRadius: '12px',
          color: '#155724',
          width: '100%',
          maxWidth: '600px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#155724', textAlign: 'center' }}>
            👤 Patient Information
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '12px', 
            fontSize: '14px' 
          }}>
            <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '6px' }}>
              <strong>Name:</strong> {patientData.name}
            </div>
            <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '6px' }}>
              <strong>ABHA:</strong> {patientData.abha}
            </div>
            <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '6px' }}>
              <strong>Mobile:</strong> {patientData.mobile}
            </div>
            <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '6px' }}>
              <strong>Region:</strong> {patientData.region}
            </div>
          </div>
        </div>
      )}

      {/* Health Records Display */}
      {healthRecords && (
        <div style={{
          padding: '20px',
          backgroundColor: '#e7f3ff',
          border: '2px solid #b8daff',
          borderRadius: '12px',
          color: '#0c5460',
          width: '100%',
          maxWidth: '600px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#0c5460', textAlign: 'center' }}>
            🏥 Health Records
          </h3>
          
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            {/* Display health records based on your backend structure */}
            <div style={{ marginBottom: '10px' }}>
              <strong>Records Available:</strong> {Object.keys(healthRecords).length} entries found
            </div>
            
            {healthRecords.observations && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Observations:</strong> {Object.keys(healthRecords.observations).length} recorded
              </div>
            )}
            
            {healthRecords.immunizations && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Immunizations:</strong> {Object.keys(healthRecords.immunizations).length} recorded
              </div>
            )}
            
            <small style={{ color: '#6c757d' }}>
              Complete health record details available in system
            </small>
          </div>
        </div>
      )}

      {/* Reset Button (when results are shown) */}
      {(patientData || healthRecords) && (
        <button 
          onClick={resetAll}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          🔄 Scan Another Patient
        </button>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.05); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
