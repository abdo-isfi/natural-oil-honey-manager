const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc    Get all sales
// @route   GET /api/sales
// @access  Public
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({}).sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a sale
// @route   POST /api/sales
// @access  Public
const createSale = async (req, res) => {
  try {
    const { items, paidAmount, totalAmount, customerName } = req.body;

    // Calculate total profit
    let totalProfit = 0;
    
    // Verify stock and calculate profit
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for: ${product.name}` });
      }
      
      // Calculate profit for this item
      const profitPerItem = item.price - product.purchasePrice;
      totalProfit += profitPerItem * item.quantity;

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Determine payment status
    let paymentStatus = 'Paid';
    if (paidAmount === 0) paymentStatus = 'Unpaid';
    else if (paidAmount < totalAmount) paymentStatus = 'Partial';

    const sale = new Sale({
      ...req.body,
      totalProfit,
      paymentStatus
    });

    const createdSale = await sale.save();
    res.status(201).json(createdSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a sale (e.g. settle debt)
// @route   PUT /api/sales/:id
// @access  Public
const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (sale) {
      // If updating paidAmount, recalculate status
      if (req.body.paidAmount !== undefined) {
        let status = 'Paid';
        if (req.body.paidAmount === 0) status = 'Unpaid';
        else if (req.body.paidAmount < sale.totalAmount) status = 'Partial';
        req.body.paymentStatus = status;
      }

      Object.assign(sale, req.body);
      const updatedSale = await sale.save();
      res.json(updatedSale);
    } else {
      res.status(404).json({ message: 'Sale not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a sale
// @route   DELETE /api/sales/:id
// @access  Public
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (sale) {
      // Restore stock
      for (const item of sale.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }

      await sale.deleteOne();
      res.json({ message: 'Sale removed' });
    } else {
      res.status(404).json({ message: 'Sale not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSales,
  createSale,
  updateSale,
  deleteSale,
};
