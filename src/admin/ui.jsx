import React, { useEffect } from 'react';
import { X, Loader2, SearchX, Trash2 } from 'lucide-react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-[#B8D8EE] rounded-2xl p-5 ${className}`}>
    {children}
  </div>
);

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
    <div>
      <h1 className="text-2xl font-bold font-display text-[#0A2255]">{title}</h1>
      {subtitle && <p className="text-sm text-[#5A7A9A] mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>
);

export const Btn = ({ children, variant = 'primary', className = '', ...rest }) => {
  const styles = {
    primary: 'bg-gradient-to-r from-[#14357B] to-[#2299D6] hover:from-[#0F2A5E] hover:to-[#1A7DB3] text-white shadow-md',
    secondary: 'border border-[#B8D8EE] text-[#0A2255] hover:bg-[#EDF7FC]',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md',
    ghost: 'text-[#5A7A9A] hover:bg-[#EDF7FC]',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export const Spinner = () => (
  <div className="flex items-center justify-center gap-2 text-[#5A7A9A] py-10">
    <Loader2 className="w-5 h-5 animate-spin" />
    <span className="text-sm">Loading...</span>
  </div>
);

export const EmptyState = ({ message = 'No data found' }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-14 text-[#5A7A9A]">
    <SearchX className="w-10 h-10" />
    <p className="text-sm">{message}</p>
  </div>
);

export const ErrorBanner = ({ message, onRetry }) => (
  <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600">
    <span>{message}</span>
    {onRetry && (
      <button onClick={onRetry} className="font-semibold underline shrink-0">Retry</button>
    )}
  </div>
);

export const Badge = ({ children, color = 'slate' }) => {
  const colors = {
    slate: 'bg-[#EDF7FC] text-[#0A2255]',
    teal: 'bg-[#D6E8F7] text-[#14357B]',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    emerald: 'bg-[#D6E8F7] text-[#0A2255]',
    indigo: 'bg-indigo-100 text-indigo-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

export const statusBadge = (status) => {
  const map = {
    PENDING: ['amber', 'Pending'],
    CONFIRMED: ['teal', 'Confirmed'],
    COMPLETED: ['emerald', 'Completed'],
    CANCELLED: ['rose', 'Cancelled'],
    NO_SHOW: ['rose', 'No Show'],
    ACTIVE: ['emerald', 'Active'],
    INACTIVE: ['slate', 'Inactive'],
    SUSPENDED: ['rose', 'Suspended'],
    PAID: ['emerald', 'Paid'],
    PARTIAL: ['amber', 'Partial'],
    UNPAID: ['rose', 'Unpaid'],
    APPROVED: ['emerald', 'Approved'],
    PENDING_REVIEW: ['amber', 'Pending'],
    PUBLISHED: ['emerald', 'Published'],
    DRAFT: ['slate', 'Draft'],
  };
  const [color, label] = map[status] || ['slate', status];
  return <Badge color={color}>{label}</Badge>;
};

export const Th = ({ children, className = '' }) => (
  <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#5A7A9A] whitespace-nowrap ${className}`}>
    {children}
  </th>
);

export const Td = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-sm text-[#0A2255] ${className}`}>{children}</td>
);

export const TextInput = (props) => (
  <input
    {...props}
    className={`w-full px-3 py-2 rounded-xl text-sm bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6] transition-all ${props.className || ''}`}
  />
);

export const Select = (props) => (
  <select
    {...props}
    className={`w-full px-3 py-2 rounded-xl text-sm bg-white border border-[#B8D8EE] text-[#0A2255] focus:outline-none focus:ring-2 focus:ring-[#2299D6] transition-all ${props.className || ''}`}
  />
);

export const Field = ({ label, children, span = 1 }) => (
  <div className={`col-span-1 ${span === 2 ? 'sm:col-span-2' : ''}`}>
    <label className="block text-xs font-bold uppercase tracking-wider text-[#5A7A9A] mb-1.5">{label}</label>
    {children}
  </div>
);

export const Modal = ({ open, title, onClose, children, wide = false }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`bg-white border border-[#B8D8EE] rounded-2xl shadow-2xl w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#B8D8EE]">
          <h3 className="text-lg font-bold font-display text-[#0A2255]">{title}</h3>
          <button onClick={onClose} className="p-1 text-[#5A7A9A] hover:text-[#0A2255]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDelete = ({ open, title, onClose, onConfirm, busy = false }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white border border-[#B8D8EE] rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600"><Trash2 className="w-5 h-5" /></span>
          <h3 className="text-base font-bold text-[#0A2255]">{title || 'Delete item?'}</h3>
        </div>
        <p className="text-sm text-[#5A7A9A] mb-5">This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? <Spinner /> : 'Delete'}
          </Btn>
        </div>
      </div>
    </div>
  );
};