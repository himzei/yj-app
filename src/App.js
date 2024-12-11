import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

function App() {
  const [userLocation, setUserLocation] = useState({});
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const [qrData, setQrData] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (error) => {
          console.log(error);
          return { error };
        }
      );
    } else {
      console.error("브라우저가 Geolocation API를 지원하지 않습니다.");
      return { error: "브라우저가 Geolocation API를 지원하지 않습니다." };
    }
  }, []);
  console.log(userLocation);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
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

  useEffect(() => {
    if (qrData) {
      // qrData가 변경될 때마다 서버에 데이터 전송
      alert(`${qrData}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrData]);

  useEffect(() => {
    if (true && videoStream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const canvasContext = canvas.getContext("2d");

      const scan = () => {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = videoWidth;
          canvas.height = videoHeight;
          canvasContext.clearRect(0, 0, canvas.width, canvas.height); // 이전 프레임 지우기
          canvasContext.drawImage(video, 0, 0, videoWidth, videoHeight);
          const imageData = canvasContext.getImageData(
            0,
            0,
            videoWidth,
            videoHeight
          );
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            setQrData(code.data);
          }
        }
        requestAnimationFrame(scan);
      };

      // const scanQRCode = async () => {
      //   const dectector = new QRCodeDetector({
      //     formats: ["code_39", "codabar", "ean_13"],
      //   });

      //   async function detect() {
      //     if (!video || !canvas) return;

      //     canvasContext.drawImage(video, 0, 0, videoWidth, videoHeight);

      //     try {
      //       const barcodes = await dectector.detect(canvas);
      //       barcodes.forEach((barcode) => {
      //         // Draw a border around the QR code
      //         const { boundingBox } = barcode;
      //         canvasContext.strokeStyle = "red";
      //         canvasContext.lineWidth = 4;
      //         canvasContext.strokeRect(
      //           boundingBox.x,
      //           boundingBox.y,
      //           boundingBox.width,
      //           boundingBox.height
      //         );

      //         console.log("Detected QR code:", barcode.rawValue);
      //       });
      //     } catch (err) {
      //       console.error("Error detecting QR code:", err);
      //     }

      //     requestAnimationFrame(detect);
      //   }

      //   detect();
      // };

      // scanQRCode();

      requestAnimationFrame(scan);
    }
  }, [permissionGranted, videoStream]);

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-bold py-8 text-center">
        QR Code Generator & Scanner
      </h1>

      {/* QR Code Scanner */}
      <div className="w-full h-[500px] relative">
        {true && (
          // playinline 전체화면으로 재생되지 않고 화면안에서 재생
          <video
            className="border absolute inset-0 w-full h-full"
            id="videoElement"
            ref={videoRef}
            autoPlay={true}
            playsInline
          ></video>
        )}
        {true && (
          <canvas
            className="absolute inset-0 w-full h-full"
            id="canvasElement"
            ref={canvasRef}
          ></canvas>
        )}
      </div>
    </div>
  );
}

export default App;
