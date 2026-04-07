import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanFailure }) => {
  const isScanned = useRef(false);

  useEffect(() => {
    // Tự động tạo scanner UI
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    const handleSuccessWrapper = (decodedText, decodedResult) => {
      if (isScanned.current) return;
      isScanned.current = true;
      try {
        scanner.pause(true); // Tạm dừng scanner để tránh quét thêm
      } catch (err) {}
      onScanSuccess(decodedText, decodedResult);
    };

    scanner.render(handleSuccessWrapper, onScanFailure);

    // Cleanup khi component unmount
    return () => {
      scanner.clear().catch(error => {
        console.error("Lỗi khi xoá scanner: ", error);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="qr-scanner-wrapper">
      <div id="qr-reader"></div>
    </div>
  );
};

export default QRScanner;
