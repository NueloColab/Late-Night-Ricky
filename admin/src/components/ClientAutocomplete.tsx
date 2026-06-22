'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface Client {
  id: number
  name: string
  email: string | null
  company?: string | null
}

interface ClientAutocompleteProps {
  value: string
  onChange: (val: string) => void
  onSelect?: (client: Client) => void
  placeholder?: string
  className?: string
}

export default function ClientAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Search clients...',
  className = '',
}: ClientAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => {
        setClients(data.clients || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [isOpen])

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(value.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(value.toLowerCase()))
  )

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#b0b0b0]/30">
          <Search className="w-4 h-4 text-[#b0b0b0]" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-14 pr-10 py-2.5 bg-white border border-[#b0b0b0]/30 rounded-lg text-[#7a7a7a] text-sm focus:outline-none focus:border-[#7a7a7a] transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('')
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0b0b0] hover:text-[#7a7a7a]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#b0b0b0]/30 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-[#b0b0b0]">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[#b0b0b0]">
              {value ? 'No matching clients' : 'Type to search clients'}
            </div>
          ) : (
            filtered.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => {
                  onChange(client.name)
                  onSelect?.(client)
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-[#F8FAFB] transition-colors text-sm"
              >
                <div className="font-medium text-[#7a7a7a]">{client.name}</div>
                {client.email && (
                  <div className="text-xs text-[#b0b0b0]">{client.email}</div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
