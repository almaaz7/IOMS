import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useToast } from '../components/Toast.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [detail, setDetail] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()

  const [customerId, setCustomerId] = useState('')
  const [lines, setLines] = useState([{ product_id: '', quantity: 1 }])
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadOrders = () => {
    setLoading(true)
    api
      .listOrders()
      .then(setOrders)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const openCreate = async () => {
    setCustomerId('')
    setLines([{ product_id: '', quantity: 1 }])
    setFormError('')
    try {
      const [c, p] = await Promise.all([api.listCustomers(), api.listProducts()])
      setCustomers(c)
      setProducts(p)
      if (c.length === 0) return toast.error('Add a customer before creating an order')
      if (p.length === 0) return toast.error('Add a product before creating an order')
      setShowForm(true)
    } catch (e) {
      toast.error(e.message)
    }
  }

  const productById = (id) => products.find((p) => String(p.id) === String(id))

  const computedTotal = lines.reduce((sum, l) => {
    const p = productById(l.product_id)
    return p ? sum + Number(p.price) * Number(l.quantity || 0) : sum
  }, 0)

  const setLine = (i, key, value) => {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)))
  }
  const addLine = () => setLines((ls) => [...ls, { product_id: '', quantity: 1 }])
  const removeLine = (i) => setLines((ls) => ls.filter((_, idx) => idx !== i))

  const submit = async (ev) => {
    ev.preventDefault()
    setFormError('')
    if (!customerId) return setFormError('Please select a customer')
    const items = lines
      .filter((l) => l.product_id)
      .map((l) => ({ product_id: Number(l.product_id), quantity: Number(l.quantity) }))
    if (items.length === 0) return setFormError('Add at least one product')
    if (items.some((i) => !Number.isInteger(i.quantity) || i.quantity <= 0))
      return setFormError('Quantities must be whole numbers greater than 0')

    setSaving(true)
    try {
      await api.createOrder({ customer_id: Number(customerId), items })
      toast.success('Order placed — stock updated')
      setShowForm(false)
      loadOrders()
    } catch (e) {
      setFormError(e.message)
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await api.deleteOrder(deleteTarget.id)
      toast.success('Order cancelled — stock restored')
      setDeleteTarget(null)
      loadOrders()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 style={{ margin: 0 }}>Orders</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          + Create Order
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="empty">No orders yet. Create your first order.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.customer_name || o.customer_id}</td>
                    <td>{o.items.length}</td>
                    <td>${Number(o.total_amount).toFixed(2)}</td>
                    <td>
                      <span className="badge badge-status">{o.status}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDetail(o)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(o)}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <Modal title="Create Order" onClose={() => setShowForm(false)}>
          <form onSubmit={submit}>
            <div className="field">
              <label>Customer *</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select a customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ margin: '18px 0 8px', fontWeight: 600, fontSize: 14 }}>
              Products
            </div>
            <div className="order-items-editor">
              {lines.map((l, i) => {
                const p = productById(l.product_id)
                return (
                  <div className="order-item-row" key={i}>
                    <div className="field">
                      <label>Product</label>
                      <select
                        value={l.product_id}
                        onChange={(e) => setLine(i, 'product_id', e.target.value)}
                      >
                        <option value="">Select…</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ${Number(p.price).toFixed(2)} ({p.quantity} in stock)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Qty</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={l.quantity}
                        onChange={(e) => setLine(i, 'quantity', e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeLine(i)}
                      disabled={lines.length === 1}
                      title="Remove line"
                    >
                      ✕
                    </button>
                    {p && Number(l.quantity) > p.quantity && (
                      <span className="error-text" style={{ gridColumn: '1 / -1' }}>
                        Only {p.quantity} of “{p.name}” in stock
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 10 }}
              onClick={addLine}
            >
              + Add product line
            </button>

            <div className="line-total">Total: ${computedTotal.toFixed(2)}</div>

            {formError && (
              <div className="error-text" style={{ marginTop: 10 }}>
                {formError}
              </div>
            )}

            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Placing…' : 'Place Order'}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {detail && (
        <Modal title={`Order #${detail.id}`} onClose={() => setDetail(null)}>
          <p style={{ marginTop: 0 }}>
            <strong>Customer:</strong> {detail.customer_name || detail.customer_id}
            <br />
            <strong>Status:</strong> {detail.status}
            <br />
            <strong>Placed:</strong> {new Date(detail.created_at).toLocaleString()}
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit price</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.product_name || it.product_id}</td>
                    <td>${Number(it.unit_price).toFixed(2)}</td>
                    <td>{it.quantity}</td>
                    <td>${Number(it.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 600 }}>
                    Total
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    ${Number(detail.total_amount).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => setDetail(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Cancel Order"
          message={`Cancel order #${deleteTarget.id}? Reserved stock will be restored.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}
    </div>
  )
}
