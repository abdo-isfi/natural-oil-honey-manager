import React, { createContext, useState, useEffect, useContext } from 'react';
import { StorageService } from '../services/localStorageService';

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

  const refreshData = () => {
    setProducts(StorageService.getProducts());
    setSales(StorageService.getSales());
    setPurchases(StorageService.getPurchases());
    setDashboardStats(StorageService.getDashboardStats());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addProduct = (product) => {
    StorageService.saveProduct(product);
    refreshData();
  };

  const updateProduct = (product) => {
    StorageService.saveProduct(product);
    refreshData();
  };

  const deleteProduct = (id) => {
    StorageService.deleteProduct(id);
    refreshData();
  };

  const addSale = (sale) => {
    StorageService.addSale(sale);
    refreshData();
  };

  const addPurchase = (purchase) => {
    StorageService.addPurchase(purchase);
    refreshData();
  };

  const settleDebt = (saleId, amount) => {
    StorageService.settleDebt(saleId, amount);
    refreshData();
  };

  const updateSale = (saleId, updates) => {
    StorageService.updateSale(saleId, updates);
    refreshData();
  };

  const deleteSale = (saleId) => {
    StorageService.deleteSale(saleId);
    refreshData();
  };

  const clearAllData = () => {
    StorageService.clearAllData();
    refreshData();
  };

  return (
    <DataContext.Provider value={{
      products,
      sales,
      purchases,
      dashboardStats,
      addProduct,
      updateProduct,
      deleteProduct,
      addSale,
      addPurchase,
      settleDebt,
      updateSale,
      deleteSale,
      clearAllData,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};
