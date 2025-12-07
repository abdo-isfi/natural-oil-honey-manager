const API_URL = 'http://localhost:5000/api';

export const ApiService = {
  // --- Products ---
  getProducts: async () => {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  saveProduct: async (product) => {
    // If product has an ID that looks like a Mongo ID (24 chars hex), it's an update
    // Otherwise it's a create. 
    // Note: LocalStorage used Date.now() IDs. We need to handle this transition.
    // For now, let's assume if it has an _id, it's an update.
    
    if (product._id) {
      const response = await fetch(`${API_URL}/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    } else {
      // Remove temporary ID if present
      const { id, ...productData } = product;
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    }
  },

  deleteProduct: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
  },

  // --- Sales ---
  getSales: async () => {
    const response = await fetch(`${API_URL}/sales`);
    if (!response.ok) throw new Error('Failed to fetch sales');
    return response.json();
  },

  addSale: async (sale) => {
    const response = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    });
    if (!response.ok) throw new Error('Failed to create sale');
    return response.json();
  },

  updateSale: async (id, updates) => {
    const response = await fetch(`${API_URL}/sales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update sale');
    return response.json();
  },

  deleteSale: async (id) => {
    const response = await fetch(`${API_URL}/sales/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete sale');
    return response.json();
  },

  settleDebt: async (id, amount) => {
    // We need to fetch the sale first to know current paidAmount, or handle it in backend.
    // Our backend updateSale handles paidAmount update logic.
    // But here we are adding to it.
    // Let's just send the new paidAmount.
    // Wait, the frontend logic was: newPaidAmount = current + amount.
    // We should probably do this calculation in the component or here.
    // Let's fetch the sale first.
    const saleResponse = await fetch(`${API_URL}/sales`); // Optimization: should have getSaleById
    const sales = await saleResponse.json();
    const sale = sales.find(s => s._id === id);
    
    if (!sale) throw new Error('Sale not found');
    
    const newPaidAmount = (sale.paidAmount || 0) + amount;
    
    return ApiService.updateSale(id, { paidAmount: newPaidAmount });
  },

  // --- Purchases ---
  getPurchases: async () => {
    const response = await fetch(`${API_URL}/purchases`);
    if (!response.ok) throw new Error('Failed to fetch purchases');
    return response.json();
  },

  addPurchase: async (purchase) => {
    const response = await fetch(`${API_URL}/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchase),
    });
    if (!response.ok) throw new Error('Failed to create purchase');
    return response.json();
  },

  // --- Dashboard ---
  getDashboardStats: async () => {
    const response = await fetch(`${API_URL}/dashboard`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  },
  
  // --- Migration Helper ---
  // This is a one-time helper to push local data to DB
  migrateData: async (products, sales, purchases) => {
    // 1. Migrate Products
    const productMap = {}; // Old ID -> New ID
    
    for (const p of products) {
      try {
        const { id, ...pData } = p;
        const res = await ApiService.saveProduct(pData); // Create new
        productMap[id] = res._id;
      } catch (e) {
        console.error('Failed to migrate product', p, e);
      }
    }
    
    // 2. Migrate Sales
    for (const s of sales) {
      try {
        const { id, items, ...sData } = s;
        // Map items to new product IDs
        const newItems = items.map(item => ({
          ...item,
          productId: productMap[item.productId]
        })).filter(item => item.productId); // Filter out items whose product failed to migrate
        
        if (newItems.length > 0) {
          await ApiService.addSale({ ...sData, items: newItems });
        }
      } catch (e) {
        console.error('Failed to migrate sale', s, e);
      }
    }
    
    // 3. Migrate Purchases
    for (const p of purchases) {
      try {
        const { id, items, ...pData } = p;
        const newItems = items.map(item => ({
          ...item,
          productId: productMap[item.productId]
        })).filter(item => item.productId);
        
        if (newItems.length > 0) {
          await ApiService.addPurchase({ ...pData, items: newItems });
        }
      } catch (e) {
        console.error('Failed to migrate purchase', p, e);
      }
    }
  }
};
