import Modal from './Modal.jsx'

export default function ConfirmDialog({ title, message, onConfirm, onCancel, busy }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p style={{ color: 'var(--muted)' }}>{message}</p>
      <div className="form-actions">
        <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Deleting…' : 'Delete'}
        </button>
        <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </Modal>
  )
}
