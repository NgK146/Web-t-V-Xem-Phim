import React, { useEffect, useRef, useState, useCallback } from 'react';

const QRScanner = ({ onScanSuccess, onScanFailure }) => {
  const scannerRef = useRef(null);
  const isScanned = useRef(false);
  const mountedRef = useRef(true);
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // State 2 = SCANNING, State 3 = PAUSED
        if (state === 2 || state === 3) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        // Ignore stop errors
      }
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    try {
      setError(null);
      setStarted(false);

      // Đảm bảo dừng scanner cũ trước
      await stopScanner();

      const el = document.getElementById('qr-reader-region');
      if (!el) return;

      // Clear nội dung cũ trong container
      el.innerHTML = '';

      const { Html5Qrcode } = await import('html5-qrcode');
      if (!mountedRef.current) return;

      const scanner = new Html5Qrcode('qr-reader-region');
      scannerRef.current = scanner;
      isScanned.current = false;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      // Thử mở camera — dùng facingMode trước, nếu fail thì thử cameraId
      let success = false;

      // Cách 1: facingMode environment (camera sau)
      try {
        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (isScanned.current) return;
            isScanned.current = true;
            scanner.stop().catch(() => {});
            scannerRef.current = null;
            setStarted(false);
            onScanSuccess(decodedText);
          },
          () => {}
        );
        success = true;
      } catch (e1) {
        console.warn('facingMode environment failed:', e1);

        // Cách 2: facingMode user (camera trước)
        try {
          const scanner2 = new Html5Qrcode('qr-reader-region');
          scannerRef.current = scanner2;
          await scanner2.start(
            { facingMode: 'user' },
            config,
            (decodedText) => {
              if (isScanned.current) return;
              isScanned.current = true;
              scanner2.stop().catch(() => {});
              scannerRef.current = null;
              setStarted(false);
              onScanSuccess(decodedText);
            },
            () => {}
          );
          success = true;
        } catch (e2) {
          console.warn('facingMode user failed:', e2);

          // Cách 3: Lấy camera ID trực tiếp
          try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
              el.innerHTML = '';
              const scanner3 = new Html5Qrcode('qr-reader-region');
              scannerRef.current = scanner3;
              await scanner3.start(
                devices[0].id,
                config,
                (decodedText) => {
                  if (isScanned.current) return;
                  isScanned.current = true;
                  scanner3.stop().catch(() => {});
                  scannerRef.current = null;
                  setStarted(false);
                  onScanSuccess(decodedText);
                },
                () => {}
              );
              success = true;
            }
          } catch (e3) {
            console.warn('direct cameraId failed:', e3);
          }
        }
      }

      if (!mountedRef.current) return;

      if (success) {
        setStarted(true);
        setError(null);
      } else {
        throw new Error('Không thể mở bất kỳ camera nào');
      }
    } catch (err) {
      console.error('QRScanner error:', err);
      if (!mountedRef.current) return;

      const msg = String(err?.message || err || '');
      if (msg.includes('NotAllowed') || msg.includes('Permission')) {
        setError('not_allowed');
      } else if (msg.includes('NotFound') || msg.includes('device not found')) {
        setError('not_found');
      } else {
        setError('other');
      }
    }
  }, [onScanSuccess, stopScanner]);

  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => startScanner(), 200);
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [startScanner, stopScanner, retryCount]);

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };

  const renderError = () => {
    if (!error) return null;

    let title, tips;
    if (error === 'not_allowed') {
      title = 'Chưa cấp quyền camera';
      tips = [
        'Nhấn biểu tượng 🔒 trên thanh địa chỉ',
        'Tìm "Camera" → chuyển sang "Cho phép"',
        'Tải lại trang (F5)'
      ];
    } else if (error === 'not_found') {
      title = 'Không tìm thấy camera';
      tips = [
        'Kiểm tra camera đã được kết nối',
        'Thử cắm lại USB camera',
        'Kiểm tra Device Manager'
      ];
    } else {
      title = 'Không thể mở camera';
      tips = [
        'Đóng các tab trình duyệt khác đang dùng camera',
        'Đóng Zoom, Teams, Skype... nếu đang chạy',
        'Nhấn "Thử lại" bên dưới'
      ];
    }

    return (
      <div style={{
        padding: '20px',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: '12px',
        marginBottom: '16px',
        textAlign: 'left'
      }}>
        <div style={{ color: '#f87171', fontWeight: '600', fontSize: '15px', marginBottom: '10px' }}>
          ⚠️ {title}
        </div>
        <ul style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.8', margin: '0', paddingLeft: '20px' }}>
          {tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
        <button
          onClick={handleRetry}
          style={{
            marginTop: '14px',
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #e71a0f, #ff4444)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🔄 Thử lại
        </button>
      </div>
    );
  };

  return (
    <div className="qr-scanner-wrapper">
      {renderError()}

      <div id="qr-reader-region" style={{ width: '100%' }} />

      {started && (
        <div style={{
          padding: '12px',
          textAlign: 'center',
          color: '#4ade80',
          fontSize: '13px',
          fontWeight: '600',
        }}>
          📸 Camera đang hoạt động — Đưa mã QR vào khung hình
        </div>
      )}

      {!started && !error && (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: '#aaa',
          fontSize: '14px'
        }}>
          ⏳ Đang kết nối camera...
        </div>
      )}
    </div>
  );
};

export default QRScanner;
