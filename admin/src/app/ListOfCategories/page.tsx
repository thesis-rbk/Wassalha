'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from "../components/Nav";
import navStyles from '../styles/Nav.module.css';
import tableStyles from '../styles/Table.module.css';

// Define the type for a category
interface Category {
  id: number;
  name: string;
  description: string;
  isDisabled: boolean;
}

const ListOfCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories'); // Fetching categories
        setCategories(response.data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/categories/create', newCategory);
      setCategories([...categories, response.data.data]);
      setNewCategory({ name: '', description: '' });
      setError('');
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Failed to create category');
    }
  };

  const handleToggleDisable = async (id: number, currentState: boolean) => {
    try {
      await axios.put('http://localhost:5000/api/categories/disable', { id });
      setCategories(categories.map(category => 
        category.id === id 
          ? { ...category, isDisabled: !currentState }
          : category
      ));
    } catch (error) {
      console.error('Error toggling category:', error);
      setError('Failed to toggle category status');
    }
  };

  return (
    <div className={navStyles.layout}>
      <Nav />
      <div className={navStyles.mainContent}>
        <div className={tableStyles.container}>
          <h1 className={tableStyles.title}>List of Categories</h1>
          
          {/* Create Category Form */}
          <form onSubmit={handleCreateCategory} className={tableStyles.form}>
            <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Category Name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="border p-2 rounded flex-1"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Create Category
              </button>
            </div>
          </form>

          <div className={tableStyles.tableWrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th className={tableStyles.th}>ID</th>
                  <th className={tableStyles.th}>Name</th>
                  <th className={tableStyles.th}>Description</th>
                  <th className={tableStyles.th}>Status</th>
                  <th className={tableStyles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className={tableStyles.tr}>
                    <td className={tableStyles.td}>{category.id}</td>
                    <td className={tableStyles.td}>{category.name}</td>
                    <td className={tableStyles.td}>{category.description}</td>
                    <td className={tableStyles.td}>
                      {category.isDisabled ? 'Disabled' : 'Active'}
                    </td>
                    <td className={tableStyles.td}>
                      <button
                        onClick={() => handleToggleDisable(category.id, category.isDisabled)}
                        className={`px-3 py-1 rounded ${
                          category.isDisabled 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-red-500 hover:bg-red-600'
                        } text-white`}
                      >
                        {category.isDisabled ? 'Enable' : 'Disable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListOfCategories;
