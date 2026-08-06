import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

export default function CategoryDrawer({ isOpen, onClose, onCategoryAdded }) {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/blog-categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      setLoading(true);
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/blog-categories`, { name: newCategory }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories([data, ...categories]);
      setNewCategory('');
      alert('Category added successfully');
      if (onCategoryAdded) onCategoryAdded(data);
    } catch (error) {
      console.error(error);
      alert('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/blog-categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(categories.filter(c => c.id !== id));
      alert('Category deleted');
    } catch (error) {
      console.error(error);
      alert('Failed to delete category');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-96 max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 translate-x-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Travel Categories</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New Category Name..."
              className="flex-1 p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Add
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center justify-between p-3 bg-white border rounded shadow-sm">
                <span>{category.name}</span>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
            {categories.length === 0 && (
              <div className="text-center text-gray-500 mt-10">No categories found.</div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
