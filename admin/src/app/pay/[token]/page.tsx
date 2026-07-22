'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, FileText, Mail, ArrowLeft, Upload, Loader2 } from 'lucide-react'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount || 0)

const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

interface Settings {
  companyName?: string
  companyAddress?: string
  companyNumber?: string
  vatNumber?: string
  bankName?: string
  bankAccountName?: string
  bankSortCode?: string
  bankAccountNumber?: string
  swiftCode?: string
  iban?: string
}

export default function PaymentPage() {
  const { token } = useParams()
  const [invoice, setInvoice] = useState<any>(null)
  const [settings, setSettings] = useState<Settings>({})
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
    async function fetchData() {
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
        if (data.settings) {
          setSettings(data.settings)
        }
      } catch {
        setError('Failed to load invoice details')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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
        setInvoice((prev: any) => ({ ...prev, status: 'paid', paymentConfirmedByClient: true }))
        return
      }
      setSubmitted(true)
    } catch {
      alert('Failed to submit payment confirmation')
      setSubmitting(false)
    }
  }

  const bankDetails = {
    bankName: settings.bankName || 'Tide',
    accountName: settings.bankAccountName || 'Late Night Ricky',
    sortCode: settings.bankSortCode || '—',
    accountNumber: settings.bankAccountNumber || '—',
    swift: settings.swiftCode || '',
    iban: settings.iban || '',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0e6d8] flex items-center justify-center">
        <div className="text-center">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="mx-auto mb-6" style={{ maxWidth: '200px' }} />
          <div className="flex items-center justify-center gap-2 text-[#5a3a1a]">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm font-medium uppercase tracking-wider">Loading invoice...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f0e6d8] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-sm max-w-lg w-full p-10 text-center border border-[#d0c4a8]">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="mx-auto mb-6" style={{ maxWidth: '160px' }} />
          <div className="w-16 h-16 bg-[#2a1a0a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-[#2a1a0a] text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-light text-[#2a1a0a] mb-3">Unable to Load Invoice</h1>
          <p className="text-[#5a3a1a] mb-6">{error}</p>
          <p className="text-sm text-[#5a3a1a]/70">
            Contact us at{' '}
            <a href="mailto:latenightricky@gmail.com" className="text-[#2a1a0a] hover:underline font-medium">
              latenightricky@gmail.com
            </a>
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f0e6d8] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-sm max-w-lg w-full p-10 text-center border border-[#d0c4a8]">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="mx-auto mb-6" style={{ maxWidth: '160px' }} />
          <div className="w-16 h-16 bg-[#2a1a0a] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} className="text-[#e8d4b8]" />
          </div>
          <h1 className="text-2xl font-light text-[#2a1a0a] mb-4">Thank You for Your Payment</h1>
          <div className="bg-[#f8f1e8] border border-[#d0c4a8] rounded-lg p-6 mb-6 text-left">
            <p className="text-xs uppercase tracking-widest text-[#5a3a1a] mb-3 font-semibold">Payment Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#5a3a1a]">Invoice</span>
                <span className="font-medium text-[#2a1a0a]">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a3a1a]">Amount</span>
                <span className="font-semibold text-[#2a1a0a]">{formatCurrency(parseFloat(amountPaid))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a3a1a]">Method</span>
                <span className="text-[#2a1a0a]">{paymentMethod}</span>
              </div>
            </div>
          </div>
          <p className="text-[#5a3a1a] text-sm mb-6">We&apos;ll review and confirm your payment shortly. You&apos;ll receive a confirmation email once processed.</p>
          <p className="text-xs text-[#5a3a1a]/60">
            Questions? Contact{' '}
            <a href="mailto:latenightricky@gmail.com" className="text-[#2a1a0a] hover:underline font-medium">
              latenightricky@gmail.com
            </a>
          </p>
          <p className="text-xs text-[#5a3a1a]/40 mt-4">Late Night Ricky</p>
        </div>
      </div>
    )
  }

  if (invoice.status === 'paid' || invoice.paymentConfirmedByClient) {
    return (
      <div className="min-h-screen bg-[#f0e6d8] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-sm max-w-lg w-full p-10 text-center border border-[#d0c4a8]">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="mx-auto mb-6" style={{ maxWidth: '160px' }} />
          <div className="w-16 h-16 bg-[#2a1a0a] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} className="text-[#e8d4b8]" />
          </div>
          <h1 className="text-2xl font-light text-[#2a1a0a] mb-4">Payment Already Confirmed</h1>
          <p className="text-[#5a3a1a] text-sm mb-6">
            Thank you. Payment for invoice {invoice.invoiceNumber} has already been confirmed. If you have any questions, please contact us.
          </p>
          <p className="text-xs text-[#5a3a1a]/60">
            Contact{' '}
            <a href="mailto:latenightricky@gmail.com" className="text-[#2a1a0a] hover:underline font-medium">
              latenightricky@gmail.com
            </a>
          </p>
          <p className="text-xs text-[#5a3a1a]/40 mt-4">Late Night Ricky</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0e6d8] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="mx-auto mb-3" style={{ maxWidth: '200px' }} />
          <p className="text-[10px] uppercase tracking-[3px] text-[#5a3a1a] font-medium">International DJ &amp; Grammy Winning Producer</p>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 border border-[#d0c4a8]">
          <div className="border-b-2 border-[#2a1a0a] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#5a3a1a] mb-1 font-semibold">Invoice</p>
                <p className="text-xl font-semibold text-[#2a1a0a]">{invoice.invoiceNumber}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs uppercase tracking-widest text-[#5a3a1a] mb-1 font-semibold">Amount Due</p>
                <p className="text-3xl font-light text-[#2a1a0a]">{formatCurrency(invoice.total)}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#5a3a1a] mb-2 font-semibold">Bill To</p>
                <p className="font-medium text-[#2a1a0a]">{invoice.clientName}</p>
                {invoice.clientCompany && <p className="text-sm text-[#5a3a1a]">{invoice.clientCompany}</p>}
                {invoice.clientEmail && <p className="text-sm text-[#5a3a1a]/70">{invoice.clientEmail}</p>}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#5a3a1a] mb-2 font-semibold">Project</p>
                <p className="font-medium text-[#2a1a0a]">{invoice.projectTitle || '—'}</p>
                {invoice.dueDate && (
                  <p className="text-sm text-[#5a3a1a] mt-1">Due: {formatDate(invoice.dueDate)}</p>
                )}
              </div>
            </div>

            {invoice.lineItems?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-[#5a3a1a] mb-3 font-semibold">Services</p>
                <div className="border border-[#d0c4a8] rounded-lg overflow-hidden">
                  {invoice.lineItems.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between items-center px-4 py-3 text-sm ${i % 2 === 1 ? 'bg-[#f8f1e8]' : ''} ${i < invoice.lineItems.length - 1 ? 'border-b border-[#d0c4a8]/50' : ''}`}>
                      <div>
                        <span className="font-medium text-[#2a1a0a]">{s.serviceName || s.description || 'Service'}</span>
                        {s.serviceCategory && <span className="ml-2 text-xs uppercase text-[#5a3a1a]/60">{s.serviceCategory}</span>}
                      </div>
                      <span className="font-semibold text-[#2a1a0a]">{formatCurrency(s.price || s.amount || 0)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-[#2a1a0a]">
                  <span className="text-sm font-medium text-[#2a1a0a]">Total</span>
                  <span className="text-lg font-bold text-[#2a1a0a]">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            )}

            {/* Bank Details from Settings */}
            <div className="bg-[#f8f1e8] border border-[#d0c4a8] rounded-lg p-5">
              <p className="text-xs uppercase tracking-widest text-[#2a1a0a] font-semibold mb-3">Bank Details for Payment</p>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <span className="text-[#5a3a1a]">Bank:</span>
                <span className="font-medium text-[#2a1a0a]">{bankDetails.bankName}</span>
                <span className="text-[#5a3a1a]">Account Name:</span>
                <span className="font-medium text-[#2a1a0a]">{bankDetails.accountName}</span>
                <span className="text-[#5a3a1a]">Sort Code:</span>
                <span className="font-medium text-[#2a1a0a]">{bankDetails.sortCode}</span>
                <span className="text-[#5a3a1a]">Account Number:</span>
                <span className="font-medium text-[#2a1a0a]">{bankDetails.accountNumber}</span>
                {bankDetails.swift && (
                  <>
                    <span className="text-[#5a3a1a]">SWIFT:</span>
                    <span className="font-medium text-[#2a1a0a]">{bankDetails.swift}</span>
                  </>
                )}
                {bankDetails.iban && (
                  <>
                    <span className="text-[#5a3a1a]">IBAN:</span>
                    <span className="font-medium text-[#2a1a0a]">{bankDetails.iban}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Payment Section */}
        {!showForm ? (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="inline-block bg-[#2a1a0a] text-[#e8d4b8] px-10 py-4 text-sm font-semibold uppercase tracking-widest rounded hover:bg-[#3a2a1a] transition-colors"
            >
              Confirm Payment
            </button>
            <p className="text-xs text-[#5a3a1a]/70 mt-3">Click above after you&apos;ve made your payment</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 border border-[#d0c4a8]">
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setShowForm(false)}
                className="text-[#5a3a1a] hover:text-[#2a1a0a] transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-lg font-light text-[#2a1a0a]">Confirm Your Payment</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-[#5a3a1a] mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-[#d0c4a8] rounded px-4 py-3 text-sm text-[#2a1a0a] focus:outline-none focus:border-[#2a1a0a] transition-colors bg-white"
                >
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-[#5a3a1a] mb-2">Amount Paid (&pound;)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  required
                  className="w-full border border-[#d0c4a8] rounded px-4 py-3 text-sm text-[#2a1a0a] focus:outline-none focus:border-[#2a1a0a] transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-[#5a3a1a] mb-2">
                  Receipt / Screenshot <span className="text-[#5a3a1a]/50 normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full border border-[#d0c4a8] rounded px-4 py-3 text-sm text-[#2a1a0a] file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#f0e6d8] file:text-[#2a1a0a] hover:file:bg-[#e8d4b8]"
                />
                {receiptFile && <p className="text-xs text-[#5a3a1a] mt-1">Selected: {receiptFile.name}</p>}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-[#5a3a1a] mb-2">
                  Reference / Notes <span className="text-[#5a3a1a]/50 normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  rows={3}
                  placeholder="Bank transfer reference, any additional notes..."
                  className="w-full border border-[#d0c4a8] rounded px-4 py-3 text-sm text-[#2a1a0a] focus:outline-none focus:border-[#2a1a0a] transition-colors resize-none bg-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#2a1a0a] text-[#e8d4b8] px-6 py-3 text-sm font-semibold uppercase tracking-widest rounded hover:bg-[#3a2a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Payment Confirmation'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-sm border border-[#d0c4a8] rounded text-[#5a3a1a] hover:bg-[#f8f1e8] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-10 pt-6 border-t border-[#d0c4a8]">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="mx-auto mb-2" style={{ maxWidth: '100px', opacity: 0.4 }} />
          <p className="text-[10px] uppercase tracking-[2px] text-[#5a3a1a]/50">International DJ &amp; Grammy Winning Producer</p>
          <p className="text-xs text-[#5a3a1a]/40 mt-2">Late Night Ricky</p>
        </div>
      </div>
    </div>
  )
}
