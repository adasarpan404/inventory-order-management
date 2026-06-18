import { useState } from 'react';
import Customers from './components/Customers';
import Inventory from './components/Inventory';
import Orders from './components/Orders';
import Products from './components/Products';
import './App.css';

const TABS = [
  { id: 'products', label: 'Products', icon: '📦' },
  { id: 'customers', label: 'Customers', icon: '👥' },
  { id: 'orders', label: 'Orders', icon: '🛒' },
  { id: 'inventory', label: 'Inventory', icon: '📊' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Inventory & Order Management</h1>
          <p>Manage products, customers, orders, and inventory in one place</p>
        </div>
      </header>

      <nav className="nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="main">
        {activeTab === 'products' && <Products />}
        {activeTab === 'customers' && <Customers />}
        {activeTab === 'orders' && <Orders />}
        {activeTab === 'inventory' && <Inventory />}
      </main>

      <footer className="footer">
        <p>Inventory & Order Management System — Assessment Project</p>
      </footer>
    </div>
  );
}