import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/index.ts';
import {
  accountService,
  transferService,
  Account,
  Beneficiary,
  TransferRequest,
  TransferResult,
  TransferType,
  MoneyRequest,
  SplitBill,
} from '../../backend/index.ts';
import { SendMoneyForm } from '../../components/transfer/SendMoneyForm.tsx';
import { TransferConfirmation } from '../../components/transfer/TransferConfirmation.tsx';
import { TransferSuccess } from '../../components/transfer/TransferSuccess.tsx';
import { TransferReceipt } from '../../components/transfer/TransferReceipt.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import { QRCodeView } from '../../components/common/QRCodeView.tsx';
import {
  ArrowLeftRight,
  Send,
  Users,
  Building2,
  Landmark,
  QrCode,
  History,
  UserCheck,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  Trash2,
  Receipt,
  Sparkles,
} from 'lucide-react';

export const TransfersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Route/Param state
  const typeParam = searchParams.get('type') as TransferType | null;
  const toBeneficiaryId = searchParams.get('to');

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer Execution Flow State
  const [pendingRequest, setPendingRequest] = useState<TransferRequest | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const [receiptViewOpen, setReceiptViewOpen] = useState(false);

  // Quick Modal States: Request Money & Split Bill
  const [requestMoneyOpen, setRequestMoneyOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState('250');
  const [requestNote, setRequestNote] = useState('Dinner split & drinks');
  const [createdMoneyRequest, setCreatedMoneyRequest] = useState<MoneyRequest | null>(null);
  const [reqCopied, setReqCopied] = useState(false);

  // Split Bill Modal
  const [splitBillOpen, setSplitBillOpen] = useState(false);
  const [splitTitle, setSplitTitle] = useState('Team Strategy Dinner');
  const [splitTotal, setSplitTotal] = useState('480');
  const [participants, setParticipants] = useState<string[]>([
    'Alexander Sterling (You)',
    'Marcus Vance',
    'Elena Rostova',
  ]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [createdSplitBill, setCreatedSplitBill] = useState<SplitBill | null>(null);

  const loadInitialData = async () => {
    try {
      const [accs, bens] = await Promise.all([
        accountService.getAccounts(user?.id || 'cust-001'),
        transferService.getBeneficiaries(user?.id || 'cust-001'),
      ]);
      setAccounts(accs);
      setBeneficiaries(bens);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Handle flow when user clicks Review in SendMoneyForm
  const handleProceedToConfirm = (request: TransferRequest) => {
    setPendingRequest(request);
    setConfirmModalOpen(true);
  };

  // Handle Authorize with PIN in TransferConfirmation
  const handleAuthorizeTransfer = async (pin: string) => {
    if (!pendingRequest) return;
    setIsExecuting(true);
    try {
      const result = await transferService.executeTransfer(pendingRequest);
      setConfirmModalOpen(false);
      setPendingRequest(null);
      setTransferResult(result);
      // Refresh balances in memory
      loadInitialData();
    } catch (err) {
      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle Create Money Request
  const handleCreateMoneyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accounts[0]) return;
    try {
      const res = await transferService.createMoneyRequest({
        requesterId: user?.id || 'cust-001',
        requesterName: `${user?.firstName || 'Alexander'} ${user?.lastName || 'Sterling'}`,
        requesterAccount: accounts[0].accountNumber,
        amount: parseFloat(requestAmount) || 100,
        currency: accounts[0].currency,
        note: requestNote,
      });
      setCreatedMoneyRequest(res);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Create Split Bill
  const handleCreateSplitBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(splitTotal) || 0;
    if (total <= 0 || participants.length === 0) return;

    const perPerson = total / participants.length;
    try {
      const bill = await transferService.createSplitBill({
        creatorId: user?.id || 'cust-001',
        title: splitTitle,
        totalAmount: total,
        currency: 'USD',
        participants: participants.map((p) => ({
          name: p,
          shareAmount: Math.round(perPerson * 100) / 100,
        })),
      });
      setCreatedSplitBill(bill);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) return;
    setParticipants([...participants, newParticipantName.trim()]);
    setNewParticipantName('');
  };

  const handleRemoveParticipant = (index: number) => {
    if (index === 0) return; // Keep Alexander
    setParticipants(participants.filter((_, i) => i !== index));
  };

  if (loading) {
    return <LoadingState type="card" message="Initializing secure transfer nexus..." />;
  }

  // 1. Receipt View
  if (receiptViewOpen && transferResult) {
    return (
      <TransferReceipt
        result={transferResult}
        onClose={() => setReceiptViewOpen(false)}
      />
    );
  }

  // 2. Success View
  if (transferResult) {
    return (
      <TransferSuccess
        result={transferResult}
        onViewReceipt={() => setReceiptViewOpen(true)}
        onNewTransfer={() => setTransferResult(null)}
        onReturnDashboard={() => navigate('/bank/dashboard')}
      />
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Instant Fund Transfers & Wires
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold">
              Real-Time Settlement
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute internal client transfers, domestic clearing, NPSB, BEFTN, and high-value RTGS.
          </p>
        </div>

        {/* Quick Navigation Action Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/bank/transfers/beneficiaries')}
            icon={<UserCheck className="w-3.5 h-3.5" />}
            className="text-xs whitespace-nowrap"
          >
            Payees Directory ({beneficiaries.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/bank/transfers/history')}
            icon={<History className="w-3.5 h-3.5" />}
            className="text-xs whitespace-nowrap"
          >
            Audit History
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={() => navigate('/bank/qr')}
            icon={<QrCode className="w-3.5 h-3.5" />}
            className="text-xs whitespace-nowrap"
          >
            QR Instant Pay
          </Button>
        </div>
      </div>

      {/* Main Send Money Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Send Form (Left 2 Cols) */}
        <div className="lg:col-span-2">
          <SendMoneyForm
            accounts={accounts}
            beneficiaries={beneficiaries}
            initialTransferType={typeParam || 'royal_bank'}
            onProceedToConfirm={handleProceedToConfirm}
            onOpenRequestMoneyModal={() => {
              setCreatedMoneyRequest(null);
              setRequestMoneyOpen(true);
            }}
            onOpenSplitBillModal={() => {
              setCreatedSplitBill(null);
              setSplitBillOpen(true);
            }}
            onAddNewBeneficiary={() => navigate('/bank/transfers/beneficiaries')}
          />
        </div>

        {/* Sidebar Info & Rails Bento (Right 1 Col) */}
        <div className="space-y-6">
          {/* Liquidity Overview */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-royal-950 via-slate-900 to-royal-950 text-white shadow-lg space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gold-400 font-bold block">
              Active Clearing Liquidity
            </span>
            <div className="text-3xl font-extrabold font-mono text-white">
              ${accounts.reduce((acc, curr) => acc + curr.availableBalance, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Consolidated real-time balance available across all depository and foreign currency vaults.
            </p>

            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setCreatedMoneyRequest(null);
                  setRequestMoneyOpen(true);
                }}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors font-semibold text-gold-300"
              >
                + Request Money
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreatedSplitBill(null);
                  setSplitBillOpen(true);
                }}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors font-semibold text-white"
              >
                ÷ Split a Bill
              </button>
            </div>
          </div>

          {/* Clearing Protocols Guide */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Settlement Protocols Guide
            </h3>

            <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="pt-2 space-y-0.5">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>Royal Bank Customer</span>
                  <span className="text-emerald-600 font-mono">0.00 • Sub-second</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Direct ledger transfer to any Royal Bank account globally.
                </p>
              </div>

              <div className="pt-2 space-y-0.5">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>NPSB Switch</span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono">$1.50 • Instant</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  National payment switch real-time interbank settlement.
                </p>
              </div>

              <div className="pt-2 space-y-0.5">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>BEFTN Clearing</span>
                  <span className="text-emerald-600 font-mono">FREE • 1-2 Hours</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Batch automated clearing network with zero fees.
                </p>
              </div>

              <div className="pt-2 space-y-0.5">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>RTGS High-Value</span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono">$5.00 • Real-Time</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Real-time gross settlement for transactions exceeding $10,000 / ৳100,000.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <TransferConfirmation
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleAuthorizeTransfer}
        request={pendingRequest}
        sourceAccount={accounts.find((a) => a.id === pendingRequest?.sourceAccountId) || null}
        isLoading={isExecuting}
      />

      {/* Request Money Modal */}
      <Modal
        isOpen={requestMoneyOpen}
        onClose={() => setRequestMoneyOpen(false)}
        title="Request Money / Generate Invoicing QR"
        subtitle="Share a cryptographically signed payment link or QR code"
        maxWidth="md"
      >
        {createdMoneyRequest ? (
          <div className="space-y-4 text-center text-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Payment Request Generated!
              </h4>
              <p className="text-slate-500 text-[11px]">
                Share this QR or link to receive {createdMoneyRequest.currency} {createdMoneyRequest.amount.toLocaleString()}
              </p>
            </div>

            <div className="flex justify-center py-2">
              <QRCodeView value={createdMoneyRequest.qrPayload} size={180} />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono text-[11px]">
              <span className="truncate max-w-[260px] text-slate-600 dark:text-slate-300">
                {createdMoneyRequest.qrPayload}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(createdMoneyRequest.qrPayload);
                  setReqCopied(true);
                  setTimeout(() => setReqCopied(false), 2000);
                }}
                className="p-1 rounded text-royal-600 dark:text-gold-400 font-bold flex items-center gap-1"
              >
                {reqCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {reqCopied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <Button
              variant="gold"
              onClick={() => setRequestMoneyOpen(false)}
              className="w-full text-xs"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateMoneyRequest} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Amount to Request
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-base font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Note / Description
              </label>
              <input
                type="text"
                required
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRequestMoneyOpen(false)}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                className="flex-1 text-xs"
              >
                Generate Request QR
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Split Bill Modal */}
      <Modal
        isOpen={splitBillOpen}
        onClose={() => setSplitBillOpen(false)}
        title="Split Bill Between Friends / Peers"
        subtitle="Calculates equal or custom proportions with automatic settlement links"
        maxWidth="md"
      >
        {createdSplitBill ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
              <div className="font-bold text-emerald-900 dark:text-emerald-200">
                Split Bill Created: {createdSplitBill.title}
              </div>
              <div className="font-mono text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                ${createdSplitBill.totalAmount.toLocaleString()} total • ${Math.round((createdSplitBill.totalAmount / createdSplitBill.participants.length) * 100) / 100} / person
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {createdSplitBill.participants.map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Share: ${p.shareAmount.toFixed(2)}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                      p.status === 'paid'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>

            <Button
              variant="gold"
              onClick={() => setSplitBillOpen(false)}
              className="w-full text-xs"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateSplitBill} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Bill Occasion / Title
              </label>
              <input
                type="text"
                required
                value={splitTitle}
                onChange={(e) => setSplitTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Total Check / Bill Amount ($)
              </label>
              <input
                type="number"
                required
                min={1}
                value={splitTotal}
                onChange={(e) => setSplitTotal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-base font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                Split Participants ({participants.length})
              </label>

              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {participants.map((name, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">{name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 font-semibold">
                        ${(parseFloat(splitTotal || '0') / Math.max(1, participants.length)).toFixed(2)}
                      </span>
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(i)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add friend name (e.g. Sophie Chen)"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddParticipant}
                  className="text-xs"
                >
                  + Add
                </Button>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSplitBillOpen(false)}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                className="flex-1 text-xs"
              >
                Create Split Bill
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
