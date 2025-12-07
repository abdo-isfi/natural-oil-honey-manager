const mongoose = require('mongoose');

const saleSchema = mongoose.Schema({
  customerName: { type: String },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true, default: 0 },
  paymentStatus: { type: String, enum: ['Paid', 'Partial', 'Unpaid'], default: 'Paid' },
  totalProfit: { type: Number, required: true },
  date: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Sale', saleSchema);
