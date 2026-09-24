import React from 'react';

export interface FormFieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  error?: string;
}

export const SettingsFormField: React.FC<FormFieldProps> = ({
  label,
  description,
  children,
  error,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
      <div className="max-w-md">
        <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
          {label}
        </label>
        {description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        )}
        {error && <p className="text-[11px] text-rose-500 font-medium mt-0.5">{error}</p>}
      </div>
      <div className="sm:w-64 shrink-0 flex justify-start sm:justify-end">{children}</div>
    </div>
  );
};

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-40 disabled:cursor-not-allowed ${
        checked ? 'bg-amber-600 dark:bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export interface NumberInputProps {
  value: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
  max,
  disabled = false,
}) => {
  return (
    <div className="relative flex items-center w-full max-w-[220px]">
      {prefix && (
        <span className="absolute left-2.5 text-slate-400 text-xs font-mono select-none">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full py-1.5 text-xs font-mono tabular-nums rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-royal-500 ${
          prefix ? 'pl-7' : 'pl-2.5'
        } ${suffix ? 'pr-8' : 'pr-2.5'}`}
      />
      {suffix && (
        <span className="absolute right-2.5 text-slate-400 text-xs font-mono select-none">
          {suffix}
        </span>
      )}
    </div>
  );
};
