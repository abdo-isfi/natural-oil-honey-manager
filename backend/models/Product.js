const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  unit: { type: String, required: true },
  description: { type: String },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
