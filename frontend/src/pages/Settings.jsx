import React from 'react';
import { useData } from '../context/DataContext';
import styles from './Settings.module.css';

const Settings = () => {
  const { clearAllData, migrateLocalData } = useData();

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
          Manage your application data here.
        </p>

        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
          <h3>Migration</h3>
          <p>Migrate data from Local Storage to Database.</p>
          <button onClick={migrateLocalData} className="btn btn-primary">
            Sync Local Data to DB
          </button>
        </div>
        
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
