import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useToast } from '../components/Toast.jsx'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    api
      .getDashboard()
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading dashboard…</div>
  if (!data) return <div className="empty">Could not load dashboard data.</div>

  const stats = [
    { label: 'Total Products', value: data.total_products },
    { label: 'Total Customers', value: data.total_customers },
    { label: 'Total Orders', value: data.total_orders },
    { label: 'Low Stock', value: data.low_stock_count, warn: data.low_stock_count > 0 },
  ]

  return (
    <div>
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card ${s.warn ? 'warn' : ''}`}>
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>
          Low Stock Products{' '}
          <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 13 }}>
            (≤ {data.low_stock_threshold} in stock)
          </span>
        </h2>
        {data.low_stock_products.length === 0 ? (
          <div className="empty">All products are well stocked. 🎉</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>{p.quantity}</td>
                    <td>
                      <span className="badge badge-low">Low</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
