'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from "../components/Nav";
import navStyles from '../styles/Nav.module.css';
import tableStyles from '../styles/Table.module.css';
import { PromoPost } from '../types/PromoPost';

const ListOfPromoPosts: React.FC = () => {
  const [promoPosts, setPromoPosts] = useState<PromoPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<PromoPost[]>([]);
  const [currentCount, setCurrentCount] = useState(5);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [publisherFilter, setPublisherFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filterAndSortPosts = (posts: PromoPost[]) => {
    return posts
      .filter((post) => {
        const searchMatch = searchTerm.toLowerCase() === '' || 
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase());

        const categoryMatch = categoryFilter === "ALL" || post.category?.name === categoryFilter;
        const publisherMatch = publisherFilter === "ALL" || 
          `${post.publisher.profile.firstName} ${post.publisher.profile.lastName}` === publisherFilter;

        return searchMatch && categoryMatch && publisherMatch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  };

  useEffect(() => {
    const fetchPromoPosts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/promo-posts`);
        const data = response.data.data;
        setPromoPosts(data);
        const filtered = filterAndSortPosts(data);
        setDisplayedPosts(filtered.slice(0, 5));
        setIsShowingAll(filtered.length <= 5);
      } catch (error) {
        console.error('Error fetching promo posts:', error);
      }
    };

    fetchPromoPosts();
  }, []);

  useEffect(() => {
    const filtered = filterAndSortPosts(promoPosts);
    setDisplayedPosts(filtered.slice(0, currentCount));
    setIsShowingAll(filtered.length <= currentCount);
  }, [promoPosts, searchTerm, categoryFilter, publisherFilter, sortOrder, currentCount]);

  const handleSeeMore = () => {
    if (isShowingAll) {
      setDisplayedPosts(promoPosts.slice(0, 5));
      setCurrentCount(5);
      setIsShowingAll(false);
    } else {
      const nextCount = currentCount + 5;
      const nextPosts = promoPosts.slice(0, nextCount);
      setDisplayedPosts(nextPosts);
      setCurrentCount(nextCount);
      setIsShowingAll(nextCount >= promoPosts.length);
    }
  };

  const handleDelete = (postId: number) => {
    setPostToDelete(postId);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/promo-posts/${postToDelete}`);
      setPromoPosts(promoPosts.filter(post => post.id !== postToDelete));
      setShowConfirmation(false);
      alert('Promo post deleted successfully');
    } catch (error) {
      console.error("Error deleting promo post:", error);
      alert('Failed to delete promo post');
    }
  };

  return (
    <div className={navStyles.layout}>
      <Nav />
      <div className={navStyles.mainContent}>
        <div className={tableStyles.container}>
          <h1>List of Promo Posts</h1>

          {/* Search and Filter Controls */}
          <div className={tableStyles.controls}>
            <div className={tableStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search by title or content..."
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
                {Array.from(new Set(promoPosts.map(post => post.category?.name)))
                  .filter(Boolean)
                  .map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))
                }
              </select>

              <select
                value={publisherFilter}
                onChange={(e) => setPublisherFilter(e.target.value)}
                className={tableStyles.filterSelect}
              >
                <option value="ALL">All Publishers</option>
                {Array.from(new Set(promoPosts.map(post => 
                  `${post.publisher.profile.firstName} ${post.publisher.profile.lastName}`
                )))
                  .map(publisher => (
                    <option key={publisher} value={publisher}>{publisher}</option>
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

          {showConfirmation && (
            <div className={tableStyles.confirmationDialog}>
              <p>Are you sure you want to delete this promo post?</p>
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
                <th className={tableStyles.th}>Publisher</th>
                <th className={tableStyles.th}>Category</th>
                <th className={tableStyles.th}>Created At</th>
                <th className={tableStyles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedPosts.map((post) => (
                <tr key={post.id} className={tableStyles.tr}>
                  <td className={tableStyles.td}>{post.id}</td>
                  <td className={tableStyles.td}>{post.title}</td>
                  <td className={tableStyles.td}>{post.content}</td>
                  <td className={tableStyles.td}>
                    {`${post.publisher.profile.firstName} ${post.publisher.profile.lastName}`}
                  </td>
                  <td className={tableStyles.td}>{post.category?.name || 'N/A'}</td>
                  <td className={tableStyles.td}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
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

          {promoPosts.length > 5 && (
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

export default ListOfPromoPosts;
