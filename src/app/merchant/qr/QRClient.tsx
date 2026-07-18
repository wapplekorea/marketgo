"use client";

import { useEffect, useRef } from "react";

type Store = { id: string; name: string; markets?: { id: string; name: string } | null };

export default function QRClient({ store, menuUrl }: { store: Store; menuUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // QR 코드 생성 (qrcode 라이브러리 동적 import)
    import("qrcode").then(QRCode => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, menuUrl, {
          width: 280,
          margin: 2,
          color: { dark: "#1a1a1a", light: "#ffffff" },
        });
      }
    });
  }, [menuUrl]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `${store.name}-QR.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  return (
    <div className="px-4 py-8 pb-24 flex flex-col items-center">
      <h1 className="text-lg font-bold text-gray-900 mb-1">QR 코드</h1>
      <p className="text-sm text-gray-500 mb-6 text-center">
        손님이 이 QR 코드를 스캔하면<br />주문 메뉴 화면으로 이동합니다
      </p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-4">
        <p className="text-sm font-semibold text-gray-900">{store.name}</p>
        <p className="text-xs text-gray-400">{store.markets?.name}</p>
        <canvas ref={canvasRef} className="rounded-xl" />
        <p className="text-xs text-gray-400 break-all text-center max-w-xs">{menuUrl}</p>
      </div>

      <button
        onClick={download}
        className="mt-6 w-full max-w-xs bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition-colors"
      >
        QR 이미지 저장
      </button>

      <button
        onClick={() => navigator.clipboard.writeText(menuUrl)}
        className="mt-2 w-full max-w-xs bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
      >
        링크 복사
      </button>
    </div>
  );
}
