import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';
import Calculator from './Calculator';

const Sidebar = ({ onOpenCalculator }) => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>🍯 NOH Manager</h2>
      </div>
      <nav className={styles.nav}>
        <Link to="/" className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}>
          Dashboard
        </Link>
        <Link to="/products" className={`${styles.navItem} ${isActive('/products') ? styles.active : ''}`}>
          Inventory
        </Link>
        <Link to="/sales" className={`${styles.navItem} ${isActive('/sales') ? styles.active : ''}`}>
          Sales (POS)
        </Link>
        <Link to="/settings" className={`${styles.navItem} ${isActive('/settings') ? styles.active : ''}`}>
          Settings
        </Link>
        
        <div className={styles.divider}></div>
        
        <button onClick={onOpenCalculator} className={styles.navItem} style={{width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left'}}>
          🧮 Calculator
        </button>
      </nav>
    </aside>
  );
};

const Layout = ({ children }) => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar onOpenCalculator={() => setIsCalculatorOpen(true)} />
      <main className={styles.mainContent}>
        {children}
      </main>
      {isCalculatorOpen && <Calculator onClose={() => setIsCalculatorOpen(false)} />}
    </div>
  );
};

export default Layout;
