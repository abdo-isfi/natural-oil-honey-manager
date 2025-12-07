
const KEYS = {
  PRODUCTS: 'noh_products',
  SALES: 'noh_sales',
  PURCHASES: 'noh_purchases',
};

export const StorageService = {
  // --- Generic Helpers ---
  getData: (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveData: (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // --- Products ---
  getProducts: () => StorageService.getData(KEYS.PRODUCTS),

  saveProduct: (product) => {
    const products = StorageService.getProducts();
    const existingIndex = products.findIndex((p) => p.id === product.id);
    
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }
    
    StorageService.saveData(KEYS.PRODUCTS, products);
    return products;
  },

  deleteProduct: (id) => {
    const products = StorageService.getProducts();
    const newProducts = products.filter((p) => p.id !== id);
    StorageService.saveData(KEYS.PRODUCTS, newProducts);
    return newProducts;
  },

  updateStock: (productId, quantityChange) => {
    const products = StorageService.getProducts();
    const product = products.find((p) => p.id === productId);
    
    if (product) {
      product.stock += quantityChange;
      StorageService.saveData(KEYS.PRODUCTS, products);
    }
    return products;
  },

  // --- Sales ---
  getSales: () => StorageService.getData(KEYS.SALES),

  addSale: (sale) => {
    const sales = StorageService.getSales();
    
    // Calculate status
    let status = 'Paid';
    if (sale.paidAmount === 0) status = 'Unpaid';
    else if (sale.paidAmount < sale.totalAmount) status = 'Partial';
    
    const newSale = { ...sale, paymentStatus: status };
    
    sales.push(newSale);
    StorageService.saveData(KEYS.SALES, sales);
    
    // Update stock for each item in the sale
    sale.items.forEach(item => {
      StorageService.updateStock(item.productId, -item.quantity);
    });
    
    return sales;
  },

  settleDebt: (saleId, amount) => {
    const sales = StorageService.getSales();
    const saleIndex = sales.findIndex(s => s.id === saleId);
    
    if (saleIndex >= 0) {
      const sale = sales[saleIndex];
      const newPaidAmount = (sale.paidAmount || 0) + amount;
      
      let newStatus = sale.paymentStatus;
      if (newPaidAmount >= sale.totalAmount) {
        newStatus = 'Paid';
      } else if (newPaidAmount > 0) {
        newStatus = 'Partial';
      }

      sales[saleIndex] = {
        ...sale,
        paidAmount: newPaidAmount,
        paymentStatus: newStatus
      };
      
      StorageService.saveData(KEYS.SALES, sales);
    }
    return sales;
  },

  updateSale: (saleId, updates) => {
    const sales = StorageService.getSales();
    const saleIndex = sales.findIndex(s => s.id === saleId);
    
    if (saleIndex >= 0) {
      const sale = sales[saleIndex];
      const updatedSale = { ...sale, ...updates };
      
      // Recalculate status if paidAmount changed
      if (updates.paidAmount !== undefined) {
        let status = 'Paid';
        if (updatedSale.paidAmount === 0) status = 'Unpaid';
        else if (updatedSale.paidAmount < updatedSale.totalAmount) status = 'Partial';
        updatedSale.paymentStatus = status;
      }

      sales[saleIndex] = updatedSale;
      StorageService.saveData(KEYS.SALES, sales);
    }
    return sales;
  },

  deleteSale: (saleId) => {
    const sales = StorageService.getSales();
    const sale = sales.find(s => s.id === saleId);
    
    if (sale) {
      // Restore stock
      sale.items.forEach(item => {
        StorageService.updateStock(item.productId, item.quantity);
      });
      
      const newSales = sales.filter(s => s.id !== saleId);
      StorageService.saveData(KEYS.SALES, newSales);
      return newSales;
    }
    return sales;
  },

  // --- Purchases ---
  getPurchases: () => StorageService.getData(KEYS.PURCHASES),

  addPurchase: (purchase) => {
    const purchases = StorageService.getPurchases();
    purchases.push(purchase);
    StorageService.saveData(KEYS.PURCHASES, purchases);

    // Update stock for each item in the purchase
    purchase.items.forEach(item => {
      StorageService.updateStock(item.productId, item.quantity);
    });

    return purchases;
  },
  
  // --- Management ---
  clearAllData: () => {
    localStorage.removeItem(KEYS.PRODUCTS);
    localStorage.removeItem(KEYS.SALES);
    localStorage.removeItem(KEYS.PURCHASES);
  },
  
  // --- Dashboard Stats ---
  getDashboardStats: () => {
    const sales = StorageService.getSales();
    const products = StorageService.getProducts();
    
    const today = new Date().toISOString().split('T')[0];
    
    // Today's Stats
    const todaysSales = sales.filter(s => s.date.startsWith(today));
    const totalSalesToday = todaysSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalProfitToday = todaysSales.reduce((sum, s) => sum + s.totalProfit, 0);
    
    // All-Time Stats
    const totalRevenueAllTime = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalProfitAllTime = sales.reduce((sum, s) => sum + s.totalProfit, 0);
    
    // Debt Stats
    const totalOutstandingDebt = sales.reduce((sum, s) => {
      const paid = s.paidAmount !== undefined ? s.paidAmount : s.totalAmount;
      return sum + (s.totalAmount - paid);
    }, 0);

    // Inventory Stats
    const lowStockProducts = products.filter(p => p.stock < 5); // Threshold 5
    
    // Top Customers Logic
    const customerSpending = {};
    sales.forEach(sale => {
      if (sale.customerName) {
        customerSpending[sale.customerName] = (customerSpending[sale.customerName] || 0) + sale.totalAmount;
      }
    });

    const topCustomers = Object.entries(customerSpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, totalSpent]) => ({ name, totalSpent }));
    
    // Best Sellers Logic (by quantity sold)
    const productSales = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
      });
    });
    
    const bestSellers = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, qty]) => {
        const product = products.find(p => p.id === id);
        return product ? { ...product, totalSold: qty } : null;
      })
      .filter(Boolean);

    return {
      totalSalesToday,
      totalProfitToday,
      totalRevenueAllTime,
      totalProfitAllTime,
      totalOutstandingDebt,
      lowStockProducts,
      bestSellers,
      topCustomers
    };
  }
};
