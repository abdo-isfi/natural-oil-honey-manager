import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import styles from './Sales.module.css';

const Sales = () => {
  const { products, sales, addSale, settleDebt, deleteSale, updateSale } = useData();
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'history'
  
  // POS State
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [error, setError] = useState('');
  
  // History Filter State
  const [historyFilterProduct, setHistoryFilterProduct] = useState('');

  // Edit State
  const [editingSale, setEditingSale] = useState(null);
  const [editForm, setEditForm] = useState({ customerName: '', paidAmount: '', date: '' });

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stock > 0
    );
  }, [products, searchTerm]);

  const addToCart = (product) => {
    setError('');
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) return prev; // Prevent overselling
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { 
        productId: product.id, 
        productName: product.name, 
        quantity: 1, 
        price: product.sellingPrice,
        cost: product.purchasePrice,
        maxStock: product.stock,
        unit: product.unit
      }];
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: Math.min(newQty, item.maxStock) };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    if (!customerName.trim()) {
      setError('Please enter the Buyer Name to complete the sale.');
      return;
    }

    const paid = paidAmount === '' ? cartTotal : Number(paidAmount);
    if (paid < 0) {
      setError('Paid amount cannot be negative.');
      return;
    }

    const totalAmount = cartTotal;
    const totalCost = cart.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    const totalProfit = totalAmount - totalCost;

    addSale({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      customerName: customerName.trim(),
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        priceAtMoment: item.price,
        unit: item.unit
      })),
      totalAmount,
      paidAmount: paid,
      totalProfit
    });

    setCart([]);
    setCustomerName('');
    setPaidAmount('');
    setError('');
    alert('Sale completed successfully!');
  };

  const handleSettleDebt = (sale) => {
    const remainingDebt = sale.totalAmount - (sale.paidAmount || 0);
    const amountStr = prompt(`Enter amount to settle (Remaining: ${remainingDebt.toFixed(2)} MAD):`);
    if (amountStr) {
      const amount = Number(amountStr);
      if (amount > 0 && amount <= remainingDebt) {
        settleDebt(sale.id, amount);
      } else {
        alert('Invalid amount. Please enter a value between 0 and the remaining debt.');
      }
    }
  };

  const handleDelete = (sale) => {
    if (window.confirm(`Are you sure you want to delete the sale for ${sale.customerName}? Stock will be restored.`)) {
      deleteSale(sale.id);
    }
  };

  const startEdit = (sale) => {
    setEditingSale(sale);
    setEditForm({
      customerName: sale.customerName,
      paidAmount: sale.paidAmount !== undefined ? sale.paidAmount : sale.totalAmount,
      date: new Date(sale.date).toISOString().slice(0, 16) // For datetime-local input
    });
  };

  const saveEdit = () => {
    if (!editingSale) return;
    
    updateSale(editingSale.id, {
      customerName: editForm.customerName,
      paidAmount: Number(editForm.paidAmount),
      date: new Date(editForm.date).toISOString()
    });
    
    setEditingSale(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Sales & POS</h1>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'pos' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('pos')}
          >
            New Sale (POS)
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Sales History
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div className={styles.posLayout}>
          <div className={styles.productSection}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ marginBottom: '1rem' }}
            />
            <div className={styles.productGrid}>
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className={styles.productCard}
                  onClick={() => addToCart(product)}
                >
                  <div className={styles.productName}>{product.name}</div>
                  <div className={styles.productMeta}>
                    <span className={styles.price}>{product.sellingPrice.toFixed(2)} MAD</span>
                    <span className={styles.stock}>{product.stock} {product.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.cartSection}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h2>Current Sale</h2>
              
              <div className={styles.formGroup} style={{ margin: '1rem 0' }}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--color-text-secondary)'}}>
                  Buyer Name <span style={{color: 'var(--color-danger)'}}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter buyer's name"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if(error) setError('');
                  }}
                  className={`input-field ${error ? styles.inputError : ''}`}
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--color-text-secondary)'}}>
                  Amount Paid (Leave empty if full)
                </label>
                <input
                  type="number"
                  placeholder={`Total: ${cartTotal.toFixed(2)} MAD`}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="input-field"
                  min="0"
                  max={cartTotal}
                />
                {paidAmount !== '' && Number(paidAmount) < cartTotal && (
                  <p style={{color: 'var(--color-danger)', fontSize: '0.9rem', marginTop: '4px'}}>
                    Remaining Debt: {(cartTotal - Number(paidAmount)).toFixed(2)} MAD
                  </p>
                )}
                {error && <p className={styles.errorMessage}>{error}</p>}
              </div>
              
              <div className={styles.cartItems}>
                {cart.length === 0 ? (
                  <div className={styles.emptyCart}>
                    <p>Cart is empty</p>
                    <small>Select products from the left</small>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.productId} className={styles.cartItem}>
                      <div className={styles.cartItemInfo}>
                        <div className={styles.cartItemName}>{item.productName}</div>
                        <div className={styles.cartItemPrice}>{item.price.toFixed(2)} MAD / {item.unit}</div>
                      </div>
                      <div className={styles.cartItemControls}>
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) {
                              updateQuantity(item.productId, val);
                            }
                          }}
                          className={styles.quantityInput}
                        />
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                      </div>
                      <div className={styles.cartItemTotal}>
                        { (item.price * item.quantity).toFixed(2) } MAD
                      </div>
                      <button onClick={() => removeFromCart(item.productId)} className={styles.removeBtn}>×</button>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.cartFooter}>
                <div className={styles.cartTotalRow}>
                  <span>Total</span>
                  <span>{cartTotal.toFixed(2)} MAD</span>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '1rem' }}
                  disabled={cart.length === 0}
                  onClick={handleCheckout}
                >
                  Complete Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0 }}>Sales History</h2>
            <select
              value={historyFilterProduct}
              onChange={(e) => setHistoryFilterProduct(e.target.value)}
              className="input-field"
              style={{ maxWidth: '300px' }}
            >
              <option value="">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {sales.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              No sales history found.
            </p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Buyer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice().reverse().filter(sale => {
                  if (!historyFilterProduct) return true;
                  return sale.items.some(item => item.productId === historyFilterProduct);
                }).map((sale) => {
                  const paid = sale.paidAmount !== undefined ? sale.paidAmount : sale.totalAmount;
                  const debt = sale.totalAmount - paid;
                  const status = sale.paymentStatus || (debt > 0 ? 'Partial' : 'Paid');

                  return (
                    <tr key={sale.id}>
                      <td>{new Date(sale.date).toLocaleDateString()} <small style={{color: 'var(--color-text-secondary)'}}>{new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small></td>
                      <td style={{fontWeight: '600', color: 'var(--color-text-dark)'}}>{sale.customerName}</td>
                      <td>
                        <ul className={styles.itemList}>
                          {sale.items.map((item, idx) => (
                            <li key={idx}>
                              {item.productName} ({item.quantity} {item.unit || ''})
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>{sale.totalAmount.toFixed(2)} MAD</td>
                      <td>{paid.toFixed(2)} MAD</td>
                      <td>
                        <span className={`${styles.statusBadge} ${status === 'Paid' ? styles.statusPaid : styles.statusDebt}`}>
                          {status} {debt > 0 && `(-${debt.toFixed(2)} MAD)`}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          {debt > 0 && (
                            <button 
                              onClick={() => handleSettleDebt(sale)}
                              className={styles.settleBtn}
                              title="Settle Debt"
                            >
                              $
                            </button>
                          )}
                          <button 
                            onClick={() => startEdit(sale)}
                            className={styles.editBtn}
                            title="Edit Sale"
                          >
                            ✎
                          </button>
                          <button 
                            onClick={() => handleDelete(sale)}
                            className={styles.deleteBtn}
                            title="Delete Sale"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {editingSale && (
        <div className={styles.modalOverlay}>
          <div className="card" style={{ width: '400px' }}>
            <h2>Edit Sale</h2>
            <div className={styles.formGroup}>
              <label>Buyer Name</label>
              <input 
                type="text" 
                className="input-field"
                value={editForm.customerName}
                onChange={e => setEditForm({...editForm, customerName: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Date</label>
              <input 
                type="datetime-local" 
                className="input-field"
                value={editForm.date}
                onChange={e => setEditForm({...editForm, date: e.target.value})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Amount Paid (Total: {editingSale.totalAmount.toFixed(2)} MAD)</label>
              <input 
                type="number" 
                className="input-field"
                value={editForm.paidAmount}
                onChange={e => setEditForm({...editForm, paidAmount: e.target.value})}
                max={editingSale.totalAmount}
              />
            </div>
            <div className={styles.modalActions}>
              <button className="btn" onClick={() => setEditingSale(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
