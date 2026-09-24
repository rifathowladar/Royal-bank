import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../../../hooks/index.ts';
import { profileService } from '../../../backend/services/profileService.ts';
import { FullCustomerProfile, NomineeDetails, EmploymentDetails } from '../../../backend/types/index.ts';
import { Card } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { LoadingState } from '../../../components/ui/LoadingState.tsx';
import { formatCurrency } from '../../../utils/formatters.ts';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Users,
  ShieldCheck,
  Camera,
  Calendar,
  Globe,
  DollarSign,
  Building,
  Save,
  Edit3,
  CheckCircle2,
  Award,
  FileText,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<FullCustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Tab routing detection: /bank/profile, /bank/profile/personal, /bank/profile/contact, /bank/profile/nominee, /bank/profile/employment
  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes('/personal')) return 'personal';
    if (path.includes('/contact')) return 'contact';
    if (path.includes('/nominee')) return 'nominee';
    if (path.includes('/employment')) return 'employment';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'contact' | 'nominee' | 'employment'>(getInitialTab());

  // Edit states for sections
  const [personalForm, setPersonalForm] = useState<Partial<FullCustomerProfile>>({});
  const [contactForm, setContactForm] = useState<{
    phone: string;
    email: string;
    alternatePhone: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    residentialAddress: FullCustomerProfile['residentialAddress'];
    permanentAddress: FullCustomerProfile['permanentAddress'];
    sameAsResidential: boolean;
  }>({
    phone: '',
    email: '',
    alternatePhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    residentialAddress: { line1: '', city: '', state: '', postalCode: '', country: '' },
    permanentAddress: { line1: '', city: '', state: '', postalCode: '', country: '' },
    sameAsResidential: true,
  });
  const [nomineeForm, setNomineeForm] = useState<NomineeDetails>({
    fullName: '',
    relationship: 'Spouse',
    dateOfBirth: '',
    phone: '',
    email: '',
    identityType: 'Passport',
    identityNumberMasked: '',
    sharePercentage: 100,
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [employmentForm, setEmploymentForm] = useState<EmploymentDetails>({
    employmentStatus: 'Employed',
    occupation: '',
    designation: '',
    companyName: '',
    companyAddress: '',
    industry: '',
    monthlyIncome: 0,
    annualIncome: 0,
    sourceOfFunds: '',
    tinOrTaxId: '',
    experienceYears: 0,
  });

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile(user?.id || 'cust-001');
      setProfile(data);
      setPersonalForm({
        title: data.title,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        nationality: data.nationality,
        maritalStatus: data.maritalStatus,
        fathersName: data.fathersName,
        mothersName: data.mothersName,
        taxResidency: data.taxResidency,
      });
      setContactForm({
        phone: data.phone,
        email: data.email,
        alternatePhone: data.alternatePhone || '',
        emergencyContactName: data.emergencyContactName || '',
        emergencyContactPhone: data.emergencyContactPhone || '',
        residentialAddress: { ...data.residentialAddress },
        permanentAddress: data.permanentAddress ? { ...data.permanentAddress } : { ...data.residentialAddress },
        sameAsResidential: data.sameAsResidential,
      });
      setNomineeForm({ ...data.nominee });
      setEmploymentForm({ ...data.employment });
    } catch (err: any) {
      toastError(err.message || 'Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    const tab = getInitialTab();
    setActiveTab(tab);
  }, [location.pathname]);

  const handleTabChange = (tab: 'overview' | 'personal' | 'contact' | 'nominee' | 'employment') => {
    setActiveTab(tab);
    if (tab === 'overview') navigate('/bank/profile');
    else navigate(`/bank/profile/${tab}`);
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await profileService.updatePersonalDetails(user?.id || 'cust-001', personalForm);
      setProfile(updated);
      success('Personal details successfully updated!');
    } catch (err: any) {
      toastError(err.message || 'Failed to update personal details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await profileService.updateContactDetails(user?.id || 'cust-001', contactForm);
      setProfile(updated);
      success('Contact and address information updated!');
    } catch (err: any) {
      toastError(err.message || 'Failed to update contact details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNominee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await profileService.updateNomineeDetails(user?.id || 'cust-001', nomineeForm);
      setProfile(updated);
      success('Nominee beneficiary record updated!');
    } catch (err: any) {
      toastError(err.message || 'Failed to update nominee information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEmployment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await profileService.updateEmploymentDetails(user?.id || 'cust-001', employmentForm);
      setProfile(updated);
      success('Employment and income profile updated!');
    } catch (err: any) {
      toastError(err.message || 'Failed to update employment details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!newAvatarUrl.trim()) return;
    try {
      setIsSaving(true);
      const updated = await profileService.updateAvatar(user?.id || 'cust-001', newAvatarUrl.trim());
      setProfile(updated);
      setAvatarModalOpen(false);
      setNewAvatarUrl('');
      success('Profile photo updated successfully!');
    } catch (err: any) {
      toastError(err.message || 'Failed to update photo');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading sovereign customer profile..." />;
  }

  if (!profile) {
    return null;
  }

  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-royal-950 via-royal-900 to-navy-950 p-6 md:p-8 text-white shadow-xl border border-gold-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group cursor-pointer" onClick={() => setAvatarModalOpen(true)}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold-400/80 shadow-lg bg-royal-800 flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.firstName}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <User className="w-12 h-12 text-gold-300" />
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-6 h-6 text-gold-300" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-gold-500 text-royal-950 p-1.5 rounded-full shadow border-2 border-royal-900">
                <Edit3 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/20 text-gold-300 border border-gold-500/30">
                  {profile.tier}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> KYC Verified
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-gold-100">
                {profile.title} {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-royal-200 text-sm mt-1 flex flex-wrap items-center gap-4">
                <span>Customer ID: <strong className="font-mono text-white">{profile.customerNumber}</strong></span>
                <span>•</span>
                <span>Member Since: <strong className="text-white">{profile.memberSince}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-gold-500/40 text-gold-300 hover:bg-gold-500/10"
              onClick={() => navigate('/bank/kyc')}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" /> KYC Dossier
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-gold-500 text-royal-950 hover:bg-gold-400 font-semibold"
              onClick={() => navigate('/bank/security')}
            >
              <Lock className="w-4 h-4 mr-1.5" /> Security Hub
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'personal', label: 'Personal Information', icon: User },
            { id: 'contact', label: 'Contact & Addresses', icon: Phone },
            { id: 'nominee', label: 'Nominee / Beneficiary', icon: Users },
            { id: 'employment', label: 'Employment & Income', icon: Briefcase },
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

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Summary Cards */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                  Core Identity Summary
                </h2>
                <button
                  onClick={() => handleTabChange('personal')}
                  className="text-xs font-semibold text-royal-600 dark:text-gold-400 hover:underline flex items-center gap-1"
                >
                  Edit Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-royal-900/60 border border-gray-100 dark:border-royal-900">
                  <span className="text-gray-500 dark:text-gray-400 text-xs block">Full Legal Name</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{profile.title} {profile.firstName} {profile.lastName}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-royal-900/60 border border-gray-100 dark:border-royal-900">
                  <span className="text-gray-500 dark:text-gray-400 text-xs block">Date of Birth</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{profile.dateOfBirth} ({profile.gender})</span>
                </div>
                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-royal-900/60 border border-gray-100 dark:border-royal-900">
                  <span className="text-gray-500 dark:text-gray-400 text-xs block">Nationality & Residency</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{profile.nationality} • {profile.taxResidency}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-royal-900/60 border border-gray-100 dark:border-royal-900">
                  <span className="text-gray-500 dark:text-gray-400 text-xs block">National ID / Passport</span>
                  <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{profile.nationalIdMasked}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                  Primary Residence & Contact
                </h2>
                <button
                  onClick={() => handleTabChange('contact')}
                  className="text-xs font-semibold text-royal-600 dark:text-gold-400 hover:underline flex items-center gap-1"
                >
                  Update Contact <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-royal-900/60 border border-gray-100 dark:border-royal-900">
                  <span className="text-gray-500 dark:text-gray-400 text-xs block">Primary Phone</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{profile.phone}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-royal-900/60 border border-gray-100 dark:border-royal-900">
                  <span className="text-gray-500 dark:text-gray-400 text-xs block">Official Email</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{profile.email}</span>
                </div>
                <div className="sm:col-span-2 p-3.5 rounded-lg bg-gray-50 dark:bg-royal-900/60 border border-gray-100 dark:border-royal-900">
                  <span className="text-gray-500 dark:text-gray-400 text-xs block">Residential Address</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {profile.residentialAddress.line1}, {profile.residentialAddress.line2 ? `${profile.residentialAddress.line2}, ` : ''}
                    {profile.residentialAddress.city}, {profile.residentialAddress.state} {profile.residentialAddress.postalCode}, {profile.residentialAddress.country}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-royal-600 dark:text-gold-400" />
                  Professional Profile & Occupation
                </h2>
                <button
                  onClick={() => handleTabChange('employment')}
                  className="text-xs font-semibold text-royal-600 dark:text-gold-400 hover:underline flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-royal-900/60 border border-gray-100 dark:border-royal-900">
                  <span className="text-gray-500 dark:text-gray-400 text-xs block">Designation & Company</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{profile.employment.designation} at {profile.employment.companyName}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-royal-900/60 border border-gray-100 dark:border-royal-900">
                  <span className="text-gray-500 dark:text-gray-400 text-xs block">Annual Declared Income</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(profile.employment.annualIncome)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Nominee & Quick Status */}
          <div className="space-y-6">
            <Card className="p-6 border-gold-500/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-royal-700 dark:text-gold-400 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Nominee Beneficiary
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gold-100 text-royal-900 dark:bg-gold-500/20 dark:text-gold-300">
                  {profile.nominee.sharePercentage}% Share
                </span>
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-white">{profile.nominee.fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Relationship: <strong>{profile.nominee.relationship}</strong></p>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-royal-900 text-xs space-y-2 text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Contact:</span>
                  <span className="font-mono">{profile.nominee.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Identity Ref:</span>
                  <span className="font-mono">{profile.nominee.identityNumberMasked}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 text-xs"
                onClick={() => handleTabChange('nominee')}
              >
                Manage Nominee
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-royal-900 to-navy-950 text-white border-0">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-6 h-6 text-gold-400" />
                <div>
                  <h4 className="font-bold text-gold-100 text-sm">Royal Sovereign Privileges</h4>
                  <p className="text-xs text-royal-200">Account status active & in good standing</p>
                </div>
              </div>
              <ul className="text-xs text-royal-200 space-y-2 mt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>24/7 Dedicated Senior Private Banker</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Zero Forex Markup on Global Centurion Cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Priority Wire Clearance via Fedwire & SWIFT GPI</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Personal Information */}
      {activeTab === 'personal' && (
        <Card className="p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-royal-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              Personal & Legal Information
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Official legal records registered with Royal Bank compliance authority.
            </p>
          </div>

          <form onSubmit={handleSavePersonal} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Salutation / Title
                </label>
                <select
                  value={personalForm.title || ''}
                  onChange={(e) => setPersonalForm({ ...personalForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 dark:bg-slate-900/60 text-gray-900 dark:text-white"
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Lady">Lady</option>
                  <option value="Lord">Lord</option>
                  <option value="Sir">Sir</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  First Name
                </label>
                <Input
                  value={personalForm.firstName || ''}
                  onChange={(e) => setPersonalForm({ ...personalForm, firstName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Last Name
                </label>
                <Input
                  value={personalForm.lastName || ''}
                  onChange={(e) => setPersonalForm({ ...personalForm, lastName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  value={personalForm.dateOfBirth || ''}
                  onChange={(e) => setPersonalForm({ ...personalForm, dateOfBirth: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Gender
                </label>
                <select
                  value={personalForm.gender || 'Male'}
                  onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Marital Status
                </label>
                <select
                  value={personalForm.maritalStatus || 'Married'}
                  onChange={(e) => setPersonalForm({ ...personalForm, maritalStatus: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nationality
                </label>
                <Input
                  value={personalForm.nationality || ''}
                  onChange={(e) => setPersonalForm({ ...personalForm, nationality: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Tax Residency Jurisdiction
                </label>
                <Input
                  value={personalForm.taxResidency || ''}
                  onChange={(e) => setPersonalForm({ ...personalForm, taxResidency: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Customer ID (Read-only)
                </label>
                <Input value={profile.customerNumber} disabled className="bg-gray-100 dark:bg-navy-800 font-mono" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Father's Full Name (Optional)
                </label>
                <Input
                  value={personalForm.fathersName || ''}
                  onChange={(e) => setPersonalForm({ ...personalForm, fathersName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Mother's Full Name (Optional)
                </label>
                <Input
                  value={personalForm.mothersName || ''}
                  onChange={(e) => setPersonalForm({ ...personalForm, mothersName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  National ID / Social Security (Masked)
                </label>
                <Input value={profile.nationalIdMasked} disabled className="bg-gray-100 dark:bg-navy-800 font-mono" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-royal-900">
              <Button type="submit" variant="primary" disabled={isSaving}>
                <Save className="w-4 h-4 mr-1.5" />
                {isSaving ? 'Saving...' : 'Save Personal Details'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab: Contact & Addresses */}
      {activeTab === 'contact' && (
        <Card className="p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-royal-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              Contact Numbers & Addresses
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Used for 2FA one-time passwords, courier card delivery, and formal account notices.
            </p>
          </div>

          <form onSubmit={handleSaveContact} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Primary Mobile Phone
                </label>
                <Input
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Primary Email Address
                </label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Secondary Phone (Optional)
                </label>
                <Input
                  value={contactForm.alternatePhone}
                  onChange={(e) => setContactForm({ ...contactForm, alternatePhone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Emergency Contact Name & Phone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Name"
                    value={contactForm.emergencyContactName}
                    onChange={(e) => setContactForm({ ...contactForm, emergencyContactName: e.target.value })}
                  />
                  <Input
                    placeholder="Phone"
                    value={contactForm.emergencyContactPhone}
                    onChange={(e) => setContactForm({ ...contactForm, emergencyContactPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-royal-900">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-royal-600 dark:text-gold-400" />
                Residential Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Street Address (Line 1)
                  </label>
                  <Input
                    value={contactForm.residentialAddress.line1}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        residentialAddress: { ...contactForm.residentialAddress, line1: e.target.value },
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    City
                  </label>
                  <Input
                    value={contactForm.residentialAddress.city}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        residentialAddress: { ...contactForm.residentialAddress, city: e.target.value },
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    State / Province / Region
                  </label>
                  <Input
                    value={contactForm.residentialAddress.state}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        residentialAddress: { ...contactForm.residentialAddress, state: e.target.value },
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Postal / ZIP Code
                  </label>
                  <Input
                    value={contactForm.residentialAddress.postalCode}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        residentialAddress: { ...contactForm.residentialAddress, postalCode: e.target.value },
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Country
                  </label>
                  <Input
                    value={contactForm.residentialAddress.country}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        residentialAddress: { ...contactForm.residentialAddress, country: e.target.value },
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-royal-900">
              <Button type="submit" variant="primary" disabled={isSaving}>
                <Save className="w-4 h-4 mr-1.5" />
                {isSaving ? 'Saving...' : 'Save Contact Information'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab: Nominee / Beneficiary */}
      {activeTab === 'nominee' && (
        <Card className="p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-royal-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              Account Nominee & Beneficiary Nomination
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Designate statutory successor for deposit claims, accounts, and investment trusts in accordance with banking law.
            </p>
          </div>

          <form onSubmit={handleSaveNominee} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nominee Full Legal Name
                </label>
                <Input
                  value={nomineeForm.fullName}
                  onChange={(e) => setNomineeForm({ ...nomineeForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Relationship with Account Holder
                </label>
                <select
                  value={nomineeForm.relationship}
                  onChange={(e) => setNomineeForm({ ...nomineeForm, relationship: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Business Partner">Business Partner</option>
                  <option value="Other">Other Legal Beneficiary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nominee Date of Birth
                </label>
                <Input
                  type="date"
                  value={nomineeForm.dateOfBirth}
                  onChange={(e) => setNomineeForm({ ...nomineeForm, dateOfBirth: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Share Percentage (%)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={nomineeForm.sharePercentage}
                  onChange={(e) => setNomineeForm({ ...nomineeForm, sharePercentage: parseInt(e.target.value) || 100 })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nominee Phone Number
                </label>
                <Input
                  value={nomineeForm.phone}
                  onChange={(e) => setNomineeForm({ ...nomineeForm, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nominee Email Address (Optional)
                </label>
                <Input
                  type="email"
                  value={nomineeForm.email || ''}
                  onChange={(e) => setNomineeForm({ ...nomineeForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Identity Document Type
                </label>
                <select
                  value={nomineeForm.identityType}
                  onChange={(e) => setNomineeForm({ ...nomineeForm, identityType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="Passport">Passport</option>
                  <option value="NID">National ID</option>
                  <option value="Birth Certificate">Birth Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Identity Document Number (Masked)
                </label>
                <Input
                  value={nomineeForm.identityNumberMasked}
                  onChange={(e) => setNomineeForm({ ...nomineeForm, identityNumberMasked: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nominee Address
                </label>
                <Input
                  value={nomineeForm.streetAddress}
                  onChange={(e) => setNomineeForm({ ...nomineeForm, streetAddress: e.target.value })}
                  placeholder="Street, City, Postal code, Country"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-royal-900">
              <Button type="submit" variant="primary" disabled={isSaving}>
                <Save className="w-4 h-4 mr-1.5" />
                {isSaving ? 'Saving...' : 'Save Nominee Beneficiary'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab: Employment & Income */}
      {activeTab === 'employment' && (
        <Card className="p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-royal-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-royal-600 dark:text-gold-400" />
              Employment, Source of Funds & Tax Information
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Required for credit underwriting, international transfer clearance, and FATCA/CRS tax reporting.
            </p>
          </div>

          <form onSubmit={handleSaveEmployment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Employment Status
                </label>
                <select
                  value={employmentForm.employmentStatus}
                  onChange={(e) => setEmploymentForm({ ...employmentForm, employmentStatus: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                >
                  <option value="Employed">Salaried Executive / Employee</option>
                  <option value="Self-Employed">Self-Employed Professional</option>
                  <option value="Business Owner">Business Owner / Partner</option>
                  <option value="Investor">Private Wealth Investor</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Occupation / Professional Field
                </label>
                <Input
                  value={employmentForm.occupation}
                  onChange={(e) => setEmploymentForm({ ...employmentForm, occupation: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Company / Organization Name
                </label>
                <Input
                  value={employmentForm.companyName}
                  onChange={(e) => setEmploymentForm({ ...employmentForm, companyName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Designation / Corporate Title
                </label>
                <Input
                  value={employmentForm.designation}
                  onChange={(e) => setEmploymentForm({ ...employmentForm, designation: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Industry / Sector
                </label>
                <Input
                  value={employmentForm.industry}
                  onChange={(e) => setEmploymentForm({ ...employmentForm, industry: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Years of Experience
                </label>
                <Input
                  type="number"
                  min={0}
                  value={employmentForm.experienceYears}
                  onChange={(e) => setEmploymentForm({ ...employmentForm, experienceYears: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Monthly Gross Income ($ USD)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={employmentForm.monthlyIncome}
                  onChange={(e) => setEmploymentForm({ ...employmentForm, monthlyIncome: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Annual Estimated Income ($ USD)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={employmentForm.annualIncome}
                  onChange={(e) => setEmploymentForm({ ...employmentForm, annualIncome: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Tax Identification Number (TIN / SSN)
                </label>
                <Input
                  value={employmentForm.tinOrTaxId}
                  onChange={(e) => setEmploymentForm({ ...employmentForm, tinOrTaxId: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Source of Inbound Funds
                </label>
                <Input
                  value={employmentForm.sourceOfFunds}
                  onChange={(e) => setEmploymentForm({ ...employmentForm, sourceOfFunds: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Employer / Corporate Office Address
                </label>
                <Input
                  value={employmentForm.companyAddress}
                  onChange={(e) => setEmploymentForm({ ...employmentForm, companyAddress: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-royal-900">
              <Button type="submit" variant="primary" disabled={isSaving}>
                <Save className="w-4 h-4 mr-1.5" />
                {isSaving ? 'Saving...' : 'Save Employment Profile'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Avatar Change Modal */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-navy-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Select Avatar Photo</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Choose from sample verified executive portraits or paste a custom image URL.
            </p>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {avatarOptions.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNewAvatarUrl(url)}
                  className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ${
                    newAvatarUrl === url ? 'border-gold-500 ring-2 ring-gold-400' : 'border-gray-200 dark:border-navy-700'
                  }`}
                >
                  <img src={url} alt="Option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Custom Image URL
              </label>
              <Input
                placeholder="https://..."
                value={newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setAvatarModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!newAvatarUrl.trim() || isSaving}
                onClick={handleUpdateAvatar}
              >
                {isSaving ? 'Updating...' : 'Set Profile Photo'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
