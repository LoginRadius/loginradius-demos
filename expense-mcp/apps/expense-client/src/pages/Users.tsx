import { Fragment, useEffect, useState } from 'react'
import { apiFetch, ApiError } from '../lib/api'
import type { AppUser } from '../types'

const message = (err: unknown, fallback: string) =>
  err instanceof ApiError ? err.message : fallback

/**
 * Department and reporting line are this app's own data. Roles are not shown or
 * edited here: they live in LoginRadius and reach the app through token scopes,
 * so naming someone a manager records org structure without granting anything.
 */
export function Users() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<{ department: string; managerId: string } | null>(null)
  const [rowError, setRowError] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiFetch<{ users: AppUser[] }>('/users')
      .then(r => setUsers(r.users))
      .catch((err: unknown) => setError(message(err, 'Failed to load users')))
      .finally(() => setLoading(false))
  }, [])

  const open = (user: AppUser) => {
    if (editing === user.userId) {
      setEditing(null)
      setDraft(null)
      return
    }
    setEditing(user.userId)
    setRowError(prev => ({ ...prev, [user.userId]: '' }))
    setDraft({ department: user.department ?? '', managerId: user.managerId ?? '' })
  }

  const save = async (user: AppUser) => {
    if (!draft) return
    setSaving(true)
    setRowError(prev => ({ ...prev, [user.userId]: '' }))
    try {
      const saved = await apiFetch<AppUser>(`/users/${user.userId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          department: draft.department.trim() || null,
          managerId: draft.managerId || null,
        }),
      })
      setUsers(prev => prev.map(u => (u.userId === saved.userId ? saved : u)))
      setEditing(null)
      setDraft(null)
    } catch (err: unknown) {
      setRowError(prev => ({ ...prev, [user.userId]: message(err, 'Failed to save') }))
    } finally {
      setSaving(false)
    }
  }

  const nameOf = (userId?: string) => users.find(u => u.userId === userId)?.fullName

  if (loading) return <div className="page"><p className="loading-text">Loading users…</p></div>
  if (error) return <div className="page"><div className="alert-error">{error}</div></div>

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Users</h2>
        <span className="loading-text">{users.length} total</span>
      </div>

      <p className="user-note" style={{ marginBottom: 16 }}>
        Everyone who has signed in to this app. Department and reporting line are stored
        here; roles and permissions live in LoginRadius and are assigned from its
        dashboard. Naming someone a manager records the reporting line only — they still
        need the matching permissions in their token before they can view or approve
        their reports&rsquo; expenses.
      </p>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Department</th>
              <th>Manager</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-cell">No users yet.</td>
              </tr>
            ) : (
              users.map(user => {
                const rowMsg = rowError[user.userId]
                const isOpen = editing === user.userId

                return (
                  <Fragment key={user.userId}>
                    <tr>
                      <td>
                        <div className="user-name-cell">
                          <strong>{user.fullName}</strong>
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="cell-nowrap">
                        {user.department ?? <span style={{ color: 'var(--gray-400)' }}>—</span>}
                      </td>
                      <td className="cell-nowrap">
                        {nameOf(user.managerId) ?? <span style={{ color: 'var(--gray-400)' }}>—</span>}
                      </td>
                      <td>
                        {user.lrUserId ? (
                          <span className="badge badge-role">Signed in</span>
                        ) : (
                          <span className="badge badge-muted">Never signed in</span>
                        )}
                      </td>
                      <td className="cell-nowrap" style={{ textAlign: 'right' }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => open(user)}>
                          {isOpen ? 'Close' : 'Edit'}
                        </button>
                      </td>
                    </tr>

                    {isOpen && draft && (
                      <tr className="user-expand-row">
                        <td colSpan={5}>
                          <div className="user-expand">
                            <div className="user-expand-col">
                              <div className="form-group">
                                <label className="form-label" htmlFor={`dept-${user.userId}`}>
                                  Department
                                </label>
                                <input
                                  id={`dept-${user.userId}`}
                                  className="form-input"
                                  value={draft.department}
                                  placeholder="e.g. Engineering"
                                  onChange={e => setDraft({ ...draft, department: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="user-expand-col">
                              <div className="form-group">
                                <label className="form-label" htmlFor={`mgr-${user.userId}`}>
                                  Manager
                                </label>
                                <select
                                  id={`mgr-${user.userId}`}
                                  className="form-select"
                                  value={draft.managerId}
                                  onChange={e => setDraft({ ...draft, managerId: e.target.value })}
                                >
                                  <option value="">— none —</option>
                                  {users
                                    .filter(u => u.userId !== user.userId)
                                    .map(u => (
                                      <option key={u.userId} value={u.userId}>
                                        {u.fullName}
                                        {u.department ? ` · ${u.department}` : ''}
                                      </option>
                                    ))}
                                </select>
                                <span className="form-hint">
                                  Any user can be named. Approval rights come from their
                                  LoginRadius permissions, not from this field.
                                </span>
                              </div>
                            </div>
                          </div>

                          {rowMsg && <div className="alert-error" style={{ marginTop: 12 }}>{rowMsg}</div>}

                          <div className="user-expand-actions">
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={saving}
                              onClick={() => void save(user)}
                            >
                              {saving ? 'Saving…' : 'Save changes'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              disabled={saving}
                              onClick={() => { setEditing(null); setDraft(null) }}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
