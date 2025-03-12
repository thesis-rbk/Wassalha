'use client';

import React, { useEffect, useState } from 'react';
import api from '../../types/api';
import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import { Category } from '../../types/Category';


const ListOfCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [error, setError] = useState<string>('');
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>([]);
  const [currentCount, setCurrentCount] = useState(5);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const filterAndSortCategories = (categories: Category[]) => {
    return categories
      .filter((category) => {
        const searchMatch = searchTerm.toLowerCase() === '' || 
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description.toLowerCase().includes(searchTerm.toLowerCase());

        const statusMatch = statusFilter === "ALL" || 
          (statusFilter === "ACTIVE" ? !category.isDisabled : category.isDisabled);

        return searchMatch && statusMatch;
      })
      .sort((a, b) => {
        return sortOrder === 'desc' ? b.id - a.id : a.id - b.id;
      });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        const data = response.data.data;
        setCategories(data);
        const filtered = filterAndSortCategories(data);
        setDisplayedCategories(filtered.slice(0, 5));
        setIsShowingAll(filtered.length <= 5);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = filterAndSortCategories(categories);
    setDisplayedCategories(filtered.slice(0, currentCount));
    setIsShowingAll(filtered.length <= currentCount);
  }, [categories, searchTerm, statusFilter, sortOrder, currentCount]);

  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkMode);

    const handleThemeChange = () => {
      const darkMode = localStorage.getItem("darkMode") === "true";
      setIsDarkMode(darkMode);
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/categories/create', newCategory);
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
      await api.put('/api/categories/disable', { id });
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

  const handleSeeMore = () => {
    if (isShowingAll) {
      setDisplayedCategories(categories.slice(0, 5));
      setCurrentCount(5);
      setIsShowingAll(false);
    } else {
      const nextCount = currentCount + 5;
      const nextCategories = categories.slice(0, nextCount);
      setDisplayedCategories(nextCategories);
      setCurrentCount(nextCount);
      setIsShowingAll(nextCount >= categories.length);
    }
  };

  return (
    <div className={`${navStyles.layout} ${isDarkMode ? navStyles.darkMode : ''}`}>
      <Nav />
      <div className={`${navStyles.mainContent} ${isDarkMode ? navStyles.darkMode : ''}`}>
        <div className={`${tableStyles.container} ${isDarkMode ? tableStyles.darkMode : ''}`}>
          {/* Create Category Form */}
          <form onSubmit={handleCreateCategory} className={`${tableStyles.form} ${isDarkMode ? tableStyles.darkMode : ''}`}>
            <h2 className={`${tableStyles.formTitle} ${isDarkMode ? tableStyles.darkMode : ''}`}>Create New Category</h2>
            {error && <div className={tableStyles.formError}>{error}</div>}
            <div className={tableStyles.formRow}>
              <input
                type="text"
                placeholder="Category Name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className={`${tableStyles.formInput} ${isDarkMode ? tableStyles.darkMode : ''}`}
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className={`${tableStyles.formInput} ${isDarkMode ? tableStyles.darkMode : ''}`}
              />
              <button
                type="submit"
                className={`${tableStyles.formButton} ${isDarkMode ? tableStyles.darkMode : ''}`}
              >
                Create Category
              </button>
            </div>
          </form>

          <h1 className={tableStyles.title}>List of Categories</h1>
          
          {/* Search and Filter Controls */}
          <div className={tableStyles.controls}>
            <div className={tableStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={tableStyles.searchInput}
              />
            </div>
            <div className={tableStyles.filterContainer}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={tableStyles.filterSelect}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="DISABLED">Disabled</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                className={tableStyles.filterSelect}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          <table className={`${tableStyles.table} ${isDarkMode ? tableStyles.darkMode : ''}`}>
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
              {displayedCategories.map((category) => (
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
                      className={`${tableStyles.actionButton} ${
                        category.isDisabled 
                          ? tableStyles.enableButton 
                          : tableStyles.disableButton
                      }`}
                    >
                      {category.isDisabled ? 'Enable' : 'Disable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {categories.length > 5 && (
            <div className={tableStyles.seeMoreContainer}>
              <button 
                className={tableStyles.seeMoreButton}
                onClick={handleSeeMore}
              >
                {isShowingAll ? 'See Less' : 'See More'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListOfCategories;
