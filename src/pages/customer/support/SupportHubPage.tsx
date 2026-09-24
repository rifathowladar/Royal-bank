import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { supportService } from '../../../backend/services/supportService.ts';
import { FAQItem, BranchAppointment } from '../../../backend/types/index.ts';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import {
  LifeBuoy,
  MessageSquare,
  PhoneCall,
  Calendar,
  Search,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Send,
  User,
  ShieldCheck,
  Headphones,
  Mail,
  Building,
  ArrowRight,
  Plus,
} from 'lucide-react';

export const SupportHubPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [appointments, setAppointments] = useState<BranchAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [faqCategory, setFaqCategory] = useState('All');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-01');

  // Modals & Chat
  const [liveChatOpen, setLiveChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'Good day Mr. Sterling. Welcome to Royal Bank Sovereign Concierge Desk. How may Victoria Ashford or the Private Banking team assist you today?',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    branchName: 'Royal Bank Flagship Mayfair & Manhattan Plaza',
    branchAddress: '450 Park Avenue, 28th Floor, New York, NY 10022',
    serviceType: 'Private Wealth Consultation & Estate Structuring',
    date: '2026-10-05',
    timeSlot: '14:00 - 15:00 EST',
    specialRequirements: '',
  });

  // Tab detection: /bank/support, /bank/support/contact, /bank/support/faq
  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes('/contact')) return 'contact';
    if (path.includes('/faq')) return 'faq';
    return 'hub';
  };

  const [activeTab, setActiveTab] = useState<'hub' | 'contact' | 'faq'>(getInitialTab());

  const loadData = async () => {
    try {
      setLoading(true);
      const [faqList, aptList] = await Promise.all([
        supportService.getFaqs(faqCategory, searchQuery),
        supportService.getAppointments(user?.id || 'cust-001'),
      ]);
      setFaqs(faqList);
      setAppointments(aptList);
    } catch (err: any) {
      toastError(err.message || 'Failed to load support information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, faqCategory]);

  useEffect(() => {
    const tab = getInitialTab();
    setActiveTab(tab);
  }, [location.pathname]);

  const handleTabChange = (tab: 'hub' | 'contact' | 'faq') => {
    setActiveTab(tab);
    if (tab === 'hub') navigate('/bank/support');
    else navigate(`/bank/support/${tab}`);
  };

  const handleSearchFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const list = await supportService.getFaqs(faqCategory, searchQuery);
      setFaqs(list);
    } catch (err: any) {
      toastError('Search failed');
    }
  };

  const handleVoteHelpful = async (faqId: string) => {
    try {
      const updatedCount = await supportService.voteFaqHelpful(faqId);
      setFaqs(faqs.map((f) => (f.id === faqId ? { ...f, helpfulCount: updatedCount } : f)));
      success('Thank you for your feedback!');
    } catch {
      toastError('Failed to record vote');
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Simulate instant concierge response
    setTimeout(() => {
      const agentMsg = {
        sender: 'agent' as const,
        text: `Thank you for your message. Victoria Ashford has logged this inquiry on your private sovereign dossier and our desk is processing your request immediately.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, agentMsg]);
    }, 1000);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newApt = await supportService.bookBranchAppointment({
        customerId: user?.id || 'cust-001',
        ...appointmentForm,
      });
      setAppointments([newApt, ...appointments]);
      setAppointmentModalOpen(false);
      success(`Private Banking consultation confirmed! Reference Token: ${newApt.tokenNumber}`);
    } catch (err: any) {
      toastError(err.message || 'Booking failed');
    }
  };

  if (loading) {
    return <LoadingState message="Connecting to Royal Sovereign Concierge Desk..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-royal-950 via-royal-900 to-navy-950 p-6 md:p-8 text-white shadow-xl border border-gold-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30 flex items-center gap-1.5">
                <Headphones className="w-4 h-4" /> 24/7 Sovereign Concierge Desk
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-gold-100">
              Customer Support & Concierge Services
            </h1>
            <p className="text-royal-200 text-sm mt-1 max-w-2xl">
              Connect with your dedicated Private Banker Victoria Ashford, raise dispute tickets, or book a private executive salon appointment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLiveChatOpen(true)}
              className="border-gold-500/40 text-gold-300 hover:bg-gold-500/10 text-xs"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" /> Start Live Concierge Chat
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/bank/support/tickets')}
              className="bg-gold-500 text-royal-950 hover:bg-gold-400 font-semibold text-xs"
            >
              <LifeBuoy className="w-4 h-4 mr-1.5" /> Manage Support Tickets
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap gap-2">
          {[
            { id: 'hub', label: 'Support Hub Overview', icon: LifeBuoy },
            { id: 'contact', label: 'Contact Bank & Salons', icon: PhoneCall },
            { id: 'faq', label: 'Knowledge Base & FAQ', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gold-500 text-royal-950 font-semibold shadow-md'
                    : 'text-royal-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: Hub */}
      {activeTab === 'hub' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Action Channels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card
                className="p-5 hover:border-gold-500 transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-navy-900 dark:to-navy-950"
                onClick={() => setLiveChatOpen(true)}
              >
                <div className="p-2.5 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 w-fit mb-3">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Live Concierge Chat</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Instant encrypted chat with assigned private bankers. Average response &lt; 30s.
                </p>
              </Card>

              <Card
                className="p-5 hover:border-gold-500 transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-navy-900 dark:to-navy-950"
                onClick={() => navigate('/bank/support/tickets')}
              >
                <div className="p-2.5 rounded-xl bg-royal-500/10 text-royal-600 dark:text-gold-400 w-fit mb-3">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Support Tickets</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Submit formal dispute investigations, SWIFT tracking, or technical queries.
                </p>
              </Card>

              <Card
                className="p-5 hover:border-gold-500 transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-navy-900 dark:to-navy-950"
                onClick={() => setAppointmentModalOpen(true)}
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Branch Salon Visit</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Schedule a private boardroom meeting in New York, London, Zurich, or Singapore.
                </p>
              </Card>
            </div>

            {/* Upcoming Appointments */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                  Scheduled Executive Appointments
                </h3>
                <Button variant="outline" size="sm" onClick={() => setAppointmentModalOpen(true)} className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Book New Appointment
                </Button>
              </div>

              {appointments.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No upcoming branch salon appointments.</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 rounded-xl border border-gray-200 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{apt.serviceType}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-royal-500 shrink-0" />
                          <span>{apt.branchName}</span>
                        </p>
                        <p className="text-[11px] font-mono text-royal-600 dark:text-gold-400 mt-1">
                          Date: {apt.date} • {apt.timeSlot} • Token: <strong>{apt.tokenNumber}</strong>
                        </p>
                      </div>

                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Advisor: {apt.advisorName || 'Senior Banker'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Assigned Banker Profile */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-royal-900 to-navy-950 text-white border-gold-500/30">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                  alt="Victoria Ashford"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gold-400 shadow-md"
                />
                <div>
                  <h3 className="font-bold text-gold-100 text-base">Victoria Ashford</h3>
                  <p className="text-xs text-gold-300">Managing Director & Private Banker</p>
                  <p className="text-[11px] text-royal-200 mt-0.5">Direct Line: +1 (212) 555-0100</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-royal-200 border-t border-white/10 pt-3">
                <div className="flex justify-between">
                  <span>Direct Desk:</span>
                  <span className="font-mono text-white">NYC Park Ave Salon</span>
                </div>
                <div className="flex justify-between">
                  <span>SWIFT GPI Desk:</span>
                  <span className="font-mono text-white">RB-TREASURY-01</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Available 24/7
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full mt-4 bg-gold-500 text-royal-950 hover:bg-gold-400 font-semibold text-xs"
                onClick={() => setLiveChatOpen(true)}
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Message Victoria
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                Global Priority Phone Lines
              </h3>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-navy-800">
                  <span>New York (Toll Free):</span>
                  <span className="font-mono font-bold">+1 (800) 555-ROYAL</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-navy-800">
                  <span>London Mayfair Desk:</span>
                  <span className="font-mono font-bold">+44 20 7946 0900</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Zurich Treasury Desk:</span>
                  <span className="font-mono font-bold">+41 44 668 1200</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Contact & Branches */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Building className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              Royal Bank Global Private Salons & Executive Suites
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Direct access private conference rooms and safe deposit vaults reserved for sovereign account holders.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-900/40">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-royal-100 dark:bg-royal-900 text-royal-800 dark:text-gold-300">
                  Headquarters & Americas
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-2">New York Flagship Salon</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  450 Park Avenue, 28th Floor, New York, NY 10022
                </p>
                <p className="text-xs font-mono text-royal-600 dark:text-gold-400 mt-2">+1 (212) 555-0100</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 text-xs"
                  onClick={() => {
                    setAppointmentForm({
                      ...appointmentForm,
                      branchName: 'New York Flagship Salon',
                      branchAddress: '450 Park Avenue, 28th Floor, New York, NY 10022',
                    });
                    setAppointmentModalOpen(true);
                  }}
                >
                  Book Salon Visit
                </Button>
              </div>

              <div className="p-5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-900/40">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-royal-100 dark:bg-royal-900 text-royal-800 dark:text-gold-300">
                  United Kingdom & EMEA
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-2">London Mayfair Suite</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  14 Berkeley Square, Mayfair, London W1J 6BQ
                </p>
                <p className="text-xs font-mono text-royal-600 dark:text-gold-400 mt-2">+44 20 7946 0900</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 text-xs"
                  onClick={() => {
                    setAppointmentForm({
                      ...appointmentForm,
                      branchName: 'London Mayfair Suite',
                      branchAddress: '14 Berkeley Square, Mayfair, London W1J 6BQ',
                    });
                    setAppointmentModalOpen(true);
                  }}
                >
                  Book Salon Visit
                </Button>
              </div>

              <div className="p-5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-900/40">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-royal-100 dark:bg-royal-900 text-royal-800 dark:text-gold-300">
                  Swiss Banking & Vaults
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-2">Zurich Paradeplatz Vault</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Bahnhofstrasse 45, 8001 Zurich, Switzerland
                </p>
                <p className="text-xs font-mono text-royal-600 dark:text-gold-400 mt-2">+41 44 668 1200</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 text-xs"
                  onClick={() => {
                    setAppointmentForm({
                      ...appointmentForm,
                      branchName: 'Zurich Paradeplatz Vault',
                      branchAddress: 'Bahnhofstrasse 45, 8001 Zurich, Switzerland',
                    });
                    setAppointmentModalOpen(true);
                  }}
                >
                  Book Salon Visit
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: FAQ */}
      {activeTab === 'faq' && (
        <Card className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-navy-800">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                Sovereign Knowledge Base & FAQ
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Frequently referenced policies regarding high-value wire transfers, cards, and security.
              </p>
            </div>

            <form onSubmit={handleSearchFaq} className="flex items-center gap-2 w-full sm:w-80">
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs"
              />
              <Button type="submit" variant="primary" size="sm" className="text-xs">
                Search
              </Button>
            </form>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-gray-200 dark:border-navy-800 overflow-hidden bg-gray-50/40 dark:bg-navy-900/30"
                >
                  <button
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-gray-100/50 dark:hover:bg-navy-800/50 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-royal-600 dark:text-gold-400 tracking-wider">
                        {faq.category}
                      </span>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">{faq.question}</h4>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-0 text-xs text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-navy-800">
                      <p className="mt-3">{faq.answer}</p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-navy-800">
                        <span className="text-[11px] text-gray-400">Was this answer helpful?</span>
                        <button
                          onClick={() => handleVoteHelpful(faq.id)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-gray-100 dark:bg-navy-800 hover:bg-emerald-50 text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Helpful ({faq.helpfulCount})</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Live Concierge Chat Drawer / Modal */}
      {liveChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-navy-900 w-full sm:max-w-md h-[550px] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-navy-700 flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-royal-950 to-royal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                    alt="Victoria"
                    className="w-10 h-10 rounded-full object-cover border border-gold-400"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-royal-950" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gold-100">Victoria Ashford</h4>
                  <p className="text-[10px] text-royal-200">Sovereign Desk • Active Now</p>
                </div>
              </div>
              <button
                onClick={() => setLiveChatOpen(false)}
                className="text-royal-200 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50 dark:bg-navy-950/40">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-royal-900 text-white dark:bg-gold-500 dark:text-royal-950 rounded-br-none'
                        : 'bg-white dark:bg-navy-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-navy-700 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="block text-[9px] mt-1 opacity-70 text-right">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-gray-200 dark:border-navy-800 flex gap-2">
              <Input
                placeholder="Type your message to Victoria..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="text-xs"
              />
              <Button type="submit" variant="primary" size="sm" className="shrink-0">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      {appointmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-navy-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Book Executive Boardroom Appointment
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Reserve private salon hours with Senior Wealth Managers and Legal Counsel.
            </p>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Private Salon Location
                </label>
                <select
                  value={appointmentForm.branchName}
                  onChange={(e) =>
                    setAppointmentForm({
                      ...appointmentForm,
                      branchName: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-900 dark:text-white"
                >
                  <option value="New York Flagship Salon">New York Flagship Salon (450 Park Ave)</option>
                  <option value="London Mayfair Suite">London Mayfair Suite (14 Berkeley Sq)</option>
                  <option value="Zurich Paradeplatz Vault">Zurich Paradeplatz Vault (Bahnhofstrasse 45)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Consultation Subject
                </label>
                <select
                  value={appointmentForm.serviceType}
                  onChange={(e) =>
                    setAppointmentForm({
                      ...appointmentForm,
                      serviceType: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-900 dark:text-white"
                >
                  <option value="Private Wealth Consultation & Estate Structuring">
                    Private Wealth Consultation & Estate Structuring
                  </option>
                  <option value="Cross-Border High Value Fedwire & FX Desk">
                    Cross-Border High Value Fedwire & FX Desk
                  </option>
                  <option value="Precious Metal & Bullion Physical Vault Access">
                    Precious Metal & Bullion Physical Vault Access
                  </option>
                  <option value="Corporate Syndicated Credit & Sovereign Facilities">
                    Corporate Syndicated Credit & Sovereign Facilities
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Preferred Date
                  </label>
                  <Input
                    type="date"
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Time Window
                  </label>
                  <select
                    value={appointmentForm.timeSlot}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, timeSlot: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-900 dark:text-white"
                  >
                    <option value="10:00 - 11:00 EST">10:00 - 11:00 EST</option>
                    <option value="11:30 - 12:30 EST">11:30 - 12:30 EST</option>
                    <option value="14:00 - 15:00 EST">14:00 - 15:00 EST</option>
                    <option value="16:00 - 17:00 EST">16:00 - 17:00 EST</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Special Notes / Security Details
                </label>
                <Input
                  placeholder="e.g. Accompanied by legal trustee or tax counsel"
                  value={appointmentForm.specialRequirements}
                  onChange={(e) =>
                    setAppointmentForm({ ...appointmentForm, specialRequirements: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-navy-800">
                <Button variant="outline" size="sm" onClick={() => setAppointmentModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Confirm Reservation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
