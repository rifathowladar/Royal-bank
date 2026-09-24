import React, { useMemo } from 'react';
import { generateQRMatrix } from '../../utils/qrGenerator.ts';
import { Crown } from 'lucide-react';

export interface QRCodeViewProps {
  value: string;
  size?: number; // visual px size
  bgColor?: string;
  fgColor?: string;
  includeLogo?: boolean;
  className?: string;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({
  value,
  size = 220,
  bgColor = '#ffffff',
  fgColor = '#0f172a',
  includeLogo = true,
  className = '',
}) => {
  const matrix = useMemo(() => {
    return generateQRMatrix(value || 'royalbank://empty', 29);
  }, [value]);

  const moduleSize = 10;
  const padding = 20;
  const totalSvgDimension = matrix.size * moduleSize + padding * 2;

  // Path data for fast, single-element rendering
  const pathData = useMemo(() => {
    const parts: string[] = [];
    for (let r = 0; r < matrix.size; r++) {
      for (let c = 0; c < matrix.size; c++) {
        if (matrix.modules[r][c]) {
          const x = padding + c * moduleSize;
          const y = padding + r * moduleSize;
          parts.push(`M${x},${y}h${moduleSize}v${moduleSize}h-${moduleSize}z`);
        }
      }
    }
    return parts.join(' ');
  }, [matrix, padding, moduleSize]);

  // Center logo positioning in SVG coordinates
  const centerPos = totalSvgDimension / 2;
  const logoBoxSize = 56;

  return (
    <div
      className={`relative inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-md border border-slate-200/80 ${className}`}
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg
        viewBox={`0 0 ${totalSvgDimension} ${totalSvgDimension}`}
        width={size}
        height={size}
        className="w-full h-full"
      >
        <rect width={totalSvgDimension} height={totalSvgDimension} fill={bgColor} rx="12" />
        <path d={pathData} fill={fgColor} />

        {includeLogo && (
          <g transform={`translate(${centerPos - logoBoxSize / 2}, ${centerPos - logoBoxSize / 2})`}>
            {/* White backer badge */}
            <rect
              width={logoBoxSize}
              height={logoBoxSize}
              rx="12"
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth="2"
            />
            {/* Golden royal insignia */}
            <rect
              x="6"
              y="6"
              width={logoBoxSize - 12}
              height={logoBoxSize - 12}
              rx="8"
              fill="#061226"
            />
            <foreignObject x="6" y="6" width={logoBoxSize - 12} height={logoBoxSize - 12}>
              <div className="w-full h-full flex items-center justify-center text-amber-400">
                <Crown className="w-6 h-6 fill-amber-400" />
              </div>
            </foreignObject>
          </g>
        )}
      </svg>
    </div>
  );
};
