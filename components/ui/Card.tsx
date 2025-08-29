
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, icon }) => {
  return (
    <div className={`bg-neutral-800 shadow-lg rounded-xl p-6 ${className}`}>
      {title && (
        <div className="flex items-center mb-4">
          {icon && <span className="mr-3 text-primary-400">{icon}</span>}
          <h3 className="text-xl font-semibold text-neutral-100">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`mb-4 pb-4 border-b border-neutral-700 ${className}`}>{children}</div>;
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`${className}`}>{children}</div>;
};

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`mt-4 pt-4 border-t border-neutral-700 ${className}`}>{children}</div>;
};
