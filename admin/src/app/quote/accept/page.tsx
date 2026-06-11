'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount || 0)

function QuoteAcceptContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [state, setState] = useState<{
    loading: boolean
    error: string | null
    data: any
  }>({ loading: true, error: null, data: null })

  useEffect(() => {
    if (!token) {
      setState({ loading: false, error: 'Invalid accept quote link', data: null })
      return
    }

    fetch('/api/quotes/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok || !json.success) {
          setState({ loading: false, error: json.error || 'Failed to accept quote', data: null })
        } else {
          setState({ loading: false, error: null, data: json })
        }
      })
      .catch(() => {
        setState({ loading: false, error: 'An error occurred. Please try again.', data: null })
      })
  }, [token])

  if (state.loading) {
    return (
      <div className="min-h-screen bg-[#0f1923] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-light tracking-[6px] text-white mb-4">LATE NIGHT RICKY</p>
          <div className="w-10 h-10 border-[3px] border-white/20 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-[#0f1923] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-sm max-w-lg w-full p-10 text-center">
          <p className="text-2xl font-light tracking-[6px] text-[#0f1923] mb-6">LATE NIGHT RICKY</p>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-light text-gray-900 mb-3">Quote Acceptance Error</h1>
          <p className="text-gray-500 mb-6">{state.error}</p>
          <p className="text-sm text-gray-400">
            Contact us at{' '}
            <a href="mailto:samir@wearemediahive.com" className="text-[#0f1923] hover:underline font-medium">
              samir@wearemediahive.com
            </a>
          </p>
        </div>
      </div>
    )
  }

  const { quoteId, quoteNumber, clientName, projectTitle, lineItems, total, alreadyAccepted, paymentSchedule, paymentTermsLabel } = state.data

  const items = Array.isArray(lineItems) ? lineItems : []

  return (
    <div className="min-h-screen bg-[#0f1923] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="mx-auto mb-2" style={{ maxWidth: '180px', filter: 'brightness(0) invert(1)' }} />
          <p className="text-[10px] uppercase tracking-[3px] text-[#8FA8BE]">International DJ &amp; Grammy Winning Producer</p>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="border-b-2 border-[#0f1923] p-6 sm:p-8 text-center">
            <div className="w-20 h-20 bg-[#0f1923] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-4xl">✓</span>
            </div>
            <h1 className="text-2xl font-light text-[#0f1923] mb-3">
              {alreadyAccepted ? 'Quote Already Accepted' : 'Quote Accepted'}
            </h1>
            <p className="text-gray-500 max-w-md mx-auto">
              {alreadyAccepted
                ? `Thank you, ${clientName || 'Valued Client'}. Your quote has already been accepted and your invoice has been sent.`
                : `Thank you, ${clientName || 'Valued Client'}. Your quote has been accepted successfully. You will receive an invoice shortly.`}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Quote Number</p>
                <p className="font-semibold text-[#0f1923]">{quoteNumber || '#' + quoteId}</p>
              </div>
              {projectTitle && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Project</p>
                  <p className="font-medium text-gray-900">{projectTitle}</p>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Services</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {items.map((s: any, i: number) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center px-4 py-3 text-sm ${i % 2 === 1 ? 'bg-gray-50' : ''} ${i < items.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <span className="font-medium text-gray-900">{s.serviceName || s.description || 'Service'}</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(s.price || s.amount || 0)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-[#0f1923]">
                  <span className="text-sm font-medium text-[#0f1923]">Total</span>
                  <span className="text-lg font-bold text-[#0f1923]">{formatCurrency(total)}</span>
                </div>
              </div>
            )}

            {Array.isArray(paymentSchedule) && paymentSchedule.length > 1 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <p className="text-xs uppercase tracking-widest font-medium text-[#0f1923] mb-3">
                  Payment Schedule {paymentTermsLabel && <span className="normal-case tracking-normal text-gray-500 font-normal">— {paymentTermsLabel}</span>}
                </p>
                <div className="space-y-0">
                  {paymentSchedule.map((item: any, i: number) => (
                    <div key={i} className={`flex justify-between items-center text-sm py-2 ${i < paymentSchedule.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <span className="font-medium text-gray-900">{item.label}</span>
                      <span className="text-gray-500">{item.percent}% — {item.due || item.dueLabel || ''}</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {paymentTermsLabel && (!paymentSchedule || paymentSchedule.length <= 1) && (
              <div className="bg-[#f0f4f8] border border-[#d0dce6] rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="text-xs uppercase tracking-widest text-[#0f1923] font-semibold">Payment Terms:</span>{' '}
                  {paymentTermsLabel}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-[#8FA8BE]">
            If you have any questions, please contact us at{' '}
            <a href="mailto:samir@wearemediahive.com" className="text-white hover:underline">
              samir@wearemediahive.com
            </a>
          </p>
        </div>

        <div className="text-center pt-6 border-t border-white/10">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="mx-auto mb-1" style={{ maxWidth: '100px', opacity: 0.5 }} />
          <p className="text-xs text-[#8FA8BE]/70">International DJ &amp; Grammy Winning Producer</p>
        </div>
      </div>
    </div>
  )
}

export default function QuoteAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f1923] flex items-center justify-center">
          <p className="text-2xl font-light tracking-[6px] text-white">LATE NIGHT RICKY</p>
        </div>
      }
    >
      <QuoteAcceptContent />
    </Suspense>
  )
}
