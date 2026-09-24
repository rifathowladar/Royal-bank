import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { supportService } from '../../../backend/services/supportService.ts';
import { DetailedSupportTicket } from '../../../backend/types/index.ts';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Send,
  User,
  Paperclip,
  Star,
  FileText,
  ShieldCheck,
  Headphones,
  CheckCheck,
} from 'lucide-react';

export const SupportTicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<DetailedSupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [rating, setRating] = useState(5);

  const loadTicket = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await supportService.getTicketById(id);
      setTicket(data);
    } catch (err: any) {
      toastError(err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !ticket) return;

    try {
      setIsSending(true);
      const updated = await supportService.addMessage(
        ticket.id,
        replyText.trim(),
        'user',
        user ? `${user.firstName} ${user.lastName}` : 'Alexander Sterling'
      );
      setTicket(updated);
      setReplyText('');
      success('Reply sent to assigned specialist.');

      // Simulate realistic agent follow-up reply after 3s
      setTimeout(async () => {
        try {
          const autoReply = await supportService.addMessage(
            ticket.id,
            `Mr. Sterling, thank you for providing these additional details. Our Treasury desk has logged your update with priority clearance.`,
            'agent',
            ticket.assignedAgent?.name || 'Victoria Ashford'
          );
          setTicket(autoReply);
        } catch {
          // Ignore background reply error
        }
      }, 3000);
    } catch (err: any) {
      toastError(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleResolveTicket = async () => {
    if (!ticket) return;
    try {
      const updated = await supportService.resolveTicket(ticket.id, rating);
      setTicket(updated);
      success('Case marked as resolved. Thank you!');
    } catch (err: any) {
      toastError(err.message || 'Failed to resolve case');
    }
  };

  if (loading) {
    return <LoadingState message="Loading encrypted case timeline..." />;
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ticket Not Found</h2>
        <p className="text-xs text-gray-500">The requested support dossier does not exist or has expired.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/bank/support/tickets')}>
          Return to Ticket Registry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back button & header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/bank/support/tickets')}
          className="text-xs font-semibold text-royal-700 dark:text-gold-400 hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Support Cases
        </button>

        {ticket.status !== 'resolved' && (
          <Button variant="outline" size="sm" onClick={handleResolveTicket} className="text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Mark Resolved
          </Button>
        )}
      </div>

      {/* Main Ticket Banner */}
      <Card className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-navy-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-royal-700 dark:text-gold-400 bg-royal-50 dark:bg-navy-900 px-2.5 py-0.5 rounded border border-royal-200 dark:border-navy-800">
                {ticket.ticketNumber}
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Category: {ticket.category}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400">
                {ticket.priority} Priority
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-500/15 text-blue-600 dark:text-blue-400">
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{ticket.subject}</h1>
          </div>

          <div className="text-right text-xs text-gray-500 shrink-0">
            <span>Opened: {new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Assigned Agent Card */}
        {ticket.assignedAgent && (
          <div className="mt-4 p-3.5 rounded-xl bg-gray-50 dark:bg-navy-900/60 border border-gray-100 dark:border-navy-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={ticket.assignedAgent.avatar}
                alt={ticket.assignedAgent.name}
                className="w-10 h-10 rounded-full object-cover border border-gold-400"
              />
              <div>
                <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                  {ticket.assignedAgent.name}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{ticket.assignedAgent.role}</p>
              </div>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Assigned Specialist
            </span>
          </div>
        )}
      </Card>

      {/* Messages Timeline */}
      <div className="space-y-4">
        {ticket.messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs space-y-2 leading-relaxed ${
                  isUser
                    ? 'bg-royal-900 text-white dark:bg-gold-500 dark:text-royal-950 rounded-br-none shadow-md'
                    : 'bg-white dark:bg-navy-900 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-navy-800 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-4 pb-1 border-b border-white/10 dark:border-navy-800">
                  <span className="font-bold text-[11px]">{msg.senderName}</span>
                  <span className="text-[10px] opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="whitespace-pre-wrap">{msg.message}</p>

                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="pt-2 border-t border-white/10 dark:border-navy-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                      Authenticated Attachments:
                    </span>
                    {msg.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-black/10 dark:bg-navy-950/60 text-xs"
                      >
                        <span className="flex items-center gap-1.5 font-mono truncate">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          {att.name}
                        </span>
                        <span className="text-[10px] opacity-70 shrink-0 ml-2">{att.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Input or Resolution Banner */}
      {ticket.status === 'resolved' ? (
        <Card className="p-6 text-center bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
            This case has been resolved
          </h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
            Need further assistance on this matter? Type below to reopen the investigation.
          </p>
        </Card>
      ) : null}

      <Card className="p-4">
        <form onSubmit={handleSendReply} className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Transmit Response to Desk
          </label>
          <textarea
            rows={3}
            placeholder="Type your message or request further documentation..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-900 dark:text-white"
            required
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white flex items-center gap-1"
            >
              <Paperclip className="w-3.5 h-3.5" /> Attach Document / Advice
            </button>

            <Button type="submit" variant="primary" size="sm" disabled={isSending}>
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {isSending ? 'Transmitting...' : 'Send Reply'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
