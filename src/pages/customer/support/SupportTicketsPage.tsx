import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { supportService } from '../../../backend/services/supportService.ts';
import {
  DetailedSupportTicket,
  SupportTicketCategory,
} from '../../../backend/types/index.ts';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import {
  LifeBuoy,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  MessageSquare,
  Shield,
  ArrowLeft,
} from 'lucide-react';

export const SupportTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<DetailedSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New ticket form
  const [newTicketForm, setNewTicketForm] = useState<{
    category: SupportTicketCategory;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>({
    category: 'Wire Transfer',
    subject: '',
    description: '',
    priority: 'high',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await supportService.getTickets(user?.id || 'cust-001');
      setTickets(list);
    } catch (err: any) {
      toastError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      toastError('Please fill in subject and details');
      return;
    }
    try {
      setIsSubmitting(true);
      const created = await supportService.createTicket({
        customerId: user?.id || 'cust-001',
        customerName: user ? `${user.firstName} ${user.lastName}` : 'Alexander Sterling',
        category: newTicketForm.category,
        subject: newTicketForm.subject.trim(),
        description: newTicketForm.description.trim(),
        priority: newTicketForm.priority,
      });

      setTickets([created, ...tickets]);
      setCreateModalOpen(false);
      setNewTicketForm({
        category: 'Wire Transfer',
        subject: '',
        description: '',
        priority: 'high',
      });
      success(`Ticket ${created.ticketNumber} created successfully! Victoria Ashford has been assigned.`);
      navigate(`/bank/support/tickets/${created.id}`);
    } catch (err: any) {
      toastError(err.message || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: DetailedSupportTicket['status']) => {
    switch (status) {
      case 'open':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'waiting_customer':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-500/15 text-gray-600 dark:text-gray-400">
            Waiting Client Response
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: DetailedSupportTicket['priority']) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-600 dark:text-red-400">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-600 dark:text-blue-400">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-500/20 text-gray-600 dark:text-gray-400">
            Standard
          </span>
        );
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.ticketNumber.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-royal-950 via-royal-900 to-navy-950 p-6 md:p-8 text-white shadow-xl border border-gold-500/20">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => navigate('/bank/support')}
                className="text-gold-300 hover:text-white text-xs flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Support Hub
              </button>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-gold-100">
              Dispute Investigations & Support Tickets
            </h1>
            <p className="text-royal-200 text-sm mt-1">
              Encrypted case registry tracked under ISO 20022 and banking compliance standards.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="bg-gold-500 text-royal-950 hover:bg-gold-400 font-semibold text-xs shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Open New Support Ticket
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'open', 'in_progress', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-royal-900 text-white dark:bg-gold-500 dark:text-royal-950 shadow-sm'
                  : 'bg-white dark:bg-navy-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 border border-gray-200 dark:border-navy-800'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search tickets by ID or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <LoadingState message="Loading support cases..." />
      ) : filteredTickets.length === 0 ? (
        <Card className="p-12 text-center">
          <LifeBuoy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No support tickets found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            You do not have any open or historical support cases in this view.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="mt-4 text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Ticket
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/bank/support/tickets/${t.id}`)}
              className="p-5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900/60 hover:border-gold-500 dark:hover:border-gold-500/50 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-royal-700 dark:text-gold-400 bg-royal-50 dark:bg-royal-950 px-2 py-0.5 rounded">
                    {t.ticketNumber}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{t.category}</span>
                  {getPriorityBadge(t.priority)}
                  {getStatusBadge(t.status)}
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white">{t.subject}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{t.description}</p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-navy-800">
                <div className="text-right text-xs">
                  <span className="text-gray-400 block text-[10px]">Assigned Specialist:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {t.assignedAgent?.name || 'Treasury Desk'}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    {new Date(t.lastUpdatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-royal-600 dark:text-gold-400 font-semibold">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {t.messages.length}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-navy-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Open Confidential Support Case
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Your inquiry will be directly routed to Senior Banker Victoria Ashford.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Category
                </label>
                <select
                  value={newTicketForm.category}
                  onChange={(e) =>
                    setNewTicketForm({ ...newTicketForm, category: e.target.value as any })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-900 dark:text-white"
                >
                  <option value="Wire Transfer">Wire Transfer & SWIFT Tracking</option>
                  <option value="Card Services">Card Limits & Physical Replacement</option>
                  <option value="Security & Fraud">Security, 2FA & Fraud Report</option>
                  <option value="Loan & Mortgages">Loan / DPS / FDR Management</option>
                  <option value="Bill Payments">Bill Payments & Utility Settlement</option>
                  <option value="Other">General Private Client Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Priority Level
                </label>
                <select
                  value={newTicketForm.priority}
                  onChange={(e) =>
                    setNewTicketForm({ ...newTicketForm, priority: e.target.value as any })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-900 dark:text-white"
                >
                  <option value="low">Low - Routine Account Notice</option>
                  <option value="medium">Medium - Within 12 Hours</option>
                  <option value="high">High - Within 2 Hours (Standard)</option>
                  <option value="urgent">Urgent - Immediate Treasury Interception</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Subject
                </label>
                <Input
                  placeholder="e.g. SWIFT MT103 confirmation copy for Zurich transfer"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Detailed Inquiry / Request
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide transaction references, dates, amounts, or instructions..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-navy-800">
                <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Routing Case...' : 'Submit Support Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
