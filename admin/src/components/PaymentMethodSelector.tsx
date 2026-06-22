'use client'

import { CreditCard } from 'lucide-react'

interface PaymentMethodSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const OPTIONS = [
  { value: 'bank-transfer', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
]

export default function PaymentMethodSelector({ value, onChange, className = '' }: PaymentMethodSelectorProps) {
  const label = OPTIONS.find((o) => o.value === value)?.label || value

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-xs font-semibold text-[#b0b0b0] uppercase tracking-[3px]">
        Payment Method
      </label>
      <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
        <CreditCard size={14} className="text-[#7a7a7a]" />
        <span>{label}</span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-white border border-[#b0b0b0]/30 rounded-lg text-[#7a7a7a] text-sm focus:outline-none focus:border-[#7a7a7a] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
