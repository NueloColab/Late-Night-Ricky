'use client'

import { Heart } from 'lucide-react'

interface Discount {
  enabled: boolean
  type: string
  percent: number
  amount: number
}

interface DiscountToggleProps {
  discount: Discount
  onChange: (discount: Discount) => void
}

export default function DiscountToggle({ discount, onChange }: DiscountToggleProps) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">
        Friends & Family Discount
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange({ ...discount, enabled: !discount.enabled })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            discount.enabled ? 'bg-[#1B3A4C]' : 'bg-[#A3B5C4]/50'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              discount.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <Heart size={14} className={discount.enabled ? 'text-[#1B3A4C]' : 'text-[#A3B5C4]'} />
        <span className="text-sm text-[#5B7A8E]">{discount.enabled ? 'On' : 'Off'}</span>
      </div>
      {discount.enabled && (
        <div>
          <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">
            Discount (%)
          </label>
          <input
            type="number"
            value={discount.percent}
            onChange={(e) =>
              onChange({ ...discount, percent: parseFloat(e.target.value) || 0 })
            }
            className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
            min="0"
            max="100"
            step="0.5"
          />
        </div>
      )}
    </div>
  )
}
