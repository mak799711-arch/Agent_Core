"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

export default function QRScanner({ onScanSuccess, onScanFailure }: QRScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!scannerRef.current || initialized.current) return;
    initialized.current = true;
    
    // We append a random ID so multiple instances don't clash
    const elementId = "qr-reader-audit";
    scannerRef.current.id = elementId;

    const scanner = new Html5QrcodeScanner(
      elementId,
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );
    
    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScanSuccess(decodedText);
      },
      (err) => {
        if (onScanFailure) onScanFailure(err);
      }
    );
    
    return () => {
      scanner.clear().catch(console.error);
      initialized.current = false;
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="qr-scanner-container" style={{ width: '100%', maxWidth: '500px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden' }}>
      <div ref={scannerRef} style={{ width: '100%' }} />
    </div>
  );
}
