import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/index.ts';
import {
  transferService,
  Beneficiary,
} from '../../backend/index.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { LoadingState } from '../../components/ui/LoadingState.tsx';
import {
  ArrowLeft,
  Plus,
  Star,
  Search,
  Building2,
  Landmark,
  Pencil,
  Trash2,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const BeneficiariesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBen, setEditingBen] = useState<Beneficiary | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [nickName, setNickName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('Royal Bank');
  const [routingOrSwift, setRoutingOrSwift] = useState('ROBANUS33XXX');
  const [currency, setCurrency] = useState('USD');
  const [type, setType] = useState<'internal' | 'domestic' | 'international_swift'>('internal');

  const loadData = async () => {
    try {
      const data = await transferService.getBeneficiaries(user?.id || 'cust-001');
      setBeneficiaries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenAdd = () => {
    setEditingBen(null);
    setName('');
    setNickName('');
    setAccountNumber('');
    setBankName('Royal Bank');
    setRoutingOrSwift('ROBANUS33XXX');
    setCurrency('USD');
    setType('internal');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ben: Beneficiary) => {
    setEditingBen(ben);
    setName(ben.name);
    setNickName(ben.nickName || '');
    setAccountNumber(ben.accountNumber);
    setBankName(ben.bankName);
    setRoutingOrSwift(ben.routingOrSwift);
    setCurrency(ben.currency);
    setType(ben.type);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this payee from your directory?')) {
      await transferService.deleteBeneficiary(id);
      loadData();
    }
  };

  const handleToggleFavorite = async (id: string) => {
    await transferService.toggleFavorite(id);
    loadData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBen) {
        await transferService.updateBeneficiary(editingBen.id, {
          name,
          nickName,
          accountNumber,
          bankName,
          routingOrSwift,
          currency,
          type,
        });
      } else {
        await transferService.addBeneficiary({
          customerId: user?.id || 'cust-001',
          name,
          nickName,
          accountNumber,
          bankName,
          routingOrSwift,
          currency,
          type,
          country: type === 'international_swift' ? 'United Kingdom' : 'United States',
          isFavorite: false,
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = beneficiaries.filter((b) => {
    if (filterType === 'favorites' && !b.isFavorite) return false;
    if (filterType === 'internal' && b.type !== 'internal') return false;
    if (filterType === 'domestic' && b.type !== 'domestic') return false;
    if (filterType === 'international' && b.type !== 'international_swift') return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        (b.nickName && b.nickName.toLowerCase().includes(q)) ||
        b.accountNumber.includes(q) ||
        b.bankName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return <LoadingState type="table" message="Loading trusted payee directory..." />;
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/bank/transfers')}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="text-slate-600 dark:text-slate-400"
          >
            Transfers Hub
          </Button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Trusted Beneficiaries & Payees
            </h1>
            <p className="text-xs text-slate-500">
              Manage pre-authorized payment counterparties, corporate accounts, and family escrow links.
            </p>
          </div>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
          className="text-xs"
        >
          Add New Beneficiary
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search payees by legal name, alias, account number, or bank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Payees' },
            { id: 'favorites', label: '★ Favorites' },
            { id: 'internal', label: 'Royal Bank' },
            { id: 'domestic', label: 'Domestic' },
            { id: 'international', label: 'International SWIFT' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap text-xs transition-colors ${
                filterType === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Beneficiaries Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-400 text-xs space-y-3">
          <p>No beneficiaries registered on file matching your search query.</p>
          <Button variant="outline" size="sm" onClick={handleOpenAdd} className="text-xs">
            + Register Payee
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ben) => (
            <div
              key={ben.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-royal-50 dark:bg-royal-950/80 border border-royal-200/60 dark:border-royal-800 text-royal-700 dark:text-gold-400 flex items-center justify-center font-bold text-sm">
                    {ben.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {ben.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {ben.nickName || (ben.type === 'internal' ? 'Royal Bank Customer' : 'External Payee')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleFavorite(ben.id)}
                  className="p-1 rounded-full text-slate-300 hover:text-amber-400 transition-colors"
                >
                  <Star
                    className={`w-4 h-4 ${
                      ben.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 space-y-1 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400 font-sans text-[11px]">Account</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{ben.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-[11px]">Bank</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px] text-right">
                    {ben.bankName}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span className="font-sans">Routing/SWIFT</span>
                  <span>{ben.routingOrSwift}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(ben)}
                    icon={<Pencil className="w-3.5 h-3.5" />}
                    className="p-1.5 h-auto text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(ben.id)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    className="p-1.5 h-auto text-slate-400 hover:text-rose-500"
                  />
                </div>

                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => navigate(`/bank/transfers?to=${ben.id}`)}
                  icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Transfer Money
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Payee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBen ? 'Edit Beneficiary Payee' : 'Register Trusted Payee'}
        subtitle="Cryptographically verified beneficiary registry"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Payee Type & Routing Network
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'internal', label: 'Royal Bank' },
                { id: 'domestic', label: 'Domestic Bank' },
                { id: 'international_swift', label: 'Intl SWIFT' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setType(t.id as any);
                    if (t.id === 'internal') {
                      setBankName('Royal Bank');
                      setRoutingOrSwift('ROBANUS33XXX');
                    }
                  }}
                  className={`py-2 rounded-xl border font-bold text-xs transition-colors ${
                    type === t.id
                      ? 'border-royal-600 dark:border-gold-400 bg-royal-50 dark:bg-royal-950/60 text-royal-600 dark:text-gold-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Beneficiary Legal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Manhattan Prime Realty LLC"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Friendly Nickname / Alias (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Office Rent Escrow, College Tuition"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Account / IBAN Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 0912-3810-4491 or US89..."
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Bank Name
              </label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Routing / SWIFT Code
              </label>
              <input
                type="text"
                required
                value={routingOrSwift}
                onChange={(e) => setRoutingOrSwift(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              className="flex-1 text-xs"
            >
              Save Beneficiary
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
