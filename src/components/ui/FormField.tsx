import React from 'react';

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  error,
  helperText,
  children,
  className = '',
}) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 text-left ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
        </label>
      )}
      {children}
      {error && <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</span>}
      {!error && helperText && (
        <span className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{helperText}</span>
      )}
    </div>
  );
};
