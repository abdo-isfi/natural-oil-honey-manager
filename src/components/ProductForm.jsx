import React, { useState, useEffect } from 'react';
import styles from './ProductForm.module.css';

const ProductForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Honey',
    purchasePrice: '',
    sellingPrice: '',
    stock: '',
    unit: 'kg'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      purchasePrice: Number(formData.purchasePrice),
      sellingPrice: Number(formData.sellingPrice),
      stock: Number(formData.stock)
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label>Product Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="input-field"
          placeholder="e.g. Acacia Honey"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input-field"
          >
            <option value="Honey">Honey</option>
            <option value="Oil">Oil</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Unit</label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="input-field"
          >
            <option value="kg">kg</option>
            <option value="liter">Liter</option>
            <option value="jar">Jar</option>
            <option value="bottle">Bottle</option>
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label>Purchase Price</label>
          <input
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="input-field"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Selling Price</label>
          <input
            type="number"
            name="sellingPrice"
            value={formData.sellingPrice}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="input-field"
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Initial Stock</label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          required
          min="0"
          className="input-field"
        />
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className="btn">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
