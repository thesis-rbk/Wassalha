'use client';
import api from '../../lib/api';
import React, { useEffect, useState } from 'react';
import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import { GoodsPost } from '../../types/GoodsPost';


const ListOfGoodsPosts: React.FC = () => {
  const [goodsPosts, setGoodsPosts] = useState<GoodsPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<GoodsPost[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentCount, setCurrentCount] = useState(5);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Function to show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const filterAndSortPosts = (posts: GoodsPost[]) => {
    return posts
      .filter((post) => {
        const searchMatch = searchTerm.toLowerCase() === '' || 
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (post.traveler?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (post.traveler?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

        const categoryMatch = categoryFilter === "ALL" || post.category?.name === categoryFilter;
        const locationMatch = locationFilter === "ALL" || post.airportLocation === locationFilter;

        return searchMatch && categoryMatch && locationMatch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.arrivalDate).getTime();
        const dateB = new Date(b.arrivalDate).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  };

  useEffect(() => {
    fetchGoodsPosts();
  }, []);

  useEffect(() => {
    const filtered = filterAndSortPosts(goodsPosts);
    setDisplayedPosts(filtered.slice(0, currentCount));
    setIsShowingAll(filtered.length <= currentCount);
  }, [goodsPosts, searchTerm, categoryFilter, locationFilter, sortOrder, currentCount]);

  const fetchGoodsPosts = async () => {
    try {
      const response = await api.get('/api/goods-posts');
      setGoodsPosts(response.data.data);
    } catch (error) {
      console.error('Error fetching goods posts:', error);
      showNotification('Failed to fetch goods posts', 'error');
    }
  };

  const handleSeeMore = () => {
    if (isShowingAll) {
      setCurrentCount(5);
    } else {
      setCurrentCount(prev => prev + 5);
    }
  };

  const handleDelete = (postId: number) => {
    setPostToDelete(postId);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await api.delete(`/api/goods-posts/${postToDelete}`);
      setGoodsPosts(goodsPosts.filter(post => post.id !== postToDelete));
      setShowConfirmation(false);
      showNotification('Goods post deleted successfully', 'success');
    } catch (error) {
      console.error("Error deleting goods post:", error);
      showNotification('Failed to delete goods post', 'error');
    }
  };

  return (
    <div className={navStyles.layout}>
      <Nav />
      <div className={navStyles.mainContent}>
        <div className={tableStyles.container}>
          <h1>List of Goods Posts</h1>

          {/* Search and Filter Controls */}
          <div className={tableStyles.controls}>
            <div className={tableStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search by title or traveler name..."
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
                {/* Add unique categories dynamically */}
                {Array.from(new Set(goodsPosts.map(post => post.category?.name)))
                  .filter(Boolean)
                  .map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))
                }
              </select>

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className={tableStyles.filterSelect}
              >
                <option value="ALL">All Airports</option>
                {Array.from(new Set(goodsPosts.map(post => post.airportLocation)))
                  .filter(Boolean)
                  .map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))
                }
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

          {/* Custom Notification */}
          {notification.show && (
            <div className={`${tableStyles.notification} ${notification.type === 'success' ? tableStyles.notificationSuccess : tableStyles.notificationError}`}>
              {notification.message}
            </div>
          )}

          {showConfirmation && (
            <div className={tableStyles.confirmationDialog}>
              <p>Are you sure you want to delete this goods post?</p>
              <button onClick={confirmDelete}>Yes, Delete</button>
              <button onClick={() => setShowConfirmation(false)}>Cancel</button>
            </div>
          )}

          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th className={tableStyles.th}>ID</th>
                <th className={tableStyles.th}>Title</th>
                <th className={tableStyles.th}>Content</th>
                <th className={tableStyles.th}>Arrival Date</th>
                <th className={tableStyles.th}>Available Kg</th>
                <th className={tableStyles.th}>Phone Number</th>
                <th className={tableStyles.th}>Airport Location</th>
                <th className={tableStyles.th}>Traveler</th>
                <th className={tableStyles.th}>Category</th>
                <th className={tableStyles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedPosts.map((post) => (
                <tr key={post.id} className={tableStyles.tr}>
                  <td className={tableStyles.td}>{post.id}</td>
                  <td className={tableStyles.td}>{post.title}</td>
                  <td className={tableStyles.td}>{post.content}</td>
                  <td className={tableStyles.td}>{new Date(post.arrivalDate).toLocaleDateString()}</td>
                  <td className={tableStyles.td}>{post.availableKg}</td>
                  <td className={tableStyles.td}>{post.phoneNumber}</td>
                  <td className={tableStyles.td}>{post.airportLocation}</td>
                  <td className={tableStyles.td}>
                    {post.traveler?.profile ? 
                      `${post.traveler.profile.firstName || 'Unknown'} ${post.traveler.profile.lastName || ''}` : 
                      'Unknown Traveler'}
                  </td>
                  <td className={tableStyles.td}>{post.category?.name || 'N/A'}</td>
                  <td className={tableStyles.td}>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {goodsPosts.length > 5 && (
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

export default ListOfGoodsPosts;