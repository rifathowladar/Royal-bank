import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { notificationService } from '../../../backend/services/notificationService.ts';
import { DetailedNotification, NotificationCategory } from '../../../backend/types/index.ts';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Search,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Home,
  FileText,
  Sparkles,
  Info,
  DollarSign,
  CheckCheck,
  Filter,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<DetailedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState({ total: 0, byCategory: {} as Record<NotificationCategory, number> });
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [list, counts] = await Promise.all([
        notificationService.getNotifications(user?.id || 'cust-001', selectedCategory, unreadOnly),
        notificationService.getUnreadCount(user?.id || 'cust-001'),
      ]);
      setNotifications(list);
      setUnreadCount(counts);
    } catch (err: any) {
      toastError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, selectedCategory, unreadOnly]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated = await notificationService.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      const counts = await notificationService.getUnreadCount(user?.id || 'cust-001');
      setUnreadCount(counts);
    } catch (err: any) {
      toastError(err.message || 'Action failed');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(user?.id || 'cust-001');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      const counts = await notificationService.getUnreadCount(user?.id || 'cust-001');
      setUnreadCount(counts);
      success('All notifications marked as read');
    } catch (err: any) {
      toastError(err.message || 'Action failed');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      const counts = await notificationService.getUnreadCount(user?.id || 'cust-001');
      setUnreadCount(counts);
      success('Notification removed');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete');
    }
  };

  const handleClearAll = async () => {
    try {
      setIsClearing(true);
      await notificationService.clearAllNotifications(user?.id || 'cust-001');
      setNotifications([]);
      setUnreadCount({ total: 0, byCategory: {} as any });
      setClearModalOpen(false);
      success('Notification log cleared');
    } catch (err: any) {
      toastError(err.message || 'Failed to clear');
    } finally {
      setIsClearing(false);
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'transactions':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      case 'cards':
        return <CreditCard className="w-4 h-4 text-royal-600 dark:text-gold-400" />;
      case 'loans':
        return <Home className="w-4 h-4 text-blue-500" />;
      case 'bills':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'promotions':
        return <Sparkles className="w-4 h-4 text-gold-500" />;
      case 'system':
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const categories: Array<{ id: NotificationCategory | 'all'; label: string; count?: number }> = [
    { id: 'all', label: 'All Alerts', count: unreadCount.total },
    { id: 'transactions', label: 'Transactions', count: unreadCount.byCategory.transactions },
    { id: 'security', label: 'Security', count: unreadCount.byCategory.security },
    { id: 'cards', label: 'Cards', count: unreadCount.byCategory.cards },
    { id: 'loans', label: 'Loans & Mortgages', count: unreadCount.byCategory.loans },
    { id: 'bills', label: 'Bills & Utilities', count: unreadCount.byCategory.bills },
    { id: 'promotions', label: 'Exclusive Offers', count: unreadCount.byCategory.promotions },
    { id: 'system', label: 'System Notice', count: unreadCount.byCategory.system },
  ];

  const filteredList = notifications.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-royal-950 via-royal-900 to-navy-950 p-6 md:p-8 text-white shadow-xl border border-gold-500/20">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/20 text-gold-300 border border-gold-500/30 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" /> Notification Center
              </span>
              {unreadCount.total > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/80 text-white">
                  {unreadCount.total} Unread
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-gold-100">
              Activity & Security Notifications
            </h1>
            <p className="text-royal-200 text-sm mt-1">
              Real-time settlement notices, fraud risk alerts, and account updates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="border-white/20 text-white hover:bg-white/10 text-xs"
            >
              <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearModalOpen(true)}
              className="border-red-500/30 text-red-300 hover:bg-red-500/10 text-xs"
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-royal-900 text-white dark:bg-gold-500 dark:text-royal-950 font-semibold shadow-sm'
                    : 'bg-white dark:bg-royal-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-royal-800 border border-gray-200 dark:border-navy-800'
                }`}
              >
                <span>{cat.label}</span>
                {cat.count !== undefined && cat.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-gold-400 text-royal-950'
                        : 'bg-red-100 text-red-700 dark:bg-red-600 dark:text-white'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search input & unread toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer self-start sm:self-center">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="w-4 h-4 text-gold-500 rounded focus:ring-gold-400"
            />
            Show unread only
          </label>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <LoadingState message="Fetching notification feed..." />
      ) : filteredList.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No notifications found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            You are all caught up with your latest financial alerts.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.isRead) handleMarkAsRead(item.id);
                if (item.actionUrl) navigate(item.actionUrl);
              }}
              className="p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 bg-gold-50/40 dark:bg-gold-950/10 border-gold-500/30 ring-1 ring-gold-500/20"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-navy-800 shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{item.title}</h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-gold-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{item.message}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-gray-400">
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span className="uppercase font-semibold text-[10px] tracking-wider text-royal-600 dark:text-gold-400">
                      {item.category}
                    </span>
                    {item.actionLabel && (
                      <>
                        <span>•</span>
                        <span className="text-royal-600 dark:text-gold-400 font-semibold flex items-center gap-1 hover:underline">
                          {item.actionLabel} <ArrowRight className="w-3 h-3" />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!item.isRead && (
                  <button
                    onClick={(e) => handleMarkAsRead(item.id, e)}
                    className="p-1.5 text-gray-400 hover:text-emerald-500 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Clear All */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear Notifications"
        subtitle="Activity History Cleanse"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearModalOpen(false)}
              disabled={isClearing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearAll}
              isLoading={isClearing}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Confirm Clear All
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to permanently clear all notifications from your activity log?
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            This will purge all past transaction alerts, security notices, and promotional bulletins from this device.
          </p>
        </div>
      </Modal>
    </div>
  );
};
