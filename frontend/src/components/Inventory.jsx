import { useEffect, useState } from 'react';
import { ordersApi } from '../api';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.inventory()
      .then(setInventory)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Inventory Tracking</h2>
        <p>Real-time stock levels and order history per product</p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="stats-grid">
        {inventory.map((item) => (
          <div key={item.product_id} className={`stat-card ${item.low_stock ? 'low-stock' : ''}`}>
            <h3>{item.product_name}</h3>
            <p className="sku">{item.product_sku}</p>
            <div className="stat-values">
              <div>
                <span className="stat-label">Current Stock</span>
                <span className={`stat-number ${item.low_stock ? 'warning' : ''}`}>{item.current_stock}</span>
              </div>
              <div>
                <span className="stat-label">Total Ordered</span>
                <span className="stat-number">{item.total_ordered}</span>
              </div>
            </div>
            {item.low_stock && <span className="badge badge-warning">Low Stock</span>}
          </div>
        ))}
      </div>

      {loading && <p className="muted">Loading inventory...</p>}
      {!loading && inventory.length === 0 && <p className="muted">No inventory data</p>}
    </div>
  );
}