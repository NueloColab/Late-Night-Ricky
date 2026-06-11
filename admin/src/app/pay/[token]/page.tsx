'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount || 0)

const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function PaymentPage() {
  const { token } = useParams()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer')
  const [amountPaid, setAmountPaid] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [reference, setReference] = useState('')

  useEffect(() => {
    if (!token) return
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoices/pay/${token}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Invoice not found')
          return
        }
        const data = await res.json()
        setInvoice(data)
        setAmountPaid(data.total?.toString() || '')
      } catch {
        setError('Failed to load invoice details')
      } finally {
        setLoading(false)
      }
    }
    fetchInvoice()
  }, [token])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum 10MB.')
      return
    }
    setReceiptFile(file || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let receiptBase64: string | null = null
      let receiptName: string | null = null
      let receiptType: string | null = null
      if (receiptFile) {
        receiptBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve((reader.result as string).split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(receiptFile)
        })
        receiptName = receiptFile.name
        receiptType = receiptFile.type
      }

      const res = await fetch('/api/invoices/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentToken: token,
          paymentMethod,
          amountPaid: parseFloat(amountPaid),
          receiptFile: receiptBase64,
          receiptFilename: receiptName,
          receiptContentType: receiptType,
          reference,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to confirm payment')
        setSubmitting(false)
        return
      }
      if (data.alreadyPaid) {
        // Refresh the invoice to show the already-paid state
        setInvoice((prev: any) => ({ ...prev, status: 'paid', paymentConfirmedByClient: true }))
        return
      }
      setSubmitted(true)
    } catch {
      alert('Failed to submit payment confirmation')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1923] flex items-center justify-center">
        <div className="text-center">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="mx-auto mb-4" style={{ maxWidth: '180px' }} />
          <p className="text-sm text-[#8FA8BE]">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1923] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-sm max-w-lg w-full p-10 text-center">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="mx-auto mb-6" style={{ maxWidth: '160px', filter: 'invert(1)' }} />
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-light text-gray-900 mb-3">Unable to Load Invoice</h1>
          <p className="text-gray-500 mb-6">{error}</p>
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0f1923] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-sm max-w-lg w-full p-10 text-center">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="mx-auto mb-8" style={{ maxWidth: '160px', filter: 'invert(1)' }} />
          <div className="w-20 h-20 bg-[#0f1923] rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-white text-4xl">✓</span>
          </div>
          <h1 className="text-2xl font-light text-[#0f1923] mb-4">Thank You for Your Payment</h1>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 text-left">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Payment Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice</span>
                <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-[#0f1923]">{formatCurrency(parseFloat(amountPaid))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="text-gray-900">{paymentMethod}</span>
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-6">We&apos;ll review and confirm your payment shortly. You&apos;ll receive a confirmation email once processed.</p>
          <p className="text-xs text-gray-400">
            Questions? Contact{' '}
            <a href="mailto:samir@wearemediahive.com" className="text-[#0f1923] hover:underline font-medium">
              samir@wearemediahive.com
            </a>
          </p>
        </div>
      </div>
    )
  }

  if (invoice.status === 'paid' || invoice.paymentConfirmedByClient) {
    return (
      <div className="min-h-screen bg-[#0f1923] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-sm max-w-lg w-full p-10 text-center">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="mx-auto mb-8" style={{ maxWidth: '160px', filter: 'invert(1)' }} />
          <div className="w-20 h-20 bg-[#0f1923] rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-white text-4xl">✓</span>
          </div>
          <h1 className="text-2xl font-light text-[#0f1923] mb-4">Payment Already Confirmed</h1>
          <p className="text-gray-500 text-sm mb-6">
            Thank you. Payment for invoice {invoice.invoiceNumber} has already been confirmed. If you have any questions, please contact us.
          </p>
          <p className="text-xs text-gray-400">
            Contact{' '}
            <a href="mailto:samir@wearemediahive.com" className="text-[#0f1923] hover:underline font-medium">
              samir@wearemediahive.com
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1923] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="mx-auto mb-2" style={{ maxWidth: '180px' }} />
          <p className="text-[10px] uppercase tracking-[3px] text-[#8FA8BE]">International DJ &amp; Grammy Winning Producer</p>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="border-b-2 border-[#0f1923] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Invoice</p>
                <p className="text-xl font-semibold text-gray-900">{invoice.invoiceNumber}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Amount Due</p>
                <p className="text-3xl font-light text-[#0f1923]">{formatCurrency(invoice.total)}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Bill To</p>
                <p className="font-medium text-gray-900">{invoice.clientName}</p>
                {invoice.clientCompany && <p className="text-sm text-gray-600">{invoice.clientCompany}</p>}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Project</p>
                <p className="font-medium text-gray-900">{invoice.projectTitle}</p>
                {invoice.dueDate && (
                  <p className="text-sm text-gray-600 mt-1">Due: {formatDate(invoice.dueDate)}</p>
                )}
              </div>
            </div>

            {invoice.lineItems?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Services</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {invoice.lineItems.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between items-center px-4 py-3 text-sm ${i % 2 === 1 ? 'bg-gray-50' : ''} ${i < invoice.lineItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <div>
                        <span className="font-medium text-gray-900">{s.serviceName || s.description || 'Service'}</span>
                        {s.serviceCategory && <span className="ml-2 text-xs uppercase text-[#8FA8BE]">{s.serviceCategory}</span>}
                      </div>
                      <span className="font-semibold text-gray-900">{formatCurrency(s.price || s.amount || 0)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-[#0f1923]">
                  <span className="text-sm font-medium text-[#0f1923]">Total</span>
                  <span className="text-lg font-bold text-[#0f1923]">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            )}

            {/* Bank Details */}
            <div className="bg-[#f0f4f8] border border-[#d0dce6] rounded-lg p-5">
              <p className="text-xs uppercase tracking-widest text-[#0f1923] font-semibold mb-3">Bank Details for Payment</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Bank:</span><span className="font-medium text-gray-900">Tide</span>
                <span className="text-gray-500">Account Name:</span><span className="font-medium text-gray-900">Late Night Ricky Ltd</span>
                <span className="text-gray-500">Sort Code:</span><span className="font-medium text-gray-900">04-06-05</span>
                <span className="text-gray-500">Account Number:</span><span className="font-medium text-gray-900">23690693</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Payment Section */}
        {!showForm ? (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="inline-block bg-[#0f1923] text-white px-10 py-4 text-sm font-semibold uppercase tracking-widest rounded hover:bg-[#1B3A4C] transition-colors"
            >
              Confirm Payment
            </button>
            <p className="text-xs text-[#8FA8BE] mt-3">Click above after you&apos;ve made your payment</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-light text-[#0f1923] mb-6">Confirm Your Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-widest font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#0f1923] transition-colors bg-white"
                >
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-medium text-gray-700 mb-2">Amount Paid (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#0f1923] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-medium text-gray-700 mb-2">
                  Receipt / Screenshot <span className="text-gray-400 normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full border border-gray-200 rounded px-4 py-3 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-[#0f1923] hover:file:bg-gray-200"
                />
                {receiptFile && <p className="text-xs text-gray-500 mt-1">Selected: {receiptFile.name}</p>}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-medium text-gray-700 mb-2">
                  Reference / Notes <span className="text-gray-400 normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  rows={3}
                  placeholder="Bank transfer reference, any additional notes..."
                  className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-[#0f1923] transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#0f1923] text-white px-6 py-3 text-sm font-semibold uppercase tracking-widest rounded hover:bg-[#1B3A4C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Payment Confirmation'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-white/10">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="mx-auto mb-1" style={{ maxWidth: '100px', opacity: 0.5 }} />
          <p className="text-xs text-[#8FA8BE]/70">International DJ &amp; Grammy Winning Producer</p>
        </div>
      </div>
    </div>
  )
}
