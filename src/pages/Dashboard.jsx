import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { products, sales, dashboardStats } = useData();
  const [selectedProductId, setSelectedProductId] = useState('');

  const selectedProductStats = useMemo(() => {
    if (!selectedProductId) return null;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return null;

    const productSales = sales.filter(sale => 
      sale.items.some(item => item.productId === selectedProductId)
    );
    
    const stats = productSales.reduce((acc, sale) => {
      const item = sale.items.find(i => i.productId === selectedProductId);
      if (item) {
        acc.sold += item.quantity;
        acc.revenue += item.quantity * (item.priceAtMoment || 0);
        acc.profit += (item.quantity * (item.priceAtMoment || 0)) - (item.quantity * product.purchasePrice);
        
        // Calculate pro-rated debt for this product in this sale
        const saleTotal = sale.totalAmount;
        const salePaid = sale.paidAmount !== undefined ? sale.paidAmount : saleTotal;
        const saleDebt = saleTotal - salePaid;
        
        if (saleDebt > 0 && saleTotal > 0) {
          const itemTotal = item.quantity * (item.priceAtMoment || 0);
          const productShare = itemTotal / saleTotal;
          acc.debt += saleDebt * productShare;
        }
      }
      return acc;
    }, { sold: 0, revenue: 0, profit: 0, debt: 0 });

    return { ...stats, stock: product.stock, unit: product.unit, name: product.name };
  }, [selectedProductId, products, sales]);

  if (!dashboardStats) return <div>Loading...</div>;

  const { 
    totalSalesToday = 0, 
    totalProfitToday = 0, 
    totalRevenueAllTime = 0,
    totalProfitAllTime = 0,
    totalOutstandingDebt = 0,
    lowStockProducts = [], 
    bestSellers = [],
    topCustomers = []
  } = dashboardStats;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>All-Time Sales</h3>
          <div className={styles.statValue}>{totalRevenueAllTime.toFixed(2)} MAD</div>
        </div>
        <div className={styles.statCard}>
          <h3>All-Time Profit</h3>
          <div className={`${styles.statValue} ${styles.profit}`}>+{totalProfitAllTime.toFixed(2)} MAD</div>
        </div>
        <div className={styles.statCard}>
          <h3>Outstanding Debt</h3>
          <div className={`${styles.statValue} ${styles.danger}`}>{totalOutstandingDebt.toFixed(2)} MAD</div>
        </div>

      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 className={styles.sectionTitle}>Product Statistics</h2>
        <div className={styles.selectorContainer}>
          <select 
            className={styles.select}
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select a product to view statistics...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {selectedProductStats ? (
          <div className={styles.productStatsGrid}>
            <div className={styles.productStatCard}>
              <span className={styles.productStatLabel}>All-Time Sales</span>
              <div className={styles.productStatValue}>{selectedProductStats.revenue.toFixed(2)} MAD</div>
            </div>
            <div className={styles.productStatCard}>
              <span className={styles.productStatLabel}>All-Time Profit</span>
              <div className={`${styles.productStatValue} ${styles.profit}`}>+{selectedProductStats.profit.toFixed(2)} MAD</div>
            </div>
            <div className={styles.productStatCard}>
              <span className={styles.productStatLabel}>Outstanding Debt</span>
              <div className={`${styles.productStatValue} ${styles.danger}`}>{selectedProductStats.debt.toFixed(2)} MAD</div>
            </div>
            <div className={styles.productStatCard}>
              <span className={styles.productStatLabel}>Current Stock</span>
              <div className={styles.productStatValue}>
                {selectedProductStats.stock} <small style={{fontSize: '1rem', color: 'var(--color-text-secondary)'}}>{selectedProductStats.unit}</small>
              </div>
            </div>
          </div>
        ) : (
          <p className={styles.emptyState}>Please select a product to see its performance.</p>
        )}
      </div>

      <div className={styles.contentGrid}>




        <div className="card">
          <h2>Top Customers</h2>
          {topCustomers.length === 0 ? (
            <p className={styles.emptyState}>No customer data yet.</p>
          ) : (
            <ul className={styles.list}>
              {topCustomers.map((customer, index) => (
                <li key={index} className={styles.listItem}>
                  <span className={styles.itemName}>
                    <span className={styles.rank}>#{index + 1}</span>
                    {customer.name}
                  </span>
                  <span className={styles.itemValue}>{customer.totalSpent.toFixed(2)} MAD</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Best Selling Products</h2>
          {bestSellers.length === 0 ? (
            <p className={styles.emptyState}>No sales data yet.</p>
          ) : (
            <ul className={styles.list}>
              {bestSellers.map((product, index) => (
                <li key={product.id} className={styles.listItem}>
                  <span className={styles.itemName}>
                    <span className={styles.rank}>#{index + 1}</span>
                    {product.name}
                  </span>
                  <span className={styles.itemValue}>{product.totalSold} {product.unit} sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Low Stock Alerts</h2>
          {lowStockProducts.length === 0 ? (
            <p className={styles.emptyState}>All stock levels are good!</p>
          ) : (
            <ul className={styles.list}>
              {lowStockProducts.map(product => (
                <li key={product.id} className={styles.listItem}>
                  <span className={styles.itemName}>{product.name}</span>
                  <span className={`${styles.itemValue} ${styles.danger}`}>
                    Only {product.stock} {product.unit} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
