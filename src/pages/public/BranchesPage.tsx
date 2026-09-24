import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, Search, ShieldCheck, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Input } from '../../components/ui/Input.tsx';

export const BranchesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [clientName, setClientName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('2026-10-15');

  const branches = [
    {
      id: 'lon',
      city: 'London',
      country: 'United Kingdom',
      name: 'Mayfair Global Flagship & Treasury',
      address: '14 Berkeley Square, London W1J 6BQ',
      phone: '+44 20 7946 0912',
      email: 'mayfair@royalbank.com',
      hours: 'Mon-Fri 08:30 - 18:00 · Sat by appointment',
      manager: 'Alistair Montgomery, Managing Director',
      facilities: ['Underground Safe Deposit Vaults', 'Bullion Custody', 'Private Client Salon', '24/7 ATM Rail'],
    },
    {
      id: 'zrh',
      city: 'Zurich',
      country: 'Switzerland',
      name: 'Bahnhofstrasse Private Depository',
      address: 'Bahnhofstrasse 45, 8001 Zürich',
      phone: '+41 44 214 8000',
      email: 'zurich@royalbank.com',
      hours: 'Mon-Fri 08:30 - 17:30',
      manager: 'Dr. Beatrix Von Berg, Head of Swiss Wealth',
      facilities: ['Multi-Currency Cash Vault', 'Lombard Lending Advisory', 'Secure Meeting Suites', 'ATM Rail'],
    },
    {
      id: 'gva',
      city: 'Geneva',
      country: 'Switzerland',
      name: 'Rhône Sovereign Trust Office',
      address: 'Rue du Rhône 32, 1204 Genève',
      phone: '+41 22 819 3300',
      email: 'geneva@royalbank.com',
      hours: 'Mon-Fri 09:00 - 17:00',
      manager: 'Laurent Mercier, Sovereign Client Director',
      facilities: ['Estate Planning Desk', 'Safe Deposit Lockers', 'Gold Bullion Settlement'],
    },
    {
      id: 'nyc',
      city: 'New York',
      country: 'United States',
      name: 'Wall Street Custody & Escrow',
      address: '48 Wall Street, 22nd Floor, New York, NY 10005',
      phone: '+1 212 555 0198',
      email: 'wallstreet@royalbank.com',
      hours: 'Mon-Fri 09:00 - 18:00',
      manager: 'Catherine Vance, Head of Americas Treasury',
      facilities: ['Commercial Escrow Desk', 'Private Boardroom', 'Real-Time Fedwire Desk'],
    },
    {
      id: 'sin',
      city: 'Singapore',
      country: 'Singapore',
      name: 'Marina Bay Financial Tower',
      address: '10 Marina Boulevard, Tower 2, Singapore 018983',
      phone: '+65 6812 9000',
      email: 'singapore@royalbank.com',
      hours: 'Mon-Fri 09:00 - 18:00',
      manager: 'Wei-Han Tan, Managing Director APAC',
      facilities: ['Asia-Pac Treasury Desk', 'Sovereign Family Office Salon', 'FAST Settlement'],
    },
    {
      id: 'tyo',
      city: 'Tokyo',
      country: 'Japan',
      name: 'Marunouchi Financial Advisory',
      address: '1-1 Marunouchi, Chiyoda-ku, Tokyo 100-0005',
      phone: '+81 3 5555 0142',
      email: 'tokyo@royalbank.com',
      hours: 'Mon-Fri 09:00 - 17:00',
      manager: 'Kenji Takahashi, Senior Advisor',
      facilities: ['Cross-Border Yen FX Desk', 'Private Client Advisory'],
    },
  ];

  const filtered = branches.filter(
    (b) =>
      b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <section className="py-16 md:py-20 bg-royal-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-400">
              Global Presence
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              International Private Banking Branches.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Discreet locations situated in key financial capitals. Visit us for private vault access, bullion custody, or confidential portfolio reviews.
            </p>
          </div>
        </div>
      </section>

      {/* Directory Content */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        {/* Search */}
        <div className="max-w-md mb-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search branches by city or country (e.g. Zurich, London, Singapore)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-royal-600"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-royal-600 dark:text-gold-400 uppercase tracking-wider">
                      {b.city} · {b.country}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {b.name}
                    </h3>
                  </div>
                  <MapPin className="w-4 h-4 text-gold-500 shrink-0" />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">{b.address}</p>

                <div className="text-xs space-y-1 text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{b.hours}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{b.phone}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Branch Director
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {b.manager}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {b.facilities.map((fac: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setSelectedBranch(b);
                    setBookingSuccess(false);
                  }}
                  icon={<Calendar className="w-3.5 h-3.5" />}
                >
                  Book Private Appointment
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Appointment Modal */}
      {selectedBranch && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBranch(null)}
          title={`Schedule Consultation - ${selectedBranch.name}`}
        >
          {!bookingSuccess ? (
            <div className="space-y-4 text-xs">
              <p className="text-slate-500">
                You are requesting a dedicated appointment with the private banking team at{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedBranch.city}
                </span>.
              </p>

              <Input
                label="Full Legal Name"
                placeholder="e.g. Lord Alexander Sterling"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />

              <Input
                label="Preferred Consultation Date"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Branch Protocol:</div>
                <div>Please present government photo identification and sovereign client card upon arrival.</div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedBranch(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="gold"
                  className="flex-1"
                  onClick={() => setBookingSuccess(true)}
                >
                  Confirm Reservation
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center font-bold">
                ✓
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Appointment Reserved
              </h4>
              <p className="text-xs text-slate-500">
                A confirmation dossier has been sent for your visit on {appointmentDate} with {selectedBranch.manager}.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBranch(null)}
              >
                Close
              </Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
