import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { qrService, DemoQRCodeItem } from '../../../backend/index.ts';
import { Button } from '../../../components/ui/Button.tsx';
import {
  ArrowLeft,
  ScanLine,
  Flashlight,
  Camera,
  Upload,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const QrScanPage: React.FC = () => {
  const navigate = useNavigate();
  const demoQrs = qrService.getDemoQRCodes();

  const [torchOn, setTorchOn] = useState(false);
  const [manualPayload, setManualPayload] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  const handleSimulateScan = (payload: string) => {
    navigate(`/bank/qr/pay?payload=${encodeURIComponent(payload)}`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPayload.trim()) return;
    handleSimulateScan(manualPayload.trim());
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/bank/qr')}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="text-slate-600 dark:text-slate-400 text-xs"
        >
          Back to QR Hub
        </Button>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Scan QR Code
          </h1>
          <p className="text-xs text-slate-500">
            Point camera at any customer, merchant, or EMVCo standard payment code.
          </p>
        </div>
      </div>

      {/* Simulated Camera Viewfinder */}
      <div className="relative aspect-4/3 sm:aspect-16/10 rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6 text-white text-center">
        {/* Ambient Dark Viewfinder Background */}
        <div className="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-black opacity-90" />

        {/* Viewfinder Target Frame */}
        <div className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 rounded-3xl border-2 border-dashed border-white/40 flex items-center justify-center p-4">
          {/* Laser scanning beam */}
          <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-pulse" />

          {/* Corner Guides */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-2xl" />

          <div className="text-center space-y-2 pointer-events-none">
            <ScanLine className="w-10 h-10 text-amber-400 mx-auto animate-bounce opacity-80" />
            <span className="text-[11px] font-mono tracking-wider text-slate-300 block font-semibold">
              ALIGN QR WITHIN FRAME
            </span>
          </div>
        </div>

        {/* Floating Viewfinder Controls */}
        <div className="absolute bottom-4 inset-x-4 flex justify-between items-center text-xs z-10">
          <button
            type="button"
            onClick={() => setTorchOn(!torchOn)}
            className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
              torchOn
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
            title="Toggle Flashlight"
          >
            <Flashlight className="w-4 h-4" />
          </button>

          <span className="text-[10px] text-slate-400 font-mono">
            Auto-detection Active (EMVCo)
          </span>

          <button
            type="button"
            onClick={() =>
              handleSimulateScan(
                'royalbank://pay?type=customer&cid=cust-003&name=Marcus+Vance&acc=3824-5018-1192&cur=USD&amt=1000'
              )
            }
            className="p-2.5 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
            title="Simulate Camera Capture"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1-Click Interactive Demo Scenarios (No camera required) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
            <Zap className="w-4 h-4 text-amber-500" />
            1-Click Interactive Scan Simulator
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Test sending funds to real accounts without a physical camera:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {demoQrs.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSimulateScan(item.qrPayload)}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-royal-600 dark:hover:border-gold-400 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-royal-50 dark:bg-royal-950 text-royal-700 dark:text-gold-400 flex items-center justify-center font-bold text-xs">
                  {item.avatarText}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-royal-600 dark:group-hover:text-gold-400 transition-colors">
                    {item.recipientName}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {item.accountOrCode} • {item.currency} {item.suggestedAmount?.toLocaleString()}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-royal-600 dark:group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* Manual Payload / URI Input */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 text-xs">
        <label className="font-bold text-slate-900 dark:text-white block">
          Or Paste QR Code URI / EMVCo String
        </label>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. royalbank://pay?type=customer&cid=cust-003&name=Marcus+Vance..."
            value={manualPayload}
            onChange={(e) => setManualPayload(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs"
          />
          <Button type="submit" variant="gold" size="sm" className="text-xs">
            Decode & Pay
          </Button>
        </form>
      </div>
    </div>
  );
};
