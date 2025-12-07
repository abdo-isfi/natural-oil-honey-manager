import React, { createContext, useState, useEffect, useContext } from 'react';
import { ApiService } from '../services/apiService';
import { StorageService } from '../services/localStorageService'; // Keep for migration

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalSalesToday: 0,
    totalProfitToday: 0,
    totalRevenueAllTime: 0,
    totalProfitAllTime: 0,
    totalOutstandingDebt: 0,
    lowStockProducts: [],
    bestSellers: [],
    topCustomers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [productsData, salesData, purchasesData, statsData] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getSales(),
        ApiService.getPurchases(),
        ApiService.getDashboardStats()
      ]);
      
      setProducts(productsData);
      setSales(salesData);
      setPurchases(purchasesData);
      setDashboardStats(statsData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data from server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addProduct = async (product) => {
    try {
      await ApiService.saveProduct(product);
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to add product');
    }
  };

  const updateProduct = async (product) => {
    try {
      await ApiService.saveProduct(product);
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to update product');
    }
  };

  const deleteProduct = async (id) => {
    try {
      await ApiService.deleteProduct(id);
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    }
  };

  const addSale = async (sale) => {
    try {
      await ApiService.addSale(sale);
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to add sale');
    }
  };

  const addPurchase = async (purchase) => {
    try {
      await ApiService.addPurchase(purchase);
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to add purchase');
    }
  };

  const settleDebt = async (saleId, amount) => {
    try {
      await ApiService.settleDebt(saleId, amount);
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to settle debt');
    }
  };

  const updateSale = async (saleId, updates) => {
    try {
      await ApiService.updateSale(saleId, updates);
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to update sale');
    }
  };

  const deleteSale = async (saleId) => {
    try {
      await ApiService.deleteSale(saleId);
      refreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete sale');
    }
  };

  const clearAllData = () => {
    // Not implemented for API yet, or maybe dangerous
    alert('Clear all data not supported in API mode yet');
  };
  
  const migrateLocalData = async () => {
    if (window.confirm('This will upload your local data to the server. Continue?')) {
      try {
        setLoading(true);
        const localProducts = StorageService.getProducts();
        const localSales = StorageService.getSales();
        const localPurchases = StorageService.getPurchases();
        
        await ApiService.migrateData(localProducts, localSales, localPurchases);
        
        // Clear local storage after successful migration? Maybe optional.
        // StorageService.clearAllData(); 
        
        await refreshData();
        alert('Migration successful!');
      } catch (err) {
        console.error(err);
        alert('Migration failed. Check console.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <DataContext.Provider value={{
      products,
      sales,
      purchases,
      dashboardStats,
      loading,
      error,
      addProduct,
      updateProduct,
      deleteProduct,
      addSale,
      addPurchase,
      settleDebt,
      updateSale,
      deleteSale,
      clearAllData,
      refreshData,
      migrateLocalData
    }}>
      {children}
    </DataContext.Provider>
  );
};
