import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Alert } from '../../components/ui/Alert.tsx';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('private_banking');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-royal-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Institutional Communications
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Connect with Private Client Advisory.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Our relationship directors and sovereign lending specialists are available for discreet in-person consultations in London, Zurich, New York, and Singapore.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Global Headquarters Directory
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Reach direct private banking desks without interactive voice response delay.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  London Global Office
                </span>
                <p className="text-slate-500">14 Berkeley Square, Mayfair, London W1J 6BQ</p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-400 space-y-1">
                  <div>+44 20 7946 0912</div>
                  <div className="text-royal-600 dark:text-gold-400 font-sans">london.desk@royalbank.com</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  Zurich Wealth Pavilion
                </span>
                <p className="text-slate-500">Bahnhofstrasse 45, 8001 Zürich, Switzerland</p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-400 space-y-1">
                  <div>+41 44 214 8000</div>
                  <div className="text-royal-600 dark:text-gold-400 font-sans">zurich.desk@royalbank.com</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  New York Custody Center
                </span>
                <p className="text-slate-500">48 Wall Street, 22nd Floor, New York, NY 10005</p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-400 space-y-1">
                  <div>+1 212 555 0198</div>
                  <div className="text-royal-600 dark:text-gold-400 font-sans">ny.desk@royalbank.com</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  Singapore Treasury Hub
                </span>
                <p className="text-slate-500">10 Marina Boulevard, Tower 2, Singapore 018983</p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-400 space-y-1">
                  <div>+65 6812 9000</div>
                  <div className="text-royal-600 dark:text-gold-400 font-sans">sg.desk@royalbank.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Submit Private Inquiry
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Messages are routed securely to the regional managing director.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Legal Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lord Julian Sterling"
                    required
                  />
                  <Input
                    label="Corporate / Private Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. julian@sterlingfamily.ch"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Nature of Inquiry
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium"
                  >
                    <option value="private_banking">Private Client Wealth Onboarding (&gt;$250k)</option>
                    <option value="corporate">Corporate Treasury & Commercial Multi-Ledger</option>
                    <option value="mortgage">Prime International Real Estate Mortgage</option>
                    <option value="escrow">Institutional Escrow & Bullion Custody</option>
                    <option value="governance">Regulatory & Compliance Oversight</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Consultation Brief
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Detail liquidity amounts, timeline requirements, and requested domicile..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-royal-600"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  className="w-full text-xs"
                  isLoading={loading}
                  icon={<Send className="w-3.5 h-3.5" />}
                  iconPosition="right"
                >
                  Transmit Secure Inquiry
                </Button>
              </form>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Transmission Acknowledged
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your inquiry has been assigned tracking key <span className="font-mono font-semibold text-slate-900 dark:text-white">RB-INQ-991204</span>. A Senior Relationship Director will contact you within two business hours.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Submit Another Inquiry
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
