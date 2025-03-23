'use client';

import React, { useEffect, useState } from 'react';

import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import { Good } from '../../types/Good';
import api from '../../lib/api';
const ListOfGoods: React.FC = () => {
  const [goods, setGoods] = useState<Good[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [goodToDelete, setGoodToDelete] = useState<number | null>(null);
  const [displayedGoods, setDisplayedGoods] = useState<Good[]>([]);
  const [currentCount, setCurrentCount] = useState(5);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [categories, setCategories] = useState<{name: string}[]>([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Function to show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const filterAndSortGoods = (goods: Good[]) => {
    return goods
      .filter((good) => {
        const searchMatch = searchTerm.toLowerCase() === '' || 
          good.name.toLowerCase().includes(searchTerm.toLowerCase());

        const categoryMatch = categoryFilter === "ALL" || good.category.name === categoryFilter;
        const verificationMatch = verificationFilter === "ALL" || 
          (verificationFilter === "VERIFIED" ? good.isVerified : !good.isVerified);

        return searchMatch && categoryMatch && verificationMatch;
      })
      .sort((a, b) => {
        return sortOrder === 'desc' ? b.id - a.id : a.id - b.id;
      });
  };

  useEffect(() => {
    const fetchGoods = async () => {
      try {
        const response = await api.get('/api/goods');
        const data = response.data.data;
        setGoods(data);
        const filtered = filterAndSortGoods(data);
        setDisplayedGoods(filtered.slice(0, currentCount));
        setIsShowingAll(filtered.length <= currentCount);
      } catch (error) {
        console.error('Error fetching goods:', error);
        showNotification('Failed to fetch goods', 'error');
      }
    };

    fetchGoods();
  }, [currentCount, searchTerm, categoryFilter, verificationFilter, sortOrder]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        const data = response.data.data;
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        showNotification('Failed to fetch categories', 'error');
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = (goodId: number) => {
    setGoodToDelete(goodId);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!goodToDelete) return;

    try {
      await api.delete(`/api/goods/${goodToDelete}`);
      
      // Update the goods state
      const updatedGoods = goods.filter(good => good.id !== goodToDelete);
      setGoods(updatedGoods);

      // Re-filter and sort the goods
      const filtered = filterAndSortGoods(updatedGoods);
      setDisplayedGoods(filtered.slice(0, currentCount));
      setIsShowingAll(filtered.length <= currentCount);

      setShowConfirmation(false);
      showNotification('Good deleted successfully', 'success');
    } catch (error) {
      console.error("Error deleting good:", error);
      showNotification('Failed to delete good', 'error');
    }
  };

  const handleSeeMore = () => {
    if (isShowingAll) {
      setDisplayedGoods(goods.slice(0, 5));
      setCurrentCount(5);
      setIsShowingAll(false);
    } else {
      const nextCount = currentCount + 5;
      const nextGoods = goods.slice(0, nextCount);
      setDisplayedGoods(nextGoods);
      setCurrentCount(nextCount);
      setIsShowingAll(nextCount >= goods.length);
    }
  };

  const handleVerify = async (goodId: number) => {
    try {
      const response = await api.put(`/api/goods/${goodId}/verify`);
      if (response.data.success) {
        setGoods(goods.map(good => 
          good.id === goodId ? { ...good, isVerified: true } : good
        ));
        setDisplayedGoods(displayedGoods.map(good => 
          good.id === goodId ? { ...good, isVerified: true } : good
        ));
        showNotification('Good verified successfully', 'success');
      }
    } catch (error) {
      console.error("Error verifying good:", error);
      showNotification('Failed to verify good', 'error');
    }
  };

  return (
    <div className={navStyles.layout}>
      <Nav />
      <div className={navStyles.mainContent}>
        <div className={tableStyles.container}>
          <h1>List of Goods</h1>

          {/* Custom Notification */}
          {notification.show && (
            <div className={`${tableStyles.notification} ${notification.type === 'success' ? tableStyles.notificationSuccess : tableStyles.notificationError}`}>
              {notification.message}
            </div>
          )}
          
          {showConfirmation && (
            <div className={tableStyles.confirmationDialog}>
              <p>Are you sure you want to delete this good?</p>
              <button onClick={confirmDelete}>Yes, Delete</button>
              <button onClick={() => setShowConfirmation(false)}>Cancel</button>
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className={tableStyles.controls}>
            <div className={tableStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search by good name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={tableStyles.searchInput}
              />
            </div>
            <div className={tableStyles.filterContainer}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={tableStyles.filterSelect}
              >
                <option value="ALL">All Categories</option>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className={tableStyles.filterSelect}
              >
                <option value="ALL">All Verification</option>
                <option value="VERIFIED">Verified</option>
                <option value="UNVERIFIED">Unverified</option>
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

          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th className={tableStyles.th}>ID</th>
                <th className={tableStyles.th}>Name</th>
                <th className={tableStyles.th}>Image</th>
                <th className={tableStyles.th}>Size</th>
                <th className={tableStyles.th}>Weight</th>
                <th className={tableStyles.th}>Price</th>
                <th className={tableStyles.th}>Description</th>
                <th className={tableStyles.th}>Category</th>
                <th className={tableStyles.th}>Verified</th>
                <th className={tableStyles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedGoods.map((good) => (
                <tr key={good.id} className={tableStyles.tr}>
                  <td className={tableStyles.td}>{good.id}</td>
                  <td className={tableStyles.td}>{good.name}</td>
                  <td className={tableStyles.td}>
                    {good.image ? (
                      <img 
                        src={good.image.url} 
                        alt={good.name} 
                        className={tableStyles.goodImage}
                      />
                    ) : 'No image'}
                  </td>
                  <td className={tableStyles.td}>{good.size}</td>
                  <td className={tableStyles.td}>{good.weight}</td>
                  <td className={tableStyles.td}>{good.price}</td>
                  <td className={tableStyles.td}>{good.description}</td>
                  <td className={tableStyles.td}>{good.category.name}</td>
                  <td className={tableStyles.td}>
                    <span className={`${tableStyles.badge} ${good.isVerified ? tableStyles.badgeCompleted : tableStyles.badgePending}`}>
                      {good.isVerified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className={tableStyles.td}>
                    <div className={tableStyles.buttonContainer}>
                      <button 
                        onClick={() => handleDelete(good.id)}
                        className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => !good.isVerified && handleVerify(good.id)}
                        className={`${tableStyles.actionButton} ${good.isVerified ? tableStyles.verifiedButton : tableStyles.verifyButton}`}
                        disabled={good.isVerified}
                      >
                        {good.isVerified ? 'Verified' : 'Verify'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {goods.length > 5 && (
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

export default ListOfGoods;
