import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false,
      icon,
      iconPosition = 'left',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isCurrentlyLoading = isLoading || loading;
    const sizeClasses = {
      sm: 'text-xs py-1.5 px-3 rounded-lg gap-1.5 min-h-[34px]',
      md: 'text-sm py-2 px-4 rounded-lg gap-2 min-h-[40px]',
      lg: 'text-base py-2.5 px-5 rounded-xl gap-2.5 min-h-[46px]',
    };

    const variantClasses = {
      primary:
        'bg-royal-900 text-white hover:bg-royal-800 dark:bg-royal-700 dark:hover:bg-royal-600 border border-royal-700/50 shadow-xs focus-visible:outline-royal-600',
      gold: 'bg-gold-500 text-slate-950 font-semibold hover:bg-gold-400 border border-gold-400 shadow-xs focus-visible:outline-gold-500',
      secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 focus-visible:outline-slate-500',
      outline:
        'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 focus-visible:outline-slate-500',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border-none focus-visible:outline-slate-500',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 border border-rose-700 shadow-xs focus-visible:outline-rose-600',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isCurrentlyLoading}
        className={`inline-flex items-center justify-center font-medium whitespace-nowrap shrink-0 transition-colors select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {isCurrentlyLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!isCurrentlyLoading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
        {!isCurrentlyLoading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
