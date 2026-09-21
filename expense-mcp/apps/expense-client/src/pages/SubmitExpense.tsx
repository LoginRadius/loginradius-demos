import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, ApiError } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { Category, Expense } from '../types'

interface FormState {
  categoryId: string
  amount: string
  currency: string
  description: string
  expenseDate: string
  receiptUrl: string
}

const EMPTY: FormState = {
  categoryId: '',
  amount: '',
  currency: 'USD',
  description: '',
  expenseDate: '',
  receiptUrl: '',
}

export function SubmitExpense() {
  const navigate = useNavigate()
  const { user } = useAuth()
  // The server refuses submissions until a finance admin assigns a department.
  // Say so up front rather than letting the form be filled in and rejected.
  const missingDepartment = user != null && !user.department
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<FormState>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<{ categories: Category[] }>('/categories')
      .then(data => setCategories(data.categories))
      .catch(() => setError('Failed to load categories'))
  }, [])

  const selectedCategory = categories.find(c => c.categoryId === Number(form.categoryId))

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await apiFetch<Expense>('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          categoryId: Number(form.categoryId),
          amount: Number(form.amount),
          currency: form.currency || 'USD',
          description: form.description,
          expenseDate: form.expenseDate,
          receiptUrl: form.receiptUrl || undefined,
        }),
      })
      navigate('/expenses/me')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit expense')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Submit Expense</h2>
      </div>

      {missingDepartment && (
        <div className="alert-warning" style={{ maxWidth: 480 }}>
          Your profile has no department yet, so expenses cannot be submitted. A finance
          admin needs to assign one from the Users screen.
        </div>
      )}

      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label htmlFor="categoryId" className="form-label">Category</label>
              <select
                id="categoryId"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select a category</option>
                {categories.map(c => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName}
                    {c.maxAmount != null ? ` (max $${c.maxAmount})` : ''}
                  </option>
                ))}
              </select>
              {selectedCategory?.requiresReceipt && (
                <span className="form-hint" style={{ color: '#92400e' }}>
                  Receipt URL required for this category
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="amount" className="form-label">Amount</label>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group" style={{ width: 80 }}>
                <label htmlFor="currency" className="form-label">Currency</label>
                <input
                  id="currency"
                  type="text"
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  maxLength={3}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="expenseDate" className="form-label">Date</label>
              <input
                id="expenseDate"
                type="date"
                name="expenseDate"
                value={form.expenseDate}
                onChange={handleChange}
                required
                className="form-input"
                style={{ width: 'auto' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                minLength={10}
                maxLength={500}
                rows={3}
                required
                className="form-textarea"
              />
              <span className="form-hint">{form.description.length}/500</span>
            </div>

            {((selectedCategory?.requiresReceipt ?? false) || form.receiptUrl) && (
              <div className="form-group">
                <label htmlFor="receiptUrl" className="form-label">
                  Receipt URL{selectedCategory?.requiresReceipt ? ' *' : ''}
                </label>
                <input
                  id="receiptUrl"
                  type="url"
                  name="receiptUrl"
                  value={form.receiptUrl}
                  onChange={handleChange}
                  required={selectedCategory?.requiresReceipt ?? false}
                  className="form-input"
                />
              </div>
            )}

            {error && <div className="alert-error">{error}</div>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate('/expenses/me')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || missingDepartment}
              >
                {submitting ? 'Submitting…' : 'Submit Expense'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
