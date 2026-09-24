import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/index.ts';
import {
  accountService,
  Account,
  ChequeBookRequest,
  ChequeStopRequest,
} from '../../backend/index.ts';
import { Button } from '../../components/ui/Button.tsx';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import {
  BookOpen,
  ArrowLeft,
  Truck,
  Building2,
  CheckCircle2,
  Ban,
  Clock,
  ShieldCheck,
  Plus,
  AlertCircle,
} from 'lucide-react';

export const ChequeBookPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAccountId = searchParams.get('accountId') || '';

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState(initialAccountId);
  const [leavesCount, setLeavesCount] = useState<25 | 50 | 100>(50);
  const [deliveryOption, setDeliveryOption] = useState<'branch_pickup' | 'registered_courier'>('registered_courier');
  const [branch, setBranch] = useState('New York Wall Street Flagship');

  const [requests, setRequests] = useState<ChequeBookRequest[]>([]);
  const [stoppedCheques, setStoppedCheques] = useState<ChequeStopRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Stop Cheque Modal
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [stopChequeNum, setStopChequeNum] = useState('');
  const [stopReason, setStopReason] = useState('Lost or Stolen Leaf');
  const [stopAmount, setStopAmount] = useState('');

  const loadData = async () => {
    try {
      const [accs, reqs, stops] = await Promise.all([
        accountService.getAccounts(user?.id || 'cust-001'),
        accountService.getChequeBookRequests(),
        accountService.getStoppedCheques(),
      ]);
      setAccounts(accs);
      if (!selectedAccountId && accs.length > 0) {
        setSelectedAccountId(accs[0].id);
      }
      setRequests(reqs);
      setStoppedCheques(stops);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) return;
    setSubmitting(true);
    try {
      const newReq = await accountService.requestChequeBook({
        accountId: selectedAccountId,
        leavesCount,
        deliveryOption,
        branch,
      });
      setSuccessMsg(`Cheque book requisition confirmed! Tracking reference: ${newReq.trackingNumber}`);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId || !stopChequeNum) return;
    try {
      await accountService.stopCheque({
        accountId: selectedAccountId,
        chequeNumber: stopChequeNum,
        reason: stopReason,
        amount: stopAmount ? parseFloat(stopAmount) : undefined,
      });
      setStopModalOpen(false);
      setStopChequeNum('');
      setStopAmount('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingState type="table" message="Loading cheque registry..." />;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/bank/accounts')}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="text-slate-600 dark:text-slate-400"
          >
            Accounts
          </Button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Cheque Book Requisition & Management
            </h1>
            <p className="text-xs text-slate-500">
              Request personalized security-watermarked cheque books or place emergency stop payment orders.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setStopModalOpen(true)}
          icon={<Ban className="w-3.5 h-3.5" />}
          className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 text-xs"
        >
          Stop Cheque Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Requisition Form (Left 1 Col) */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Order New Cheque Book
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Micr-encoded personalized cheque leaves
            </p>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Select Account
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.customNickName || acc.name} (#{acc.accountNumber.slice(-4)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Number of Leaves
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[25, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setLeavesCount(num as any)}
                    className={`py-2 rounded-xl border font-bold text-xs transition-colors ${
                      leavesCount === num
                        ? 'border-royal-600 dark:border-gold-400 bg-royal-50 dark:bg-royal-950/60 text-royal-600 dark:text-gold-400'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {num} Leaves
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Dispatch & Delivery Method
              </label>
              <div className="space-y-2">
                <label
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${
                    deliveryOption === 'registered_courier'
                      ? 'border-royal-600 dark:border-gold-400 bg-royal-50/40 dark:bg-royal-950/40'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryOption === 'registered_courier'}
                    onChange={() => setDeliveryOption('registered_courier')}
                  />
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Registered Armored Courier</div>
                      <div className="text-[10px] text-slate-500">Delivered to registered Park Ave domicile</div>
                    </div>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${
                    deliveryOption === 'branch_pickup'
                      ? 'border-royal-600 dark:border-gold-400 bg-royal-50/40 dark:bg-royal-950/40'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryOption === 'branch_pickup'}
                    onChange={() => setDeliveryOption('branch_pickup')}
                  />
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Branch Vault Pickup</div>
                      <div className="text-[10px] text-slate-500">Held securely at your domiciled branch</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              isLoading={submitting}
              className="w-full text-xs"
            >
              Order Cheque Book
            </Button>
          </form>
        </div>

        {/* Requests & Stop Status Table (Right 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Orders List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cheque Book Requisitions History
            </h3>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3 font-semibold">Order Date</th>
                    <th className="p-3 font-semibold">Account</th>
                    <th className="p-3 font-semibold">Leaves</th>
                    <th className="p-3 font-semibold">Tracking #</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {new Date(req.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {req.accountNumber}
                      </td>
                      <td className="p-3 font-sans text-slate-600 dark:text-slate-300">
                        {req.leavesCount} leaves
                      </td>
                      <td className="p-3 text-royal-600 dark:text-gold-400 font-semibold">
                        {req.trackingNumber || 'Pending'}
                      </td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stopped Cheques Registry */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Stopped Cheques Registry
                </h3>
                <p className="text-xs text-slate-500">
                  Cheque leaves flagged for non-payment clearing rejection
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStopModalOpen(true)}
                className="text-xs"
              >
                + Place Stop
              </Button>
            </div>

            {stoppedCheques.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No active cheque stop payment orders registered on file.
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3 font-semibold">Date Stopped</th>
                      <th className="p-3 font-semibold">Cheque #</th>
                      <th className="p-3 font-semibold">Reason</th>
                      <th className="p-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {stoppedCheques.map((stp) => (
                      <tr key={stp.id}>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {new Date(stp.stoppedAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          #{stp.chequeNumber}
                        </td>
                        <td className="p-3 font-sans text-slate-600 dark:text-slate-300">
                          {stp.reason}
                        </td>
                        <td className="p-3 font-sans">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Stop Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stop Cheque Modal */}
      <Modal
        isOpen={stopModalOpen}
        onClose={() => setStopModalOpen(false)}
        title="Immediate Cheque Stop Payment Order"
        maxWidth="md"
      >
        <form onSubmit={handleStopSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Select Depository Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.customNickName || acc.name} (#{acc.accountNumber.slice(-4)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Cheque Leaf Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 004812"
              value={stopChequeNum}
              onChange={(e) => setStopChequeNum(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Cheque Amount (Optional)
            </label>
            <input
              type="number"
              placeholder="$ Amount if known"
              value={stopAmount}
              onChange={(e) => setStopAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Reason for Stop
            </label>
            <select
              value={stopReason}
              onChange={(e) => setStopReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="Lost or Stolen Leaf">Lost or Stolen Leaf</option>
              <option value="Cheque Issued in Error">Cheque Issued in Error</option>
              <option value="Duplicate Cheque Issued">Duplicate Cheque Issued</option>
              <option value="Commercial Terms Cancelled">Commercial Terms Cancelled</option>
            </select>
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStopModalOpen(false)}
              className="flex-1 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="flex-1 text-xs"
            >
              Confirm Stop Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
