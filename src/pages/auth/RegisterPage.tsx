import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useToast } from '../../hooks/index.ts';
import { authService } from '../../backend/services/authService.ts';
import { RegistrationPayload, RegistrationResult } from '../../backend/types/index.ts';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { PasswordInput } from '../../components/ui/PasswordInput.tsx';
import { OTPInput } from '../../components/ui/OTPInput.tsx';
import { Stepper, StepItem } from '../../components/ui/Stepper.tsx';
import { FormField } from '../../components/ui/FormField.tsx';
import { Alert } from '../../components/ui/Alert.tsx';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Lock,
  User,
  CreditCard,
  Building,
  KeyRound,
  FileText,
  Mail,
  Smartphone,
} from 'lucide-react';

const REGISTRATION_STEPS: StepItem[] = [
  { id: 1, title: 'Personal' },
  { id: 2, title: 'Contact' },
  { id: 3, title: 'Identity' },
  { id: 4, title: 'Security' },
  { id: 5, title: 'Verification' },
  { id: 6, title: 'Confirmation' },
];

export const RegisterPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Personal
  const [firstName, setFirstName] = useState('Eleanor');
  const [lastName, setLastName] = useState('Vance');
  const [dob, setDob] = useState('1988-06-14');
  const [nationality, setNationality] = useState('United Kingdom');
  const [taxId, setTaxId] = useState('GB-9021-3948');

  // Step 2: Contact
  const [email, setEmail] = useState('eleanor.vance@example.com');
  const [phone, setPhone] = useState('+44 20 7946 0912');
  const [streetAddress, setStreetAddress] = useState('14 Berkeley Square, Mayfair');
  const [city, setCity] = useState('London');
  const [state, setState] = useState('Greater London');
  const [postalCode, setPostalCode] = useState('W1J 6BQ');
  const [country, setCountry] = useState('United Kingdom');

  // Step 3: Identity
  const [idType, setIdType] = useState<'passport' | 'national_id' | 'driver_license'>('passport');
  const [idNumber, setIdNumber] = useState('981249812');
  const [idExpiryDate, setIdExpiryDate] = useState('2032-11-30');
  const [issueAuthority, setIssueAuthority] = useState('HM Passport Office');

  // Step 4: Security
  const [username, setUsername] = useState('eleanor.vance');
  const [password, setPassword] = useState('RoyalVance2026!');
  const [confirmPassword, setConfirmPassword] = useState('RoyalVance2026!');
  const [pinCode, setPinCode] = useState('9812');
  const [securityQuestion, setSecurityQuestion] = useState('What was your first childhood pet?');
  const [securityAnswer, setSecurityAnswer] = useState('Winston');

  // Step 5: OTP
  const [otpCode, setOtpCode] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);

  // Step 6: Result
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { loginCustomer } = useAuth();
  const { success, info } = useToast();
  const navigate = useNavigate();

  // Step validation
  const validateStep = (step: number): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (!firstName || !lastName || !dob || !nationality || !taxId) {
        setErrorMsg('Please complete all mandatory personal information fields.');
        return false;
      }
    }
    if (step === 2) {
      if (!email || !phone || !streetAddress || !city || !postalCode) {
        setErrorMsg('Please complete all required residential and contact details.');
        return false;
      }
    }
    if (step === 3) {
      if (!idNumber || !idExpiryDate || !issueAuthority) {
        setErrorMsg('Please supply valid government identity documentation details.');
        return false;
      }
    }
    if (step === 4) {
      if (!password || password.length < 8) {
        setErrorMsg('Security password must contain at least 8 characters.');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Security password confirmation does not match.');
        return false;
      }
      if (!pinCode || pinCode.length !== 4) {
        setErrorMsg('Transaction PIN must consist of exactly 4 numeric digits.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 4) {
        // Trigger dispatch of verification OTP
        authService.resendOtp(email);
        info('Verification Dispatched', `A 6-digit authentication token has been dispatched to ${email}.`);
      }
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleVerifyAndSubmit = async (codeToSubmit?: string) => {
    const code = codeToSubmit || otpCode;
    if (code.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const otpValidation = await authService.verifyOtp(code, 'registration');
    if (!otpValidation.success) {
      setLoading(false);
      setErrorMsg(otpValidation.message);
      return;
    }

    // Submit full payload to registration service
    const payload: RegistrationPayload = {
      personal: { firstName, lastName, dateOfBirth: dob, nationality, taxId },
      contact: { email, phone, streetAddress, city, state, postalCode, country },
      identity: { idType, idNumber, idExpiryDate, issueAuthority },
      security: { username, password, pinCode, securityQuestion, securityAnswer },
    };

    const regResult = await authService.registerCustomer(payload);
    setLoading(false);

    if (regResult.success) {
      setResult(regResult);
      setCurrentStep(6);
      success('Account Initialized', 'Private Client account provisioned successfully.');
    } else {
      setErrorMsg(regResult.message || 'Registration failed.');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-10 relative overflow-hidden">
        {/* Gold highlight accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-royal-700 via-gold-400 to-royal-800" />

        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
          <BrandLogo to="/" />
          <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-medium">Demo Simulator</span>
        </div>

        {/* Demo Sandbox Notice */}
        <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-900 dark:text-amber-200">
          <span className="font-semibold">Portfolio Simulation:</span> This registration wizard is an educational UI demonstration. Pre-filled with fictitious data. Do not enter real personal, identity, or financial information.
        </div>

        {/* Stepper Progress */}
        <div className="mb-8">
          <Stepper steps={REGISTRATION_STEPS} currentStep={currentStep} />
        </div>

        {errorMsg && (
          <Alert variant="error" className="mb-6" onDismiss={() => setErrorMsg(null)}>
            {errorMsg}
          </Alert>
        )}

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Personal Information
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official legal names as recorded on government identification documents.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Legal First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Legal Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
              <Input
                label="Citizenship / Nationality"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                required
              />
            </div>

            <Input
              label="National Tax ID / SSN"
              placeholder="e.g. GB-9021-3948 or SSN"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              helperText="Encrypted under ISO 27001 regulatory compliance."
              required
            />
          </div>
        )}

        {/* Step 2: Contact Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Contact & Domicile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Where should official correspondence and private debit cards be delivered?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Mobile Phone (SMS Enabled)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <Input
              label="Street Address Line 1"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
              <Input label="State/Region" value={state} onChange={(e) => setState(e.target.value)} />
              <Input label="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
              <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} required />
            </div>
          </div>
        )}

        {/* Step 3: Identity Information */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Identity Documentation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Statutory verification required under international anti-money laundering frameworks.
              </p>
            </div>

            <FormField label="Government Document Type" required>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'passport', label: 'Passport' },
                  { id: 'national_id', label: 'National ID' },
                  { id: 'driver_license', label: "Driver's License" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setIdType(type.id as any)}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                      idType === type.id
                        ? 'bg-royal-50 dark:bg-royal-950/60 border-royal-600 dark:border-gold-400 text-royal-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Document Identification Number"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
              />
              <Input
                label="Expiration Date"
                type="date"
                value={idExpiryDate}
                onChange={(e) => setIdExpiryDate(e.target.value)}
                required
              />
            </div>

            <Input
              label="Issuing Authority / Jurisdiction"
              value={issueAuthority}
              onChange={(e) => setIssueAuthority(e.target.value)}
              helperText="E.g. Department of State, HM Passport Office, or National Police Agency"
              required
            />
          </div>
        )}

        {/* Step 4: Security Setup */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Account Security Setup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Establish high-assurance credentials and transaction authorization PINs.
              </p>
            </div>

            <Input
              label="Username / Client Handle"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PasswordInput
                label="Create Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showStrengthMeter
                required
              />
              <PasswordInput
                label="Confirm Master Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <Input
                label="4-Digit Wire / ATM PIN"
                type="password"
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                helperText="Required for instant wire authorizations and card ATM access."
                required
              />
              <Input
                label="Security Question"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                required
              />
            </div>

            <Input
              label="Security Answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              required
            />
          </div>
        )}

        {/* Step 5: OTP Verification */}
        {currentStep === 5 && (
          <div className="space-y-6 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-royal-50 dark:bg-royal-950/60 border border-royal-200 dark:border-royal-800 text-royal-600 dark:text-gold-400 mx-auto flex items-center justify-center">
              <Smartphone className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Verify Your Identity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                We dispatched an authentication code to{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>. Please enter the 6 digits below.
              </p>
            </div>

            <div className="py-2">
              <OTPInput
                value={otpCode}
                onChange={setOtpCode}
                onComplete={(code) => handleVerifyAndSubmit(code)}
                disabled={loading}
              />
            </div>

            <div className="text-xs text-slate-500">
              <span>Demo OTP: </span>
              <button
                type="button"
                onClick={() => setOtpCode('123456')}
                className="font-mono font-bold text-royal-600 dark:text-gold-400 underline"
              >
                123456 (Click to autofill)
              </button>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <span>Did not receive code?</span>
              <button
                type="button"
                onClick={() => {
                  authService.resendOtp(email);
                  info('Code Dispatched', 'A new one-time password has been sent.');
                }}
                className="text-royal-600 dark:text-royal-400 font-semibold hover:underline"
              >
                Resend Code
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Confirmation & Success */}
        {currentStep === 6 && result && (
          <div className="space-y-6 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Welcome to Royal Bank
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your Private Client account has been provisioned and funded with an initial complimentary reserve.
              </p>
            </div>

            {/* Account Credentials Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500">Customer Identifier</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {result.customerNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.customerNumber, 'cust')}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Copy"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500">Primary Account Number</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {result.accountNumber}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500">International IBAN</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {result.iban}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Opening Balance Available</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  $10,000.00 USD
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="gold"
              className="w-full py-3"
              onClick={async () => {
                await loginCustomer(email);
                navigate('/bank/dashboard');
              }}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Access Private Client Vault
            </Button>
          </div>
        )}

        {/* Step Navigation Actions */}
        {currentStep < 5 && (
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous Step
              </Button>
            ) : (
              <Link
                to="/bank/login"
                className="text-xs text-slate-500 hover:text-royal-600 transition-colors"
              >
                Already have an account? Sign in
              </Link>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNext}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Continue to Step {currentStep + 1}
            </Button>
          </div>
        )}

        {currentStep === 5 && (
          <div className="mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(4)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Modify Details
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={loading}
              disabled={otpCode.length !== 6}
              onClick={() => handleVerifyAndSubmit()}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Finalize Registration
            </Button>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
          <span>Portfolio Concept · Educational Simulation Sandbox</span>
        </div>
      </div>
    </div>
  );
};
