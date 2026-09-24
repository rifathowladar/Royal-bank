import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { cardService } from '../../../backend/services/cardService.ts';
import { accountService } from '../../../backend/services/accountService.ts';
import {
  Card as CardType,
  CardStatement,
  EMIPlan,
  CardOffer,
  Account,
  Transaction,
} from '../../../backend/types/index.ts';
import { CardVisual } from '../../../components/banking/CardVisual.tsx';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Gift,
  Award,
  Clock,
  ArrowRight,
  Download,
  Percent,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  FileText,
  Tag,
  ArrowLeft,
} from 'lucide-react';

export const CreditCardPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [card, setCard] = useState<CardType | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [statements, setStatements] = useState<CardStatement[]>([]);
  const [emiPlans, setEmiPlans] = useState<EMIPlan[]>([]);
  const [eligibleTxs, setEligibleTxs] = useState<Transaction[]>([]);
  const [offers, setOffers] = useState<CardOffer[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'overview' | 'emi' | 'statements' | 'rewards' | 'offers'
  const [activeTab, setActiveTab] = useState<'overview' | 'emi' | 'statements' | 'rewards' | 'offers'>('overview');

  // Pay Bill Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmountType, setPayAmountType] = useState<'min' | 'full' | 'custom'>('full');
  const [customPayAmount, setCustomPayAmount] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  // EMI Conversion Modal
  const [emiModalOpen, setEmiModalOpen] = useState(false);
  const [selectedTxForEmi, setSelectedTxForEmi] = useState<Transaction | null>(null);
  const [selectedTenure, setSelectedTenure] = useState<3 | 6 | 12 | 24>(12);
  const [isConvertingEmi, setIsConvertingEmi] = useState(false);

  // Redeem Rewards Modal
  const [rewardsModalOpen, setRewardsModalOpen] = useState(false);
  const [rewardRedeemType, setRewardRedeemType] = useState<'statement_credit' | 'cash_deposit'>('statement_credit');
  const [pointsToRedeem, setPointsToRedeem] = useState('10000');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const allCards = await cardService.getCards(user?.id);
      const cc = allCards.find((c) => c.type === 'credit') || allCards[1] || allCards[0];
      setCard(cc);

      const accs = await accountService.getAccounts(user?.id);
      setAccounts(accs);
      if (accs.length > 0) setSourceAccountId(accs[0].id);

      const stmts = await cardService.getCardStatements(cc?.id);
      setStatements(stmts);

      const plans = await cardService.getEMIOffers(cc?.id);
      setEmiPlans(plans);

      const txs = await cardService.getEligibleTransactionsForEMI(cc?.id);
      setEligibleTxs(txs);

      const cardOffers = await cardService.getCardOffers();
      setOffers(cardOffers);
    } catch (err: any) {
      toastError(err.message || 'Failed to load credit card data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle Pay Credit Card Bill
  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;

    let amount = 0;
    if (payAmountType === 'min') {
      amount = card.minimumDue || 712.5;
    } else if (payAmountType === 'full') {
      amount = card.outstandingBalance || 14250;
    } else {
      amount = parseFloat(customPayAmount);
    }

    if (isNaN(amount) || amount <= 0) {
      toastError('Please enter a valid payment amount');
      return;
    }

    try {
      setIsPaying(true);
      await cardService.payCreditCardBill({
        cardId: card.id,
        sourceAccountId,
        amount,
        note: `Credit card payment - ${payAmountType.toUpperCase()}`,
      });
      success(`Successfully paid ${formatCurrency(amount)} toward your credit card balance.`);
      setPayModalOpen(false);
      await loadData();
    } catch (err: any) {
      toastError(err.message || 'Payment execution failed');
    } finally {
      setIsPaying(false);
    }
  };

  // Handle EMI Conversion
  const handleConvertEMI = async () => {
    if (!card || !selectedTxForEmi) return;

    const rateMap = { 3: 0, 6: 3.5, 12: 5.2, 24: 7.0 };
    const interestRate = rateMap[selectedTenure];

    try {
      setIsConvertingEmi(true);
      await cardService.convertTransactionToEMI({
        cardId: card.id,
        transactionId: selectedTxForEmi.id,
        tenureMonths: selectedTenure,
        interestRate,
      });
      success(`Transaction converted to ${selectedTenure}-month EMI installment plan!`);
      setEmiModalOpen(false);
      setSelectedTxForEmi(null);
      await loadData();
    } catch (err: any) {
      toastError(err.message || 'EMI conversion failed');
    } finally {
      setIsConvertingEmi(false);
    }
  };

  // Handle Rewards Redemption
  const handleRedeemRewards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;
    const pts = parseInt(pointsToRedeem, 10);
    if (isNaN(pts) || pts <= 0 || pts > (card.rewardPoints || 0)) {
      toastError('Invalid points amount');
      return;
    }

    try {
      setIsRedeeming(true);
      const res = await cardService.redeemRewards(
        card.id,
        pts,
        rewardRedeemType,
        sourceAccountId
      );
      success(`Successfully redeemed ${pts.toLocaleString()} points for ${formatCurrency(res.value)} credit!`);
      setRewardsModalOpen(false);
      await loadData();
    } catch (err: any) {
      toastError(err.message || 'Rewards redemption failed');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (loading || !card) {
    return <LoadingState message="Loading private client credit terminal..." />;
  }

  const creditLimit = card.creditLimit || 100000;
  const availableCredit = card.availableCredit || 85750;
  const outstanding = card.outstandingBalance || 14250;
  const minimumDue = card.minimumDue || 712.5;
  const dueDate = card.paymentDueDate || '2026-10-15';
  const utilPercent = Math.round((outstanding / creditLimit) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bank/cards')}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-purple-500" />
              Private Client Palladium Credit
            </h1>
            <p className="text-xs text-slate-500">
              Card ending in {card.cardNumberMasked.slice(-4)} · Flexible liquidity, statement billing & concierge rewards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setPayModalOpen(true)}
            className="bg-royal-600 hover:bg-royal-500 flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" />
            Pay Card Bill
          </Button>
        </div>
      </div>

      {/* Credit Limits Dashboard Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Credit Limit</div>
          <div className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(creditLimit)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">0% foreign transaction fees</div>
        </Card>

        <Card className="p-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200 dark:border-slate-800">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">
            Available Limit
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(availableCredit)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Ready for immediate spend</div>
        </Card>

        <Card className="p-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200 dark:border-slate-800">
          <div className="text-xs text-rose-600 dark:text-rose-400 uppercase tracking-wider font-semibold">
            Current Outstanding
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(outstanding)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{utilPercent}% credit utilization</div>
        </Card>

        <Card className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-800 dark:text-gold-400 uppercase tracking-wider font-semibold">
              Payment Due
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-gold-200">
              Due in 22 days
            </span>
          </div>
          <div className="text-2xl font-bold font-serif text-amber-900 dark:text-gold-300 mt-1">
            {formatCurrency(minimumDue)} <span className="text-xs font-sans font-normal text-slate-500">min</span>
          </div>
          <div className="text-[11px] text-amber-700 dark:text-gold-400/80 mt-1">
            Due on {formatDate(dueDate)}
          </div>
        </Card>
      </div>

      {/* Hero: Credit Visual & Navigation Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 flex flex-col items-center">
          <CardVisual card={card} />
          
          <div className="w-full max-w-[420px] mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-gold-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Reward Balance:</span>
            </div>
            <span className="font-bold font-mono text-royal-600 dark:text-gold-400">
              {(card.rewardPoints || 48250).toLocaleString()} pts ({formatCurrency(((card.rewardPoints || 48250) * 0.01))})
            </span>
          </div>
        </div>

        <div className="lg:col-span-7">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 border-b-2 cursor-pointer shrink-0 transition-colors ${
                activeTab === 'overview'
                  ? 'border-royal-600 dark:border-gold-400 text-royal-600 dark:text-gold-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Overview & Pay
            </button>
            <button
              onClick={() => setActiveTab('emi')}
              className={`px-4 py-2 border-b-2 cursor-pointer shrink-0 transition-colors ${
                activeTab === 'emi'
                  ? 'border-royal-600 dark:border-gold-400 text-royal-600 dark:text-gold-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              EMI Conversion ({emiPlans.length} Active)
            </button>
            <button
              onClick={() => setActiveTab('statements')}
              className={`px-4 py-2 border-b-2 cursor-pointer shrink-0 transition-colors ${
                activeTab === 'statements'
                  ? 'border-royal-600 dark:border-gold-400 text-royal-600 dark:text-gold-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Statements ({statements.length})
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-4 py-2 border-b-2 cursor-pointer shrink-0 transition-colors ${
                activeTab === 'rewards'
                  ? 'border-royal-600 dark:border-gold-400 text-royal-600 dark:text-gold-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Rewards & Cashback
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 border-b-2 cursor-pointer shrink-0 transition-colors ${
                activeTab === 'offers'
                  ? 'border-royal-600 dark:border-gold-400 text-royal-600 dark:text-gold-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Card Offers ({offers.length})
            </button>
          </div>

          {/* TAB 1: Overview & Pay */}
          {activeTab === 'overview' && (
            <div className="pt-4 space-y-4">
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 mb-3">
                  Billing Cycle & Repayment Center
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500">Statement Balance (Sep 15)</span>
                    <div className="text-xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-1">
                      {formatCurrency(card.lastStatementBalance || 12480)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Cleared last cycle</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500">Minimum Monthly Due</span>
                    <div className="text-xl font-bold font-serif text-amber-600 dark:text-gold-400 mt-1">
                      {formatCurrency(minimumDue)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Avoid late fees & preserve credit rating</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setPayAmountType('full');
                      setPayModalOpen(true);
                    }}
                    className="flex-1 bg-royal-600 hover:bg-royal-500"
                  >
                    Pay Full Outstanding ({formatCurrency(outstanding)})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPayAmountType('min');
                      setPayModalOpen(true);
                    }}
                    className="flex-1"
                  >
                    Pay Minimum ({formatCurrency(minimumDue)})
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setPayAmountType('custom');
                      setPayModalOpen(true);
                    }}
                    className="text-royal-600 dark:text-gold-400"
                  >
                    Custom Amount &rarr;
                  </Button>
                </div>
              </Card>

              {/* Quick Perks Overview */}
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  Included Private Client Card Privileges
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Global Airport Lounge Access</div>
                      <div className="text-slate-500">Unlimited access to Priority Pass & Centurion Lounges worldwide for cardholder + 2 guests.</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">3x Rewards on Dining & Luxury Travel</div>
                      <div className="text-slate-500">Earn 3 points per $1 spent on flights, hotels, and fine dining establishments.</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: EMI Conversion */}
          {activeTab === 'emi' && (
            <div className="pt-4 space-y-4">
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100">
                      Convert Purchases into Easy Monthly Installments (EMI)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Split large credit card transactions ($200+) into 3, 6, 12, or 24 monthly installments at preferential interest rates.
                    </p>
                  </div>
                </div>

                {/* Active EMI Plans */}
                {emiPlans.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Active Installment Schedules ({emiPlans.length})
                    </h3>
                    {emiPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            {plan.merchantName}
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                              {plan.tenureMonths} Months Plan
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Original: {formatCurrency(plan.originalAmount)} · Rate: {plan.interestRate}% APR
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(plan.monthlyInstallment)} / mo
                          </div>
                          <div className="text-xs text-slate-400">
                            {plan.remainingMonths} of {plan.tenureMonths} months remaining
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Eligible Transactions for EMI */}
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Eligible Transactions for Conversion
                </h3>
                <div className="space-y-2">
                  {eligibleTxs.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-royal-400 dark:hover:border-gold-400 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {tx.counterpartyName || tx.description}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {formatDate(tx.timestamp)} · {tx.category}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(tx.amount)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTxForEmi(tx);
                            setEmiModalOpen(true);
                          }}
                          className="text-xs text-royal-600 dark:text-gold-400"
                        >
                          Convert to EMI
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: Statements */}
          {activeTab === 'statements' && (
            <div className="pt-4 space-y-4">
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 mb-1">
                  Monthly Card Statements
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Official audited monthly statements certified by Royal Bank Treasury Services.
                </p>

                <div className="space-y-3">
                  {statements.map((stmt) => (
                    <div
                      key={stmt.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-royal-100 dark:bg-royal-950 flex items-center justify-center text-royal-600 dark:text-gold-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {stmt.monthYear} Statement
                          </div>
                          <div className="text-xs text-slate-500">
                            Statement Date: {formatDate(stmt.statementDate)} · New Charges: {formatCurrency(stmt.newCharges)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                            Total Due: {formatCurrency(stmt.totalDue)}
                          </div>
                          <div className="text-xs text-slate-400">
                            Points Earned: +{stmt.rewardPointsEarned.toLocaleString()}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            success(`Downloading ${stmt.monthYear} statement PDF...`);
                          }}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: Rewards & Cashback */}
          {activeTab === 'rewards' && (
            <div className="pt-4 space-y-4">
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Award className="w-5 h-5 text-gold-500" />
                      Rewards & Cashback Concierge
                    </h2>
                    <p className="text-xs text-slate-500">
                      Redeem points instantly for statement balance credits, liquid account deposits, or private airline miles.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setRewardsModalOpen(true)}
                    className="bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold"
                  >
                    Redeem Points Now
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20">
                    <span className="text-xs text-amber-800 dark:text-gold-400 uppercase font-semibold tracking-wider">
                      Reward Points Balance
                    </span>
                    <div className="text-2xl font-bold font-serif text-amber-950 dark:text-gold-300 mt-1">
                      {(card.rewardPoints || 48250).toLocaleString()} <span className="text-xs font-sans font-normal">pts</span>
                    </div>
                    <div className="text-xs text-amber-700 dark:text-gold-400/80 mt-1 font-mono">
                      Equivalent Value: {formatCurrency(((card.rewardPoints || 48250) * 0.01))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <span className="text-xs text-emerald-800 dark:text-emerald-400 uppercase font-semibold tracking-wider">
                      Accrued Cashback Balance
                    </span>
                    <div className="text-2xl font-bold font-serif text-emerald-950 dark:text-emerald-300 mt-1">
                      {formatCurrency(card.cashbackEarned || 324.8)}
                    </div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-400/80 mt-1">
                      Auto-credited at billing cycle end
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    Points Multiplier Structure:
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-royal-600 dark:text-gold-400 text-sm">3.0x</div>
                      <div className="text-slate-500 text-[11px]">Dining & Flights</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-royal-600 dark:text-gold-400 text-sm">2.0x</div>
                      <div className="text-slate-500 text-[11px]">Luxury Hotels</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-royal-600 dark:text-gold-400 text-sm">1.5x</div>
                      <div className="text-slate-500 text-[11px]">All Other Purchases</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 5: Card Offers */}
          {activeTab === 'offers' && (
            <div className="pt-4 space-y-4">
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-500" />
                  Curated Merchant Offers & Perks
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Exclusive private privileges negotiated exclusively for Royal Bank cardholders.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-gold-400 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                            {offer.category}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Until {formatDate(offer.validUntil)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {offer.title}
                        </h4>
                        <div className="text-xs font-semibold text-royal-600 dark:text-gold-400 mt-1">
                          {offer.discountText}
                        </div>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                          {offer.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-400">
                          Code: {offer.promoCode || 'AUTO-ENROLLED'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => success(`Privilege "${offer.title}" enrolled!`)}
                          className="text-royal-600 dark:text-gold-400 font-bold"
                        >
                          Enroll Offer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Pay Bill Modal */}
      <Modal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} title="Pay Credit Card Bill">
        <form onSubmit={handlePayBill} className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex justify-between">
            <span className="text-slate-500">Current Outstanding:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatCurrency(outstanding)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Select Amount Option
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPayAmountType('full')}
                className={`p-2.5 rounded-lg border text-center text-xs font-semibold cursor-pointer transition-all ${
                  payAmountType === 'full'
                    ? 'bg-royal-50 dark:bg-royal-950/60 border-royal-600 text-royal-700 dark:text-gold-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                Full Balance
                <div className="text-[11px] font-mono mt-0.5">{formatCurrency(outstanding)}</div>
              </button>

              <button
                type="button"
                onClick={() => setPayAmountType('min')}
                className={`p-2.5 rounded-lg border text-center text-xs font-semibold cursor-pointer transition-all ${
                  payAmountType === 'min'
                    ? 'bg-royal-50 dark:bg-royal-950/60 border-royal-600 text-royal-700 dark:text-gold-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                Minimum Due
                <div className="text-[11px] font-mono mt-0.5">{formatCurrency(minimumDue)}</div>
              </button>

              <button
                type="button"
                onClick={() => setPayAmountType('custom')}
                className={`p-2.5 rounded-lg border text-center text-xs font-semibold cursor-pointer transition-all ${
                  payAmountType === 'custom'
                    ? 'bg-royal-50 dark:bg-royal-950/60 border-royal-600 text-royal-700 dark:text-gold-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                Other Amount
                <div className="text-[11px] font-mono mt-0.5">Custom</div>
              </button>
            </div>
          </div>

          {payAmountType === 'custom' && (
            <Input
              label="Custom Payment Amount ($ USD)"
              type="number"
              step="0.01"
              value={customPayAmount}
              onChange={(e) => setCustomPayAmount(e.target.value)}
              placeholder="e.g. 5000"
              required
            />
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Debit Source Account
            </label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber}) - Available: {formatCurrency(acc.availableBalance)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setPayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isPaying}>
              Authorize & Pay Now
            </Button>
          </div>
        </form>
      </Modal>

      {/* EMI Conversion Calculator Modal */}
      {selectedTxForEmi && (
        <Modal
          isOpen={emiModalOpen}
          onClose={() => setEmiModalOpen(false)}
          title="Convert Transaction to Installment Plan"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500">Selected Purchase</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedTxForEmi.counterpartyName || selectedTxForEmi.description}
              </div>
              <div className="text-lg font-mono font-bold text-royal-600 dark:text-gold-400 mt-1">
                {formatCurrency(selectedTxForEmi.amount)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
                Select Installment Tenure
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { months: 3, rate: 0, label: '3 Months (0% APR)' },
                  { months: 6, rate: 3.5, label: '6 Months (3.5%)' },
                  { months: 12, rate: 5.2, label: '12 Months (5.2%)' },
                  { months: 24, rate: 7.0, label: '24 Months (7.0%)' },
                ].map((t) => (
                  <button
                    key={t.months}
                    type="button"
                    onClick={() => setSelectedTenure(t.months as any)}
                    className={`p-2.5 rounded-lg border text-center text-xs cursor-pointer transition-all ${
                      selectedTenure === t.months
                        ? 'bg-royal-50 dark:bg-royal-950/60 border-royal-600 text-royal-700 dark:text-gold-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>{t.months} Mos</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{t.rate === 0 ? 'No Interest' : `${t.rate}% APR`}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Monthly Payment */}
            {(() => {
              const rates: Record<number, number> = { 3: 0, 6: 3.5, 12: 5.2, 24: 7.0 };
              const rate = rates[selectedTenure] || 0;
              const interest = (selectedTxForEmi.amount * (rate / 100) * selectedTenure) / 12;
              const totalRepay = selectedTxForEmi.amount + interest;
              const monthly = totalRepay / selectedTenure;

              return (
                <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Monthly Installment:</span>
                    <span className="font-bold font-mono text-purple-700 dark:text-purple-300 text-sm">
                      {formatCurrency(monthly)} / month
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total Interest Payable:</span>
                    <span className="font-mono font-semibold">{formatCurrency(interest)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-purple-200/60 dark:border-purple-800/60">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Total Repayment:</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                      {formatCurrency(totalRepay)}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" type="button" onClick={() => setEmiModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConvertEMI} loading={isConvertingEmi}>
                Confirm Conversion
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Redeem Rewards Modal */}
      <Modal
        isOpen={rewardsModalOpen}
        onClose={() => setRewardsModalOpen(false)}
        title="Redeem Private Client Rewards"
      >
        <form onSubmit={handleRedeemRewards} className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex justify-between">
            <span className="text-slate-500">Available Points:</span>
            <span className="font-bold font-mono text-gold-500">
              {(card.rewardPoints || 48250).toLocaleString()} pts
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Redemption Destination
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRewardRedeemType('statement_credit')}
                className={`p-2.5 rounded-lg border text-left text-xs font-semibold cursor-pointer ${
                  rewardRedeemType === 'statement_credit'
                    ? 'bg-royal-50 dark:bg-royal-950/60 border-royal-600 text-royal-700 dark:text-gold-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                Statement Credit
                <div className="text-[11px] font-normal text-slate-400">Reduce card balance</div>
              </button>
              <button
                type="button"
                onClick={() => setRewardRedeemType('cash_deposit')}
                className={`p-2.5 rounded-lg border text-left text-xs font-semibold cursor-pointer ${
                  rewardRedeemType === 'cash_deposit'
                    ? 'bg-royal-50 dark:bg-royal-950/60 border-royal-600 text-royal-700 dark:text-gold-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                Deposit to Account
                <div className="text-[11px] font-normal text-slate-400">Transfer cash to checking</div>
              </button>
            </div>
          </div>

          <Input
            label="Points to Redeem"
            type="number"
            step="1000"
            min="1000"
            max={card.rewardPoints || 48250}
            value={pointsToRedeem}
            onChange={(e) => setPointsToRedeem(e.target.value)}
            helperText={`Value: ${formatCurrency(parseInt(pointsToRedeem || '0', 10) * 0.01)} (100 points = $1.00 USD)`}
            required
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setRewardsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isRedeeming}>
              Confirm Redemption
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
