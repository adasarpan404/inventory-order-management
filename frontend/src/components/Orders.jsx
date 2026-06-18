import { useEffect, useState } from 'react';
import { customersApi, ordersApi, productsApi } from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [ordersData, customersData, productsData] = await Promise.all([
        ordersApi.list(),
        customersApi.list(),
        productsApi.list(),
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);

  const updateItem = (index, field, value) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      customer_id: parseInt(customerId, 10),
      notes: notes || null,
      items: items.map((item) => ({
        product_id: parseInt(item.product_id, 10),
        quantity: parseInt(item.quantity, 10),
      })),
    };
    try {
      await ordersApi.create(payload);
      setCustomerId('');
      setItems([{ product_id: '', quantity: 1 }]);
      setNotes('');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStock = (productId) => {
    const product = products.find((p) => p.id === parseInt(productId, 10));
    return product ? product.stock_quantity : null;
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Orders</h2>
        <p>Stock is validated and reduced automatically when orders are placed</p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <h3>Create Order</h3>
        <div className="form-grid">
          <label>
            Customer
            <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </label>
          <label className="full-width">
            Notes
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional order notes" />
          </label>
        </div>

        <div className="order-items">
          <h4>Order Items</h4>
          {items.map((item, index) => {
            const stock = getStock(item.product_id);
            return (
              <div key={index} className="order-item-row">
                <select
                  required
                  value={item.product_id}
                  onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Stock: {p.stock_quantity}
                    </option>
                  ))}
                </select>
                <input
                  required
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                />
                {stock !== null && (
                  <span className={item.quantity > stock ? 'stock-warning' : 'stock-ok'}>
                    Available: {stock}
                  </span>
                )}
                <button type="button" className="btn-link danger" onClick={() => removeItem(index)}>Remove</button>
              </div>
            );
          })}
          <button type="button" className="btn-secondary" onClick={addItem}>+ Add Item</button>
        </div>

        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="btn-primary">Place Order</button>
        </div>
      </form>

      <div className="table-card">
        {loading ? <p className="muted">Loading...</p> : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Items</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.customer_name}</td>
                  <td><span className="badge badge-status">{o.status}</span></td>
                  <td>${Number(o.total_amount).toFixed(2)}</td>
                  <td>
                    <ul className="item-list">
                      {o.items.map((item) => (
                        <li key={item.id}>
                          {item.product_name} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="muted">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}