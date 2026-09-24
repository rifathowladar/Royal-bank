import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: number;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Desktop & Tablet Progress Bar */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
        {/* Active progress track */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-royal-600 dark:bg-royal-500 transition-all duration-300 -z-0"
          style={{
            width: `${((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isClickable = onStepClick && isCompleted;

          return (
            <div
              key={step.id}
              className={`flex flex-col items-center relative z-10 ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
              onClick={() => isClickable && onStepClick(step.id)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-royal-600 text-white shadow-sm'
                    : isActive
                    ? 'bg-white dark:bg-slate-900 text-royal-600 dark:text-gold-400 border-2 border-royal-600 dark:border-gold-400 ring-4 ring-royal-100 dark:ring-royal-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.id}
              </div>
              <span
                className={`mt-2 text-[11px] font-medium tracking-tight whitespace-nowrap ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-semibold'
                    : isCompleted
                    ? 'text-slate-600 dark:text-slate-400'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Step Indicator */}
      <div className="sm:hidden flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-royal-600 text-white">
            {currentStep}/{steps.length}
          </span>
          <span className="text-xs font-semibold text-slate-900 dark:text-white">
            {steps[currentStep - 1]?.title || 'Step'}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {Math.round((currentStep / steps.length) * 100)}% Completed
        </span>
      </div>
    </div>
  );
};
