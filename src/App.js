import React, { useEffect, useRef, useState } from "react";

function App() {
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // 셀카 모드로 설정
          },
        });
        // 카메라 액세스 허용됨
        setPermissionGranted(true);
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        // 권한 거부 또는 오류 발생
        console.error("카메라 액세스 거부:", error);
        setPermissionGranted(false);
      }
    };

    // 페이지 진입 시 권한 확인
    if (permissionGranted === null) {
      requestCameraPermission();
    }

    // 페이지 벗어날 때 스트림 해제
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [permissionGranted, videoStream]);

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-bold py-8 text-center">
        QR Code Generator & Scanner
      </h1>

      {/* QR Code Scanner */}
      <div
        className="qrZone"
        style={{
          position: "relative",
          width: "300px",
          height: "300px",
          overflow: "hidden",
        }}
      >
        {true && (
          <video
            id="videoElement"
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          ></video>
        )}
        {true && (
          <canvas
            id="canvasElement"
            ref={canvasRef}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
          ></canvas>
        )}
      </div>
    </div>
  );
}

export default App;
