import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";

/** Generate QR matrix for a given text string (simplified implementation) */
function generateQRMatrix(text: string): number[][] {
  const size = 25;
  const matrix: number[][] = Array.from({ length: size }, () => Array(size).fill(0));

  // Finder patterns (top-left, top-right, bottom-left)
  const addFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (row + r < size && col + c < size) {
          const isEdge = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[row + r][col + c] = isEdge || isInner ? 1 : 0;
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // Encode text into remaining space (simplified: scatter based on char codes)
  const bytes = Array.from(text).map((c) => c.charCodeAt(0));
  let idx = 0;
  outer: for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5; // skip timing column
    for (let row = 0; row < size; row++) {
      for (let c = 0; c < 2; c++) {
        const x = col - c;
        if (matrix[row][x] === 0) {
          const byte = bytes[idx % bytes.length] ?? 0;
          const bit = (byte >> ((idx + row) % 8)) & 1;
          matrix[row][x] = bit ^ ((row + x) % 2 === 0 ? 1 : 0);
          idx++;
          if (idx > 300) break outer;
        }
      }
    }
  }

  // Version info area (simplified)
  for (let i = 0; i < 15; i++) {
    const r = Math.floor(i / 3);
    const c = size - 11 + (i % 3);
    if (r < size && c >= 0) matrix[r][c] = i % 2;
  }

  return matrix;
}

/** Render a QR matrix as an SVG string */
function matrixToSVG(matrix: number[][], size: number): string {
  const cell = size / matrix.length;
  const rects = matrix
    .flatMap((row, r) =>
      row.map((cell, c) =>
        cell ? `<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}"/>` : ""
      )
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${rects}</svg>`;
}

const QRScanner = () => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrSvg, setQrSvg] = useState("");
  const siteUrl =
    typeof window !== "undefined" ? `${window.location.origin}/token/services` : "http://localhost:3000/token/services";

  // Generate QR matrix and draw to canvas + SVG fallback
  useEffect(() => {
    const matrix = generateQRMatrix(siteUrl);
    const size = 280;

    // Draw to canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        const cell = size / matrix.length;
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = "#1a1a1a";
        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c]) {
              ctx.fillRect(c * cell, r * cell, cell + 0.5, cell + 0.5);
            }
          }
        }
      }
    }

    // Also generate SVG data-URI as backup
    setQrSvg(`data:image/svg+xml,${encodeURIComponent(matrixToSVG(matrix, size))}`);
  }, [siteUrl]);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* QR Display Card */}
        <Card className="backdrop-blur-md bg-white/95 lg:sticky lg:top-6">
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {t("token.scanner.title")}
              </h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                {t("token.scanner.subtitle")}
              </p>
            </div>

            {/* QR Image - high contrast, large modules */}
            <a href={siteUrl} className="inline-block" aria-label="Open site">
              <div className="w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-white rounded-2xl shadow-inner border-2 border-gray-300 p-4 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(siteUrl)}&format=png`}
                  alt="QR code to scan for queue services"
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              </div>
            </a>

            {/* Download link */}
            <div>
              <a
                href={qrSvg}
                download="smart-service-flow-qr.svg"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download QR Code
              </a>
            </div>

            {/* Site URL */}
            <p className="text-sm sm:text-base text-gray-500 font-mono bg-gray-100 inline-block px-3 py-1 rounded-lg">
              {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/login
            </p>

            <p className="text-sm sm:text-base text-gray-600">
              {t("token.scanner.instructions")}
            </p>
          </div>
        </Card>

        {/* Info Panel */}
        <div className="hidden lg:block space-y-6">
          <Card className="backdrop-blur-md bg-white/95">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">
                {t("token.scanner.howItWorks")}
              </h3>
              <div className="space-y-4">
                {[
                  { num: "1", title: t("token.scanner.step1Title"), desc: t("token.scanner.step1Desc") },
                  { num: "2", title: t("token.scanner.step2Title"), desc: t("token.scanner.step2Desc") },
                  { num: "3", title: t("token.scanner.step3Title"), desc: t("token.scanner.step3Desc") },
                ].map((step) => (
                  <div key={step.num} className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="backdrop-blur-md bg-blue-50 border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">{t("token.scanner.noticeTitle")}</h4>
                <p className="text-sm text-blue-900 leading-relaxed">{t("token.scanner.noticeText")}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default QRScanner;
