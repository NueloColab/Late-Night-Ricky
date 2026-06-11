'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

let toastId = 0
const listeners: ((toast: Toast) => void)[] = []

export function showToast(type: 'success' | 'error' | 'info', message: string) {
  const id = ++toastId
  listeners.forEach((l) => l({ id, type, message }))
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id))
    }, 4000)
  }, [])

  useEffect(() => {
    listeners.push(addToast)
    return () => {
      const idx = listeners.indexOf(addToast)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [addToast])

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => {
        const styles =
          toast.type === 'success'
            ? 'bg-[#0f1923] text-white border-[#1B3A4C]'
            : toast.type === 'error'
            ? 'bg-white text-red-600 border-red-200'
            : 'bg-white text-[#1B3A4C] border-[#E3E8ED]'

        const icon =
          toast.type === 'success' ? (
            <CheckCircle size={18} className="text-[#8FA8BE]" />
          ) : toast.type === 'error' ? (
            <XCircle size={18} className="text-red-400" />
          ) : (
            <AlertCircle size={18} className="text-[#8FA8BE]" />
          )

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-4 border shadow-lg min-w-[300px] max-w-[400px] animate-in slide-in-from-right duration-300 ${styles}`}
          >
            {icon}
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-60 hover:opacity-100 transition"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
