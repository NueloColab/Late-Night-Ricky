'use client'

import { Plus, Trash2 } from 'lucide-react'
import { PaymentScheduleItem } from '@/lib/payment-terms'

interface PaymentScheduleProps {
  schedule: PaymentScheduleItem[]
  termsType: string
  total: number
  onChange: (schedule: PaymentScheduleItem[]) => void
}

export default function PaymentSchedule({ schedule, termsType, total, onChange }: PaymentScheduleProps) {
  const isCustom = termsType === 'custom'

  const handleItemChange = (index: number, field: keyof PaymentScheduleItem, value: string | number) => {
    const newSchedule = [...schedule]
    newSchedule[index] = { ...newSchedule[index], [field]: value }
    if (field === 'percent') {
      newSchedule[index].amount = +((total * (Number(value) || 0)) / 100).toFixed(2)
    }
    onChange(newSchedule)
  }

  const addItem = () => {
    onChange([...schedule, { label: '', percent: 0, due: '', amount: 0, status: 'pending' }])
  }

  const removeItem = (index: number) => {
    onChange(schedule.filter((_, i) => i !== index))
  }

  const totalPercent = schedule.reduce((sum, item) => sum + (item.percent || 0), 0)
  const totalAmount = schedule.reduce((sum, item) => sum + (item.amount || 0), 0)

  if (schedule.length === 0 && !isCustom) {
    return (
      <div className="mt-4 p-6 bg-[#F8FAFB] rounded-lg border border-[#b0b0b0]/20 text-center">
        <p className="text-sm text-[#b0b0b0]">No payment schedule for this term</p>
      </div>
    )
  }

  if (schedule.length === 0 && isCustom) {
    return (
      <div className="mt-4 p-6 bg-[#F8FAFB] rounded-lg border border-[#b0b0b0]/20 text-center">
        <p className="text-sm text-[#b0b0b0] mb-3">No installments added yet</p>
        <button
          type="button"
          onClick={addItem}
          className="text-sm text-[#7a7a7a] hover:text-[#a0a0a0] flex items-center gap-1 mx-auto transition-colors font-semibold"
        >
          <Plus size={14} /> Add First Installment
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-[#b0b0b0] uppercase tracking-[3px]">Payment Schedule</p>
        {isCustom && (
          <button
            type="button"
            onClick={addItem}
            className="text-xs text-[#7a7a7a] hover:text-[#a0a0a0] flex items-center gap-1 transition-colors font-semibold"
          >
            <Plus size={12} /> Add Installment
          </button>
        )}
      </div>

      <div className="border border-[#b0b0b0]/30 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-wide text-[#b0b0b0] border-b border-[#b0b0b0]/30">
          <div className="col-span-3">Label</div>
          <div className="col-span-2">Percent</div>
          <div className="col-span-4">Due</div>
          <div className="col-span-2 text-right">Amount</div>
          {isCustom && <div className="col-span-1"></div>}
        </div>

        {/* Rows */}
        {schedule.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-[#8a8a8a] last:border-b-0"
          >
            {isCustom ? (
              <>
                <div className="col-span-3">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleItemChange(idx, 'label', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#b0b0b0]/30 rounded text-sm focus:outline-none focus:border-[#7a7a7a]"
                    placeholder="e.g., Deposit"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={item.percent}
                      onChange={(e) => handleItemChange(idx, 'percent', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#b0b0b0]/30 rounded text-sm focus:outline-none focus:border-[#7a7a7a]"
                      min="0"
                      max="100"
                    />
                    <span className="text-[#b0b0b0] text-sm">%</span>
                  </div>
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    value={item.due}
                    onChange={(e) => handleItemChange(idx, 'due', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#b0b0b0]/30 rounded text-sm focus:outline-none focus:border-[#7a7a7a]"
                    placeholder="e.g., Due on completion"
                  />
                </div>
                <div className="col-span-2 text-right font-semibold text-sm text-[#7a7a7a]">
                  £{item.amount.toFixed(2)}
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1.5 text-[#b0b0b0] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-3 text-sm font-medium text-[#7a7a7a]">{item.label}</div>
                <div className="col-span-2 text-sm text-[#a0a0a0]">{item.percent}%</div>
                <div className="col-span-4 text-sm text-[#a0a0a0]">{item.due}</div>
                <div className="col-span-2 text-right font-semibold text-sm text-[#7a7a7a]">
                  £{item.amount.toFixed(2)}
                </div>
              </>
            )}
          </div>
        ))}

        {/* Total row */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#F8FAFB] border-t border-[#b0b0b0]/30">
          <div className="col-span-3 text-xs font-semibold text-[#7a7a7a] uppercase">Total</div>
          <div className="col-span-2 text-sm font-semibold text-[#7a7a7a]">{totalPercent}%</div>
          <div className="col-span-4"></div>
          <div className="col-span-2 text-right font-bold text-sm text-[#7a7a7a]">
            £{totalAmount.toFixed(2)}
          </div>
          {isCustom && <div className="col-span-1"></div>}
        </div>
      </div>

      {totalPercent !== 100 && schedule.length > 0 && (
        <p className="text-xs text-amber-600 mt-2">
          ⚠ Payment schedule percentages total {totalPercent}% (should be 100%)
        </p>
      )}
    </div>
  )
}
