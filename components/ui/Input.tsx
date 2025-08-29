
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={props.id || props.name} className="block text-sm font-medium text-neutral-300 mb-1">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
        <input
          className={`w-full bg-neutral-700 border border-neutral-600 text-neutral-100 placeholder-neutral-400 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};
