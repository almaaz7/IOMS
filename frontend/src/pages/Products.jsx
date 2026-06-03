import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useToast } from '../components/Toast.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const EMPTY = { name: '', sku: '', description: '', price: '', quantity: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()

  const load = () => {
    setLoading(true)
    api
      .listProducts()
      .then(setProducts)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setErrors({})
    setShowForm(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name: p.name,
      sku: p.sku,
      description: p.description || '',
      price: String(p.price),
      quantity: String(p.quantity),
    })
    setErrors({})
    setShowForm(true)
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.sku.trim()) e.sku = 'SKU is required'
    if (form.price === '' || Number(form.price) < 0) e.price = 'Enter a valid price (≥ 0)'
    if (form.quantity === '' || !Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 0)
      e.quantity = 'Enter a whole number (≥ 0)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      quantity: Number(form.quantity),
    }
    try {
      if (editing) {
        await api.updateProduct(editing.id, payload)
        toast.success('Product updated')
      } else {
        await api.createProduct(payload)
        toast.success('Product created')
      }
      setShowForm(false)
      load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await api.deleteProduct(deleteTarget.id)
      toast.success('Product deleted')
      setDeleteTarget(null)
      load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div>
      <div className="page-header">
        <h2 style={{ margin: 0 }}>Products</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Product
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : products.length === 0 ? (
          <div className="empty">No products yet. Add your first product.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>{p.quantity}</td>
                    <td>
                      {p.quantity <= 10 ? (
                        <span className="badge badge-low">Low</span>
                      ) : (
                        <span className="badge badge-ok">In stock</span>
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(p)}
                        >
                          Delete
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
        <Modal
          title={editing ? 'Edit Product' : 'Add Product'}
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="field">
                <label>Name *</label>
                <input
                  className={errors.name ? 'invalid' : ''}
                  value={form.name}
                  onChange={set('name')}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className="field">
                <label>SKU / Code *</label>
                <input
                  className={errors.sku ? 'invalid' : ''}
                  value={form.sku}
                  onChange={set('sku')}
                />
                {errors.sku && <span className="error-text">{errors.sku}</span>}
              </div>
              <div className="field">
                <label>Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={errors.price ? 'invalid' : ''}
                  value={form.price}
                  onChange={set('price')}
                />
                {errors.price && <span className="error-text">{errors.price}</span>}
              </div>
              <div className="field">
                <label>Quantity in stock *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={errors.quantity ? 'invalid' : ''}
                  value={form.quantity}
                  onChange={set('quantity')}
                />
                {errors.quantity && <span className="error-text">{errors.quantity}</span>}
              </div>
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label>Description</label>
              <textarea rows="2" value={form.description} onChange={set('description')} />
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
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

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product"
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}
    </div>
  )
}
