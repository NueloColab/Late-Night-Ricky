'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
  title?: string
}

export default function Modal({ isOpen, onClose, children, maxWidth = 'max-w-3xl', title }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={`relative w-full ${maxWidth} bg-white shadow-2xl border border-[#E3E8ED]`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-[#E3E8ED] rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X size={20} className="text-[#1B3A4C]" />
            </button>

            {/* Title */}
            {title && (
              <div className="px-6 pt-6 pb-2">
                <h2 className="text-xl font-serif font-semibold text-[#1B3A4C] pr-10">{title}</h2>
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
