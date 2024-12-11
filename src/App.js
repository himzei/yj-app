import React, { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";

function App() {
  const [qrText, setQrText] = useState("");
  const [generatedQR, setGeneratedQR] = useState("");
  const [scannedData, setScannedData] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  // Generate QR code
  const generateQRCode = async () => {
    try {
      const qrCode = await QRCode.toDataURL(qrText);
      setGeneratedQR(qrCode);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  // Start scanning QR code
  const startScanning = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          video.srcObject = stream;
          video.play();

          setIsScanning(true);

          const scan = () => {
            if (!isScanning) return;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const code = jsQR(
              imageData.data,
              imageData.width,
              imageData.height
            );

            if (code) {
              setScannedData(code.data);
              stopScanning();
            } else {
              requestAnimationFrame(scan);
            }
          };

          requestAnimationFrame(scan);
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
        });
    }
  };

  // Stop scanning QR code
  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsScanning(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>QR Code Generator & Scanner</h1>

      {/* QR Code Generator */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Generate QR Code</h2>
        <input
          type="text"
          value={qrText}
          onChange={(e) => setQrText(e.target.value)}
          placeholder="Enter text to generate QR"
          style={{ padding: "10px", marginRight: "10px", width: "300px" }}
        />
        <button onClick={generateQRCode} style={{ padding: "10px" }}>
          Generate
        </button>
        {generatedQR && (
          <div style={{ marginTop: "20px" }}>
            <h3>Generated QR Code:</h3>
            <img src={generatedQR} alt="Generated QR Code" />
          </div>
        )}
      </div>

      {/* QR Code Scanner */}
      <div>
        <h2>Scan QR Code</h2>
        <button
          onClick={isScanning ? stopScanning : startScanning}
          style={{ padding: "10px", marginBottom: "10px" }}
        >
          {isScanning ? "Stop Scanning" : "Start Scanning"}
        </button>
        <div style={{ marginTop: "10px" }}>
          <video
            ref={videoRef}
            style={{
              display: isScanning ? "block" : "none",
              width: "400px",
              height: "300px",
              border: "1px solid black",
            }}
          />
          <canvas
            ref={canvasRef}
            style={{ display: "none", width: "400px", height: "300px" }}
          />
        </div>
        {scannedData && (
          <div style={{ marginTop: "20px" }}>
            <h3>Scanned Data:</h3>
            <p>{scannedData}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
