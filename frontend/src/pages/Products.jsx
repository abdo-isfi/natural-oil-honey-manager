import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import ProductForm from '../components/ProductForm';
import styles from './Products.module.css';

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const handleFormSubmit = (data) => {
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...data });
    } else {
      addProduct({ ...data, id: Date.now().toString() });
    }
    setIsModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Inventory Management</h1>
        <button onClick={handleAddClick} className="btn btn-primary">
          + Add Product
        </button>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
            <h2 style={{ marginBottom: '1rem' }}>
              {editingProduct ? 'Edit Product' : 'New Product'}
            </h2>
            <ProductForm
              initialData={editingProduct}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="card">
        {products.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No products found. Add your first product!
          </p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Buy Price</th>
                <th>Sell Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id || product.id}>
                    <td style={{ fontWeight: '600' }}>{product.name}</td>
                    <td>
                      <span className={`${styles.badge} ${product.category === 'Honey' ? styles.badgeHoney : styles.badgeOil}`}>
                        {product.category}
                      </span>
                    </td>
                    <td>{product.stock}</td>
                    <td>{product.purchasePrice.toFixed(2)} MAD</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--color-gold-dark)' }}>
                      {product.sellingPrice.toFixed(2)} MAD
                    </td>
                    <td>
                      <span style={{ 
                        color: product.stock < 5 ? 'var(--color-danger)' : 'inherit',
                        fontWeight: product.stock < 5 ? 'bold' : 'normal'
                      }}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button 
                          onClick={() => handleEditClick(product)}
                          className={styles.actionBtn}
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(product._id || product.id)}
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Products;
