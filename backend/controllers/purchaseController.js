const Purchase = require('../models/Purchase');
const Product = require('../models/Product');

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Public
const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({}).sort({ date: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a purchase
// @route   POST /api/purchases
// @access  Public
const createPurchase = async (req, res) => {
  try {
    const { items, paidAmount, totalAmount, supplierName } = req.body;

    // Verify products exist and update stock (INCREASE for purchase)
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }
      
      // Update stock
      product.stock += item.quantity;
      // Optionally update purchase price if needed, but for now we just update stock
      // product.purchasePrice = item.price; 
      
      await product.save();
    }

    // Determine payment status
    let paymentStatus = 'Paid';
    if (paidAmount === 0) paymentStatus = 'Unpaid';
    else if (paidAmount < totalAmount) paymentStatus = 'Partial';

    const purchase = new Purchase({
      ...req.body,
      paymentStatus
    });

    const createdPurchase = await purchase.save();
    res.status(201).json(createdPurchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a purchase
// @route   PUT /api/purchases/:id
// @access  Public
const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (purchase) {
      // If updating paidAmount, recalculate status
      if (req.body.paidAmount !== undefined) {
        let status = 'Paid';
        if (req.body.paidAmount === 0) status = 'Unpaid';
        else if (req.body.paidAmount < purchase.totalAmount) status = 'Partial';
        req.body.paymentStatus = status;
      }

      Object.assign(purchase, req.body);
      const updatedPurchase = await purchase.save();
      res.json(updatedPurchase);
    } else {
      res.status(404).json({ message: 'Purchase not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a purchase
// @route   DELETE /api/purchases/:id
// @access  Public
const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (purchase) {
      // Restore stock (DECREASE for purchase deletion)
      for (const item of purchase.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      }

      await purchase.deleteOne();
      res.json({ message: 'Purchase removed' });
    } else {
      res.status(404).json({ message: 'Purchase not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
};
