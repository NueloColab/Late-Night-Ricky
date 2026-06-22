'use client'

import { LNR_SERVICE_CATEGORIES, getServicesByCategory } from '@/lib/services'

interface Service {
  serviceName?: string
  serviceCategory?: string
  price?: number
  quantity?: number
  _custom?: boolean
}

interface ServiceSelectorProps {
  service: Service
  onChange: (field: string, value: unknown) => void
  onBatchChange?: (updates: Partial<Service>) => void
  inputClassName?: string
  showQuantity?: boolean
}

export default function ServiceSelector({
  service,
  onChange,
  onBatchChange,
  inputClassName = '',
  showQuantity = true,
}: ServiceSelectorProps) {
  const isCustom = service._custom === true
  const servicesInCategory = service.serviceCategory
    ? getServicesByCategory(service.serviceCategory)
    : []

  const selectClass = `${inputClassName} appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8`

  const applyUpdates = (updates: Partial<Service>) => {
    if (onBatchChange) {
      onBatchChange(updates)
    } else {
      Object.entries(updates).forEach(([field, value]) => onChange(field, value))
    }
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value
    if (newCategory === '__custom__') {
      applyUpdates({ _custom: true, serviceName: '', serviceCategory: '' })
    } else if (newCategory === '') {
      applyUpdates({ _custom: false, serviceCategory: '', serviceName: '' })
    } else {
      applyUpdates({ _custom: false, serviceCategory: newCategory, serviceName: '', price: 0 })
    }
  }

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceName = e.target.value
    if (serviceName === '__custom__') {
      applyUpdates({ _custom: true, serviceName: '' })
    } else {
      applyUpdates({ _custom: false, serviceName })
    }
  }

  if (isCustom) {
    return (
      <div className="md:col-span-9">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#b0b0b0] uppercase tracking-[3px] mb-2">
              Custom Category
            </label>
            <input
              type="text"
              value={service.serviceCategory || ''}
              onChange={(e) => onChange('serviceCategory', e.target.value)}
              className={inputClassName}
              placeholder="e.g., Consulting"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#b0b0b0] uppercase tracking-[3px] mb-2">
              Custom Service
            </label>
            <input
              type="text"
              value={service.serviceName || ''}
              onChange={(e) => onChange('serviceName', e.target.value)}
              className={inputClassName}
              placeholder="e.g., Strategy Workshop"
              required
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            applyUpdates({ _custom: false, serviceCategory: '', serviceName: '' })
          }}
          className="mt-2 text-xs text-[#7a7a7a] hover:text-[#a0a0a0] transition-colors font-semibold"
        >
          ← Back to dropdown
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Category Dropdown */}
      <div className={service.serviceCategory ? 'md:col-span-4' : 'md:col-span-9'}>
        <label className="block text-xs font-semibold text-[#b0b0b0] uppercase tracking-[3px] mb-2">
          Category
        </label>
        <select
          value={service.serviceCategory || ''}
          onChange={handleCategoryChange}
          className={selectClass}
          required
        >
          <option value="">Select category...</option>
          {LNR_SERVICE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
          <option value="__custom__">Other (Custom)</option>
        </select>
      </div>

      {/* Service Dropdown */}
      {service.serviceCategory && (
        <div className={showQuantity ? 'md:col-span-4' : 'md:col-span-5'}>
          <label className="block text-xs font-semibold text-[#b0b0b0] uppercase tracking-[3px] mb-2">
            Service
          </label>
          <select
            value={service.serviceName || ''}
            onChange={handleServiceChange}
            className={selectClass}
            required
          >
            <option value="">Select service...</option>
            {servicesInCategory.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
            <option value="__custom__">Other (Custom)</option>
          </select>
        </div>
      )}

      {/* Quantity */}
      {showQuantity && service.serviceCategory && (
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-[#b0b0b0] uppercase tracking-[3px] mb-2">
            Qty
          </label>
          <input
            type="number"
            value={service.quantity || 1}
            onChange={(e) => onChange('quantity', parseInt(e.target.value) || 1)}
            className={`${inputClassName} text-center`}
            min="1"
          />
        </div>
      )}
    </>
  )
}
