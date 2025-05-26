import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-card border border-neutral-200 overflow-hidden ${className}`}>
      {/* Card header */}
      {(title || subtitle || icon) && (
        <div className={`px-6 py-4 border-b border-neutral-200 ${headerClassName}`}>
          <div className="flex items-center">
            {icon && <div className="mr-3 text-primary-600">{icon}</div>}
            <div>
              {title && <h3 className="text-lg font-medium text-neutral-900">{title}</h3>}
              {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      
      {/* Card body */}
      <div className={`px-6 py-5 ${bodyClassName}`}>
        {children}
      </div>
      
      {/* Card footer */}
      {footer && (
        <div className={`px-6 py-3 bg-neutral-50 border-t border-neutral-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;