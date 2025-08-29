
import React from 'react';
import { ChevronDownIcon } from '../../assets/icons';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ options, label, placeholder, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-neutral-300 mb-1">{label}</label>}
      <div className="relative">
        <select
          className={`w-full bg-neutral-700 border border-neutral-600 text-neutral-100 placeholder-neutral-400 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 appearance-none ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
          <ChevronDownIcon className="w-5 h-5"/>
        </div>
      </div>
    </div>
  );
};
