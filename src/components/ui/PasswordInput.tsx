import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input, InputProps } from './Input.tsx';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showStrengthMeter?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrengthMeter = false, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const pwdString = typeof value === 'string' ? value : '';

    // Calculate basic strength (0 to 4)
    const calculateStrength = (pwd: string): number => {
      let score = 0;
      if (pwd.length >= 8) score++;
      if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[^A-Za-z0-9]/.test(pwd)) score++;
      return score;
    };

    const strength = calculateStrength(pwdString);
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Institutional-Grade'];
    const strengthColors = [
      'bg-rose-500',
      'bg-amber-500',
      'bg-blue-500',
      'bg-emerald-500',
    ];

    return (
      <div className="w-full flex flex-col gap-1.5">
        <Input
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {showStrengthMeter && pwdString.length > 0 && (
          <div className="mt-1 space-y-1">
            <div className="flex items-center gap-1.5 h-1.5 w-full">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`h-full flex-1 rounded-full transition-colors ${
                    index < strength
                      ? strengthColors[strength - 1] || 'bg-slate-300'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
              <span>Password Complexity</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {pwdString.length > 0 ? strengthLabels[Math.max(0, strength - 1)] : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
