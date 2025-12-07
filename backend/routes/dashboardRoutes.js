const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Public
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find({});
    const products = await Product.find({});
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Today's Stats
    const todaysSales = sales.filter(s => new Date(s.date) >= today);
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
    const lowStockProducts = products.filter(p => p.stock < 5);
    
    // Top Customers
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
    
    // Best Sellers
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
        const product = products.find(p => p._id.toString() === id);
        return product ? { ...product.toObject(), totalSold: qty } : null;
      })
      .filter(Boolean);

    res.json({
      totalSalesToday,
      totalProfitToday,
      totalRevenueAllTime,
      totalProfitAllTime,
      totalOutstandingDebt,
      lowStockProducts,
      bestSellers,
      topCustomers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
