import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { rechargeService } from '../../../backend/services/rechargeService.ts';
import { accountService } from '../../../backend/services/accountService.ts';
import {
  MobileOperator,
  RechargePlan,
  RechargeRecord,
  Account,
} from '../../../backend/types/index.ts';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  Smartphone,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Wifi,
  Globe,
  Clock,
  ShieldCheck,
  User,
  History,
  Sparkles,
  Printer,
  ChevronRight,
} from 'lucide-react';

export const MobileRechargePage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [operators, setOperators] = useState<MobileOperator[]>([]);
  const [plans, setPlans] = useState<RechargePlan[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentNumbers, setRecentNumbers] = useState<Array<{ number: string; name: string; operatorId: string }>>([]);
  const [history, setHistory] = useState<RechargeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [connectionType, setConnectionType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedOperatorId, setSelectedOperatorId] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<RechargePlan | null>(null);
  const [selectedPlanCategory, setSelectedPlanCategory] = useState<string>('popular');
  const [sourceAccountId, setSourceAccountId] = useState('');

  // Confirmation & OTP
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [otpPin, setOtpPin] = useState('1234');
  const [isProcessing, setIsProcessing] = useState(false);

  // Success Receipt
  const [completedRecord, setCompletedRecord] = useState<RechargeRecord | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const ops = await rechargeService.getOperators();
      setOperators(ops);
      if (ops.length > 0) setSelectedOperatorId(ops[0].id);

      const allPlans = await rechargeService.getPlans();
      setPlans(allPlans);

      const accs = await accountService.getAccounts(user?.id);
      setAccounts(accs);
      if (accs.length > 0) setSourceAccountId(accs[0].id);

      const recents = await rechargeService.getRecentNumbers(user?.id);
      setRecentNumbers(recents);

      const hist = await rechargeService.getRechargeHistory(user?.id);
      setHistory(hist);
    } catch (err: any) {
      toastError(err.message || 'Failed to initialize recharge system');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const selectedOperator = operators.find((o) => o.id === selectedOperatorId);

  // Filter plans by selected operator and category
  const filteredPlans = plans.filter((p) => {
    const matchesOp = !selectedOperatorId || p.operatorId === selectedOperatorId;
    const matchesCat =
      selectedPlanCategory === 'all' || p.category.toLowerCase() === selectedPlanCategory.toLowerCase();
    return matchesOp && matchesCat;
  });

  const finalAmount: number = selectedPlan
    ? (selectedPlan.amount ?? selectedPlan.price ?? 0)
    : (parseFloat(customAmount) || 0);

  const handleSelectRecent = (recent: { number: string; operatorId: string }) => {
    setMobileNumber(recent.number);
    setSelectedOperatorId(recent.operatorId);
  };

  const handleSelectPlan = (plan: RechargePlan) => {
    setSelectedPlan(plan);
    const amt = plan.amount ?? plan.price ?? 0;
    setCustomAmount(amt.toString());
  };

  const handleStartConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim()) {
      toastError('Please enter a valid mobile phone number');
      return;
    }
    if (finalAmount <= 0) {
      toastError('Please choose a plan or enter a top-up amount');
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleConfirmRecharge = async () => {
    try {
      setIsProcessing(true);
      const res = await rechargeService.processRecharge({
        customerId: user?.id || 'cust-001',
        mobileNumber: mobileNumber.trim(),
        operatorId: selectedOperatorId,
        connectionType,
        amount: finalAmount,
        planName: selectedPlan ? selectedPlan.title : undefined,
        sourceAccountId,
      });

      setCompletedRecord(res.record);
      setConfirmModalOpen(false);
      success(`Top-up of ${formatCurrency(res.record.amount)} to ${res.record.mobileNumber} was successful!`);
      const newHist = await rechargeService.getRechargeHistory(user?.id);
      setHistory(newHist);
    } catch (err: any) {
      toastError(err.message || 'Mobile recharge failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading && operators.length === 0) {
    return <LoadingState message="Connecting to telco gateway..." />;
  }

  // Success Receipt View
  if (completedRecord) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pb-12">
        <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
              Recharge Instantaneous & Confirmed
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Top-up balance and network validity have been provisioned immediately by {completedRecord.operatorName}.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 uppercase font-semibold">Total Amount</span>
              <span className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
                {formatCurrency(completedRecord.amount)}
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Recipient Mobile Number</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {completedRecord.mobileNumber}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Carrier Operator</span>
                <span className="font-semibold">{completedRecord.operatorName}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Connection Mode</span>
                <span className="uppercase font-semibold text-emerald-600 dark:text-emerald-400">
                  {completedRecord.connectionType}
                </span>
              </div>
              {completedRecord.planName && (
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Selected Plan</span>
                  <span className="font-semibold">{completedRecord.planName}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Bank Reference</span>
                <span className="font-mono font-bold text-royal-600 dark:text-gold-400">
                  {completedRecord.transactionReference}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Carrier Switch Reference</span>
                <span className="font-mono">{completedRecord.operatorRef}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print Receipt
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setCompletedRecord(null);
                setMobileNumber('');
                setSelectedPlan(null);
                setCustomAmount('');
              }}
              className="flex-1 text-xs"
            >
              New Recharge
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/bank/bills')}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-emerald-500" />
            Instant Mobile Recharge & Postpaid Bill
          </h1>
          <p className="text-xs text-slate-500">
            Top-up talk time, unlimited 5G data bundles, and international roaming passes across global carriers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Number, Operator, Connection Type */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 mb-4">
              1. Recharge Details
            </h2>

            {/* Prepaid vs Postpaid Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setConnectionType('prepaid')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  connectionType === 'prepaid'
                    ? 'bg-white dark:bg-slate-900 text-royal-600 dark:text-gold-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Prepaid Top-Up
              </button>
              <button
                type="button"
                onClick={() => setConnectionType('postpaid')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  connectionType === 'postpaid'
                    ? 'bg-white dark:bg-slate-900 text-royal-600 dark:text-gold-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Postpaid Bill
              </button>
            </div>

            {/* Recent Numbers Quick-Picks */}
            {recentNumbers.length > 0 && (
              <div className="mb-4">
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                  Recent Numbers
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {recentNumbers.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectRecent(r)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 text-xs shrink-0 cursor-pointer text-left"
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{r.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{r.number}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleStartConfirmation} className="space-y-4">
              <Input
                label="Mobile Phone Number"
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                required
              />

              {/* Operator Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
                  Select Mobile Carrier
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {operators.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        setSelectedOperatorId(op.id);
                        setSelectedPlan(null);
                      }}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-left cursor-pointer transition-all ${
                        selectedOperatorId === op.id
                          ? 'bg-royal-50 dark:bg-royal-950/60 border-royal-600 dark:border-gold-400 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                        {op.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs text-slate-900 dark:text-slate-100 truncate">{op.name}</div>
                        <div className="text-[10px] text-slate-400">{op.country}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Top-Up Amount */}
              <Input
                label="Or Custom Top-Up Amount ($ USD)"
                type="number"
                min="5"
                max="500"
                step="1"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedPlan(null);
                }}
                placeholder="e.g. 25"
                helperText="Enter any custom dollar value or pick a bundled plan from the right."
              />

              {/* Source Account */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
                  Debit Account
                </label>
                <select
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumber}) - {formatCurrency(acc.availableBalance)}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 text-sm flex items-center justify-center gap-2"
              >
                Continue to Recharge {finalAmount > 0 ? formatCurrency(finalAmount) : ''}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Form: Carrier Plans Catalogue */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-400" />
                2. Recommended Plans
              </h2>
              <span className="text-xs text-slate-400">{selectedOperator?.name}</span>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs font-semibold">
              {['popular', 'data', 'unlimited', 'roaming'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedPlanCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg capitalize cursor-pointer transition-all ${
                    selectedPlanCategory === cat
                      ? 'bg-royal-600 text-white dark:bg-gold-500 dark:text-slate-950 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Plan Cards */}
            <div className="space-y-3 mt-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id
                      ? 'bg-royal-50 dark:bg-royal-950/60 border-royal-600 dark:border-gold-400 ring-2 ring-royal-400/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {plan.title}
                        {plan.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-gold-300">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {plan.validity} · {plan.dataAmount || 'Voice only'}
                      </div>
                    </div>

                    <div className="text-sm font-bold font-mono text-royal-600 dark:text-gold-400">
                      {formatCurrency(plan.amount ?? plan.price ?? 0)}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {plan.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation & PIN Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Authorize Mobile Recharge"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Recipient Phone:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {mobileNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Carrier:</span>
              <span className="font-semibold">{selectedOperator?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Connection Mode:</span>
              <span className="uppercase font-semibold">{connectionType}</span>
            </div>
            {selectedPlan && (
              <div className="flex justify-between">
                <span className="text-slate-500">Package:</span>
                <span>{selectedPlan.title}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-bold">
              <span>Total Charge:</span>
              <span className="font-mono text-royal-600 dark:text-gold-400">
                {formatCurrency(finalAmount)}
              </span>
            </div>
          </div>

          <Input
            label="Transaction PIN / OTP (Simulation: 1234)"
            type="password"
            maxLength={4}
            value={otpPin}
            onChange={(e) => setOtpPin(e.target.value)}
            helperText="Enter your 4-digit banking authorization PIN."
            required
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmRecharge}
              loading={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Confirm & Recharge
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
