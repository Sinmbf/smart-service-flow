import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";

/** Generate QR matrix for a given text string (simplified implementation) */
function generateQRMatrix(text: string): number[][] {
  const size = 25;
  const matrix: number[][] = Array.from({ length: size }, () => Array(size).fill(0));

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

  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  const bytes = Array.from(text).map((c) => c.charCodeAt(0));
  let idx = 0;
  outer: for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5;
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

  for (let i = 0; i < 15; i++) {
    const r = Math.floor(i / 3);
    const c = size - 11 + (i % 3);
    if (r < size && c >= 0) matrix[r][c] = i % 2;
  }

  return matrix;
}

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

  useEffect(() => {
    const matrix = generateQRMatrix(siteUrl);
    const size = 280;

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        const cell = size / matrix.length;
        canvasRef.current.width = size;
        canvasRef.current.height = size;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = "#0F4C5C";
        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c]) {
              ctx.fillRect(c * cell, r * cell, cell + 0.5, cell + 0.5);
            }
          }
        }
      }
    }

    setQrSvg(`data:image/svg+xml,${encodeURIComponent(matrixToSVG(matrix, size))}`);
  }, [siteUrl]);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* QR Display Card */}
        <Card className="lg:sticky lg:top-6">
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900">
                {t("token.scanner.title")}
              </h2>
              <p className="text-neutral-700 mt-2 text-base sm:text-lg">
                {t("token.scanner.subtitle")}
              </p>
            </div>

            <a href={siteUrl} className="inline-block" aria-label="Open site">
              <div className="w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-white rounded-2xl shadow-inner border-2 border-neutral-200 p-4 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(siteUrl)}&format=png`}
                  alt="QR code to scan for queue services"
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              </div>
            </a>

            <div>
              <a
                href={qrSvg}
                download="smart-service-flow-qr.svg"
                className="inline-flex items-center gap-2 text-base text-primary-700 hover:text-primary-800 font-heading font-semibold hover:underline"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download QR Code
              </a>
            </div>

            <p className="text-sm sm:text-base text-neutral-600 font-mono bg-neutral-100 inline-block px-3 py-2 rounded-lg">
              {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/token/services
            </p>

            <p className="text-base text-neutral-700">
              {t("token.scanner.instructions")}
            </p>
          </div>
        </Card>

        {/* Info Panel */}
        <div className="hidden lg:block space-y-6">
          <Card>
            <div className="space-y-4">
              <h3 className="text-xl font-heading font-bold text-neutral-900">
                {t("token.scanner.howItWorks")}
              </h3>
              <div className="space-y-4">
                {[
                  { num: "1", title: t("token.scanner.step1Title"), desc: t("token.scanner.step1Desc") },
                  { num: "2", title: t("token.scanner.step2Title"), desc: t("token.scanner.step2Desc") },
                  { num: "3", title: t("token.scanner.step3Title"), desc: t("token.scanner.step3Desc") },
                ].map((step) => (
                  <div key={step.num} className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-primary-700 to-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-heading font-bold flex-shrink-0 text-sm shadow-md">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-neutral-900 text-base">{step.title}</h4>
                      <p className="text-base text-neutral-700 mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="bg-primary-50 border-2 border-primary-200">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-heading font-semibold text-primary-900 text-base mb-1">{t("token.scanner.noticeTitle")}</h4>
                <p className="text-base text-primary-900 leading-relaxed">{t("token.scanner.noticeText")}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default QRScanner;
