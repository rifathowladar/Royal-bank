import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Printer, ChevronDown, Check } from 'lucide-react';

export interface ExportMenuProps {
  reportTitle: string;
  headers: string[];
  rows: (string | number)[][];
  fileName?: string;
  onExportSuccess?: (format: 'CSV' | 'Excel' | 'PDF') => void;
}

// HTML entity encoding utility to prevent DOM XSS in print/export documents
const escapeHtml = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const ExportMenu: React.FC<ExportMenuProps> = ({
  reportTitle,
  headers,
  rows,
  fileName = 'royal-bank-report',
  onExportSuccess,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const downloadFile = (content: string, type: string, extension: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    setExportingFormat('CSV');
    setTimeout(() => {
      const escape = (val: any) => {
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      };
      const csvLines = [
        headers.map(escape).join(','),
        ...rows.map((row) => row.map(escape).join(',')),
      ];
      downloadFile(csvLines.join('\n'), 'text/csv;charset=utf-8;', 'csv');
      setExportingFormat(null);
      setIsOpen(false);
      onExportSuccess?.('CSV');
    }, 400);
  };

  const handleExportExcel = () => {
    setExportingFormat('Excel');
    setTimeout(() => {
      // Excel-compatible HTML Spreadsheet XML with escaped values
      const tableHeaders = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
      const tableRows = rows
        .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
        .join('');
      const safeTitle = escapeHtml(reportTitle);

      const excelContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${safeTitle.slice(0, 31)}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
          <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
          <style>
            table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
            th { background-color: #0a192f; color: #ffffff; font-weight: bold; border: 1px solid #ccc; padding: 8px; }
            td { border: 1px solid #ddd; padding: 6px; }
          </style>
        </head>
        <body>
          <h2>Royal Bank — ${safeTitle}</h2>
          <p>Generated on: ${new Date().toUTCString()}</p>
          <table>
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
        </html>
      `;
      downloadFile(excelContent, 'application/vnd.ms-excel', 'xls');
      setExportingFormat(null);
      setIsOpen(false);
      onExportSuccess?.('Excel');
    }, 500);
  };

  const handleExportPdf = () => {
    setExportingFormat('PDF');
    setTimeout(() => {
      // Create printable window for PDF download / print with sanitized inputs
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const safeTitle = escapeHtml(reportTitle);
        const safeDate = escapeHtml(new Date().toLocaleString());
        const safeDocRef = escapeHtml(`RB-REP-${Date.now().toString().slice(-6)}`);
        const safeHeaders = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
        const safeRows = rows
          .map(
            (row) => `
          <tr>
            ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}
          </tr>
        `
          )
          .join('');

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Royal Bank — ${safeTitle}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #0f172a; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0a192f; padding-bottom: 16px; margin-bottom: 24px; }
              .bank-name { font-size: 22px; font-weight: 800; color: #0a192f; letter-spacing: -0.5px; }
              .meta { font-size: 11px; color: #64748b; text-align: right; }
              h1 { font-size: 18px; margin: 0 0 16px 0; color: #1e293b; }
              table { width: 100%; border-collapse: collapse; font-size: 11px; }
              th { background: #f8fafc; text-align: left; padding: 8px 10px; border-bottom: 2px solid #cbd5e1; font-weight: 600; color: #475569; }
              td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
              tr:nth-child(even) td { background-color: #f8fafc; }
              .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="bank-name">ROYAL BANK</div>
                <div style="font-size: 12px; color: #a37c2c; font-weight: 600;">Executive Supervisory Suite</div>
              </div>
              <div class="meta">
                <div>Document Ref: ${safeDocRef}</div>
                <div>Generated: ${safeDate}</div>
                <div>Classification: Portfolio Demo Simulation</div>
              </div>
            </div>

            <h1>${safeTitle}</h1>

            <table>
              <thead>
                <tr>
                  ${safeHeaders}
                </tr>
              </thead>
              <tbody>
                ${safeRows}
              </tbody>
            </table>

            <div class="footer">
              <span>Royal Bank Supervisory Suite · Portfolio Demonstration</span>
              <span>Page 1 of 1</span>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();
          } catch (e) {
            console.error('Print trigger error:', e);
          }
        }, 250);
      }
      setExportingFormat(null);
      setIsOpen(false);
      onExportSuccess?.('PDF');
    }, 400);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={rows.length === 0 || exportingFormat !== null}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        <Download className="w-3.5 h-3.5 text-slate-500" />
        <span>{exportingFormat ? `Preparing ${exportingFormat}...` : 'Export'}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
            Export Format
          </div>

          <button
            onClick={handleExportCsv}
            className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div className="flex-1">
              <div className="font-medium">CSV Format</div>
              <div className="text-[10px] text-slate-400">Comma-separated values (.csv)</div>
            </div>
          </button>

          <button
            onClick={handleExportExcel}
            className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
            <div className="flex-1">
              <div className="font-medium">Excel Spreadsheet</div>
              <div className="text-[10px] text-slate-400">Microsoft Excel XML (.xls)</div>
            </div>
          </button>

          <button
            onClick={handleExportPdf}
            className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <div className="flex-1">
              <div className="font-medium">PDF Document</div>
              <div className="text-[10px] text-slate-400">Printable Bank Letterhead (.pdf)</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
