export const PAYMENT_TERMS_OPTIONS = [
  { value: 'due-on-receipt', label: 'Due on Receipt', netDays: 0 },
  { value: 'net-7', label: 'Net 7', netDays: 7 },
  { value: 'net-14', label: 'Net 14', netDays: 14 },
  { value: 'net-30', label: 'Net 30', netDays: 30 },
  { value: 'net-60', label: 'Net 60', netDays: 60 },
  { value: '50-50', label: '50/50 Split', netDays: null },
  { value: '25-50-25', label: '25/50/25 Standard', netDays: null },
  { value: 'dev-standard', label: 'Dev Standard', netDays: null },
  { value: 'custom', label: 'Custom', netDays: null },
]

export interface PaymentScheduleItem {
  label: string
  percent: number
  due: string
  amount: number
  status: string
}

export function getDefaultSchedule(termsType: string, total: number): PaymentScheduleItem[] {
  const schedules: Record<string, Omit<PaymentScheduleItem, 'amount'>[]> = {
    'due-on-receipt': [{ label: 'Full Payment', percent: 100, due: 'Due on receipt', status: 'pending' }],
    'net-7': [{ label: 'Full Payment', percent: 100, due: 'Due within 7 days', status: 'pending' }],
    'net-14': [{ label: 'Full Payment', percent: 100, due: 'Due within 14 days', status: 'pending' }],
    'net-30': [{ label: 'Full Payment', percent: 100, due: 'Due within 30 days', status: 'pending' }],
    'net-60': [{ label: 'Full Payment', percent: 100, due: 'Due within 60 days', status: 'pending' }],
    '50-50': [
      { label: 'Deposit', percent: 50, due: 'Due upfront', status: 'pending' },
      { label: 'Final Payment', percent: 50, due: 'Due on completion', status: 'pending' },
    ],
    '25-50-25': [
      { label: 'Deposit', percent: 25, due: 'Due upfront', status: 'pending' },
      { label: 'Progress Payment', percent: 50, due: 'Due on completion', status: 'pending' },
      { label: 'Final Payment', percent: 25, due: 'Due 2 weeks after completion', status: 'pending' },
    ],
    'dev-standard': [
      { label: 'Deposit', percent: 25, due: 'Due upfront', status: 'pending' },
      { label: 'Completion & Review', percent: 50, due: 'Due on completion & review sign-off', status: 'pending' },
      { label: 'Final (Post Bug-Fix)', percent: 25, due: 'Due after 2-week bug fix period', status: 'pending' },
    ],
    'custom': [],
  }
  const schedule = schedules[termsType] || []
  return schedule.map((item) => ({
    ...item,
    amount: +((total * item.percent) / 100).toFixed(2),
  }))
}

export function calculateDueDateFromTerms(termsType: string): string {
  const opt = PAYMENT_TERMS_OPTIONS.find((o) => o.value === termsType)
  if (!opt || opt.netDays == null || opt.netDays === 0) return ''
  const d = new Date()
  d.setDate(d.getDate() + opt.netDays)
  return d.toISOString().split('T')[0]
}

export function isSplitTerms(termsType: string): boolean {
  return ['50-50', '25-50-25', 'dev-standard', 'custom'].includes(termsType)
}

export function isNetTerms(termsType: string): boolean {
  return ['net-7', 'net-14', 'net-30', 'net-60'].includes(termsType)
}
