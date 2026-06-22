'use client'

import { Receipt } from 'lucide-react'

interface VatToggleProps {
  vatEnabled: boolean
  taxRate: number
  onVatChange: (enabled: boolean) => void
  onRateChange: (rate: number) => void
}

export default function VatToggle({ vatEnabled, taxRate, onVatChange, onRateChange }: VatToggleProps) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-[#8b7ab4] uppercase tracking-[3px]">
        Add VAT
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onVatChange(!vatEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            vatEnabled ? 'bg-[#2d1b4e]' : 'bg-[#8b7ab4]/50'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              vatEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <Receipt size={14} className={vatEnabled ? 'text-[#2d1b4e]' : 'text-[#8b7ab4]'} />
        <span className="text-sm text-[#7a6a9e]">{vatEnabled ? 'On' : 'Off'}</span>
      </div>
      {vatEnabled && (
        <div>
          <label className="block text-xs font-semibold text-[#8b7ab4] uppercase tracking-[3px] mb-2">
            Tax Rate (%)
          </label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => onRateChange(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 bg-white border border-[#8b7ab4]/30 rounded-lg text-[#2d1b4e] text-sm focus:outline-none focus:border-[#2d1b4e]"
            min="0"
            max="100"
            step="0.01"
          />
        </div>
      )}
    </div>
  )
}
