import { useEffect, useState } from 'react';
import { customersApi } from '../api';

const emptyForm = { name: '', email: '', phone: '', address: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setCustomers(await customersApi.list());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      address: form.address || null,
    };
    try {
      if (editingId) {
        await customersApi.update(editingId, payload);
      } else {
        await customersApi.create(payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (customer) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await customersApi.remove(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Customers</h2>
        <p>Each customer must have a unique email address</p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Customer' : 'Add Customer'}</h3>
        <div className="form-grid">
          <label>
            Name
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Email
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="full-width">
            Address
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          {editingId && (
            <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
        </div>
      </form>

      <div className="table-card">
        {loading ? <p className="muted">Loading...</p> : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || '—'}</td>
                  <td className="actions">
                    <button className="btn-link" onClick={() => startEdit(c)}>Edit</button>
                    <button className="btn-link danger" onClick={() => handleDelete(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={4} className="muted">No customers yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}