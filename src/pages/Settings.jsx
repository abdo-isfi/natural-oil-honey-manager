import React from 'react';
import { useData } from '../context/DataContext';
import styles from './Settings.module.css';

const Settings = () => {
  const { clearAllData } = useData();

  const handleClearData = () => {
    if (window.confirm('⚠️ DANGER: This will delete ALL products, sales, and purchase history. This action cannot be undone. Are you sure?')) {
      if (window.confirm('Are you absolutely sure? Last warning!')) {
        clearAllData();
        alert('All data has been cleared.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Settings</h1>
      </div>

      <div className="card">
        <h2>Data Management</h2>
        <p className={styles.description}>
          Manage your application data here. Be careful, these actions are irreversible.
        </p>
        
        <div className={styles.dangerZone}>
          <div className={styles.dangerHeader}>
            <h3>Danger Zone</h3>
          </div>
          <div className={styles.dangerContent}>
            <p>Clear all application data including products, sales history, and purchases.</p>
            <button onClick={handleClearData} className="btn btn-danger">
              Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
