import React, { useState, useEffect } from 'react';
import {
  Account,
  Beneficiary,
  TransferRequest,
  TransferType,
  transferService,
} from '../../backend/index.ts';
import { BeneficiarySelector } from './BeneficiarySelector.tsx';
import { Button } from '../ui/Button.tsx';
import {
  ArrowLeftRight,
  UserCheck,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Zap,
  ArrowRight,
  Users,
  Search,
} from 'lucide-react';

export interface SendMoneyFormProps {
  accounts: Account[];
  beneficiaries: Beneficiary[];
  initialTransferType?: TransferType;
  initialSourceAccountId?: string;
  onProceedToConfirm: (request: TransferRequest) => void;
  onOpenSplitBillModal?: () => void;
  onOpenRequestMoneyModal?: () => void;
  onAddNewBeneficiary?: () => void;
}

export const SendMoneyForm: React.FC<SendMoneyFormProps> = ({
  accounts,
  beneficiaries,
  initialTransferType = 'royal_bank',
  initialSourceAccountId,
  onProceedToConfirm,
  onOpenSplitBillModal,
  onOpenRequestMoneyModal,
  onAddNewBeneficiary,
}) => {
  const [transferType, setTransferType] = useState<TransferType>(initialTransferType);
  const [sourceAccountId, setSourceAccountId] = useState(
    initialSourceAccountId || (accounts.length > 0 ? accounts[0].id : '')
  );

  // Own Account state
  const [targetAccountId, setTargetAccountId] = useState(
    accounts.length > 1 ? accounts[1].id : ''
  );

  // Royal Bank Customer Lookup state
  const [royalSearchQuery, setRoyalSearchQuery] = useState('');
  const [isSearchingRoyal, setIsSearchingRoyal] = useState(false);
  const [foundRoyalCustomer, setFoundRoyalCustomer] = useState<{
    id: string;
    name: string;
    customerNumber: string;
    tier: string;
    accountNumber: string;
    branch: string;
  } | null>(null);

  // Other Bank / Clearing state
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientBank, setRecipientBank] = useState('Standard Chartered Bank');
  const [recipientRouting, setRecipientRouting] = useState('021000021');
  const [isVerifyingRouting, setIsVerifyingRouting] = useState(false);
  const [routingVerified, setRoutingVerified] = useState(false);

  // Transfer Parameters
  const [amount, setAmount] = useState<string>('1000');
  const [referenceNote, setReferenceNote] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'quarterly'>('monthly');

  // Error state
  const [formError, setFormError] = useState('');

  const selectedSourceAccount = accounts.find((a) => a.id === sourceAccountId) || accounts[0];

  // Calculate fees dynamically based on clearing protocol
  const getFee = (): number => {
    switch (transferType) {
      case 'own_account':
      case 'royal_bank':
      case 'beftn':
        return 0.0;
      case 'npsb':
        return 1.5;
      case 'rtgs':
        return 5.0;
      case 'other_bank':
        return 2.5;
      default:
        return 0.0;
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const currentFee = getFee();
  const totalDebit = parsedAmount + currentFee;

  // Search Royal Bank customer when query changes
  useEffect(() => {
    if (transferType !== 'royal_bank' || !royalSearchQuery || royalSearchQuery.length < 3) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingRoyal(true);
      try {
        const res = await transferService.searchRoyalBankCustomer(royalSearchQuery);
        if (res) {
          setFoundRoyalCustomer({
            id: res.customer.id,
            name: res.customer.name,
            customerNumber: res.customer.customerNumber,
            tier: res.customer.tier,
            accountNumber: res.account.accountNumber,
            branch: res.account.branch,
          });
          setRecipientName(res.customer.name);
          setRecipientAccount(res.account.accountNumber);
        } else {
          setFoundRoyalCustomer(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearchingRoyal(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [royalSearchQuery, transferType]);

  // Handle Beneficiary selection
  const handleSelectBeneficiary = (ben: Beneficiary) => {
    setRecipientName(ben.name);
    setRecipientAccount(ben.accountNumber);
    setRecipientBank(ben.bankName);
    setRecipientRouting(ben.routingOrSwift);
    setRoutingVerified(true);
    if (ben.type === 'internal') {
      setTransferType('royal_bank');
    } else {
      setTransferType('other_bank');
    }
  };

  // Verify routing button
  const handleVerifyAccount = async () => {
    if (!recipientAccount) return;
    setIsVerifyingRouting(true);
    try {
      const res = await transferService.verifyAccount(
        recipientAccount,
        recipientBank,
        transferType as any
      );
      if (res.verified) {
        setRoutingVerified(true);
        if (!recipientName) setRecipientName(res.accountTitle);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifyingRouting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (parsedAmount <= 0) {
      setFormError('Please enter a valid transfer amount.');
      return;
    }

    if (!selectedSourceAccount || selectedSourceAccount.availableBalance < totalDebit) {
      setFormError(
        `Insufficient funds. Available: ${selectedSourceAccount?.currency} ${selectedSourceAccount?.availableBalance.toLocaleString()}`
      );
      return;
    }

    if (transferType === 'own_account') {
      if (sourceAccountId === targetAccountId) {
        setFormError('Source and destination accounts must be different for own account transfers.');
        return;
      }
      const target = accounts.find((a) => a.id === targetAccountId);
      if (!target) {
        setFormError('Please select a target account.');
        return;
      }

      onProceedToConfirm({
        sourceAccountId,
        transferType: 'own_account',
        targetAccountId,
        amount: parsedAmount,
        currency: selectedSourceAccount.currency,
        recipientName: target.customNickName || target.name,
        recipientAccount: target.accountNumber,
        recipientBank: 'Royal Bank (Internal Book)',
        fee: 0,
        referenceNote: referenceNote || 'Own Account Liquidity Transfer',
      });
      return;
    }

    if (!recipientName || !recipientAccount) {
      setFormError('Please provide recipient name and account number.');
      return;
    }

    // RTGS Minimum Check
    if (transferType === 'rtgs' && parsedAmount < 10000) {
      setFormError('RTGS transfers require a minimum threshold of $10,000 / ৳100,000 for high-value settlement.');
      return;
    }

    onProceedToConfirm({
      sourceAccountId,
      transferType,
      amount: parsedAmount,
      currency: selectedSourceAccount.currency,
      recipientName,
      recipientAccount,
      recipientBank: transferType === 'royal_bank' ? 'Royal Bank' : recipientBank,
      recipientRoutingOrSwift: recipientRouting,
      recipientCustomerId: foundRoyalCustomer?.id,
      fee: currentFee,
      referenceNote,
      scheduledDate: transferType === 'scheduled' ? scheduledDate : undefined,
      recurringFrequency: transferType === 'recurring' ? recurringFrequency : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* 10 Money Transfer Rail Types Tabs */}
      <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto text-xs">
        <div className="flex gap-1 min-w-max">
          {[
            { id: 'own_account', label: 'Own Account', badge: 'Free' },
            { id: 'royal_bank', label: 'Royal Bank Customer', badge: 'Instant' },
            { id: 'other_bank', label: 'Other Bank', badge: 'Wire' },
            { id: 'npsb', label: 'NPSB Switch', badge: 'Instant' },
            { id: 'beftn', label: 'BEFTN ACH', badge: 'Batch Free' },
            { id: 'rtgs', label: 'RTGS High-Value', badge: 'Instant' },
            { id: 'scheduled', label: 'Scheduled', badge: 'Future' },
            { id: 'recurring', label: 'Recurring', badge: 'Auto' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTransferType(t.id as TransferType);
                setFormError('');
              }}
              className={`px-3 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                transferType === t.id
                  ? 'bg-white dark:bg-slate-900 text-royal-950 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{t.label}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-royal-100 dark:bg-royal-900/60 text-royal-700 dark:text-gold-400 font-mono font-bold">
                {t.badge}
              </span>
            </button>
          ))}

          {/* Request Money & Split Bill Quick Buttons */}
          {onOpenRequestMoneyModal && (
            <button
              type="button"
              onClick={onOpenRequestMoneyModal}
              className="px-3 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-900/50 flex items-center gap-1"
            >
              <span>Request Money</span>
            </button>
          )}

          {onOpenSplitBillModal && (
            <button
              type="button"
              onClick={onOpenSplitBillModal}
              className="px-3 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-900/50 flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5 text-royal-600 dark:text-gold-400" />
              <span>Split Bill</span>
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Source Funding Account */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              1. Originating Funding Account
            </label>
            <span className="text-slate-500 font-mono text-[11px]">
              Available: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">${selectedSourceAccount?.availableBalance.toLocaleString()}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {accounts.map((acc) => {
              const isSelected = sourceAccountId === acc.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => setSourceAccountId(acc.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                    isSelected
                      ? 'border-royal-600 dark:border-gold-400 bg-royal-50/40 dark:bg-royal-950/40 ring-1 ring-royal-600/30'
                      : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                      {acc.customNickName || acc.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      •{acc.accountNumber.slice(-4)}
                    </span>
                  </div>
                  <div className="text-sm font-extrabold font-mono text-royal-950 dark:text-gold-400">
                    {acc.currency} {acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recipient Destination Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              2. Destination & Recipient Details
            </label>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
              {transferType.replace('_', ' ')}
            </span>
          </div>

          {/* Mode A: Own Account Transfer */}
          {transferType === 'own_account' && (
            <div className="space-y-3">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Select Destination Own Account
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {accounts
                  .filter((a) => a.id !== sourceAccountId)
                  .map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => setTargetAccountId(acc.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                        targetAccountId === acc.id
                          ? 'border-royal-600 dark:border-gold-400 bg-royal-50/40 dark:bg-royal-950/40 ring-1 ring-royal-600/30'
                          : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {acc.customNickName || acc.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {acc.accountNumber.slice(-4)}
                        </span>
                      </div>
                      <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        {acc.currency} {acc.balance.toLocaleString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Mode B: Royal Bank Customer Transfer (Lookup) */}
          {transferType === 'royal_bank' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Search Royal Bank Customer (ID, Account Number, Phone, or Email)
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Elena Rostova, Marcus Vance, cust-002, or 3824-5018-1192"
                    value={royalSearchQuery}
                    onChange={(e) => setRoyalSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div className="flex gap-2 pt-1.5">
                  <span className="text-[10px] text-slate-400">Quick Test Peers:</span>
                  <button
                    type="button"
                    onClick={() => setRoyalSearchQuery('Marcus Vance')}
                    className="text-[10px] text-royal-600 dark:text-gold-400 hover:underline font-semibold"
                  >
                    Marcus Vance (SF Tech)
                  </button>
                  <span className="text-slate-400">•</span>
                  <button
                    type="button"
                    onClick={() => setRoyalSearchQuery('Elena Rostova')}
                    className="text-[10px] text-royal-600 dark:text-gold-400 hover:underline font-semibold"
                  >
                    Elena Rostova (Mayfair)
                  </button>
                </div>
              </div>

              {foundRoyalCustomer && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <strong className="text-emerald-900 dark:text-emerald-200 text-xs">
                        {foundRoyalCustomer.name}
                      </strong>
                      <span className="px-2 py-0.2 rounded-full bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200 font-mono text-[9px] font-bold">
                        {foundRoyalCustomer.tier}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                      Account: {foundRoyalCustomer.accountNumber}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Domicile: {foundRoyalCustomer.branch}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono">
                    Instant Clearing
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mode C: Other Bank / NPSB / BEFTN / RTGS / Scheduled / Recurring */}
          {transferType !== 'own_account' && transferType !== 'royal_bank' && (
            <div className="space-y-3">
              {/* Quick Pick from Saved Beneficiaries */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[11px] text-slate-500 block mb-2 font-medium">
                  Select from Saved Payees or enter new details below:
                </span>
                <BeneficiarySelector
                  beneficiaries={beneficiaries}
                  onSelect={handleSelectBeneficiary}
                  onAddNew={onAddNewBeneficiary}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Beneficiary Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Manhattan Prime Realty LLC"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Account / IBAN Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0912-3810-4491"
                      value={recipientAccount}
                      onChange={(e) => {
                        setRecipientAccount(e.target.value);
                        setRoutingVerified(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleVerifyAccount}
                      isLoading={isVerifyingRouting}
                      className="whitespace-nowrap text-xs"
                    >
                      {routingVerified ? 'Verified ✓' : 'Verify'}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Receiving Bank Name
                  </label>
                  <select
                    value={recipientBank}
                    onChange={(e) => setRecipientBank(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="JPMorgan Chase NY">JPMorgan Chase NY</option>
                    <option value="Standard Chartered Bank">Standard Chartered Bank</option>
                    <option value="Citibank NA">Citibank NA</option>
                    <option value="HSBC Private Bank">HSBC Private Bank</option>
                    <option value="Banque Pictet Geneva">Banque Pictet Geneva</option>
                    <option value="Islami Bank Bangladesh Ltd">Islami Bank Bangladesh Ltd</option>
                    <option value="BRAC Bank Limited">BRAC Bank Limited</option>
                    <option value="Eastern Bank PLC">Eastern Bank PLC</option>
                    <option value="Dutch-Bangla Bank">Dutch-Bangla Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Routing Number / SWIFT BIC
                  </label>
                  <input
                    type="text"
                    value={recipientRouting}
                    onChange={(e) => setRecipientRouting(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Schedule/Recurring Specific Terms */}
          {transferType === 'scheduled' && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
              <label className="block text-amber-900 dark:text-amber-200 font-bold mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Select Execution Date
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
              />
            </div>
          )}

          {transferType === 'recurring' && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
              <label className="block text-blue-900 dark:text-blue-200 font-bold mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Recurring Standing Order Frequency
              </label>
              <select
                value={recurringFrequency}
                onChange={(e) => setRecurringFrequency(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
              >
                <option value="weekly">Every Week (7 Days)</option>
                <option value="biweekly">Every Two Weeks (14 Days)</option>
                <option value="monthly">Monthly Recurring (30 Days)</option>
                <option value="quarterly">Quarterly Standing Order (90 Days)</option>
              </select>
            </div>
          )}
        </div>

        {/* Amount & Purpose Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
          <label className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
            3. Transfer Amount & Purpose
          </label>

          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-lg text-slate-400">
                {selectedSourceAccount?.currency === 'USD' ? '$' : selectedSourceAccount?.currency}
              </span>
              <input
                type="number"
                min={1}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-2xl font-mono font-extrabold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-royal-500"
              />
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[100, 500, 1000, 2500, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400"
                >
                  +${val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(selectedSourceAccount?.availableBalance.toString() || '0')}
                className="px-2.5 py-1 rounded-lg border border-royal-200 dark:border-royal-800 bg-royal-50 dark:bg-royal-950 text-royal-700 dark:text-gold-400 font-mono text-[11px] font-bold"
              >
                Max Balance
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Reference Note / Remittance Purpose
            </label>
            <input
              type="text"
              placeholder="e.g. Invoice #98402, Family Escrow, Consulting Retainer"
              value={referenceNote}
              onChange={(e) => setReferenceNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          {/* Clearing Fee & Totals Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-slate-500">
              <span>Clearing Network Fee:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {currentFee === 0 ? 'FREE (0.00)' : `$${currentFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-900 dark:text-white font-bold pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <span>Total Debited Amount:</span>
              <span className="font-mono text-base text-royal-950 dark:text-gold-400">
                ${totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="gold"
          size="lg"
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
          className="w-full text-xs font-bold py-3.5 shadow-md"
        >
          Review & Authorize Transfer
        </Button>
      </form>
    </div>
  );
};
