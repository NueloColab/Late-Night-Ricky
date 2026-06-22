'use client'

interface NotesFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export default function NotesField({
  value,
  onChange,
  placeholder = 'Add any additional notes, terms, or conditions...',
  rows = 4,
}: NotesFieldProps) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px]">
        Notes & Terms
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-white border border-[#A8D5F0]/30 rounded-lg text-[#152a47] text-sm focus:outline-none focus:border-[#152a47] resize-none"
        rows={rows}
        placeholder={placeholder}
      />
    </div>
  )
}
