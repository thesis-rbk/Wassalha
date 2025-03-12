"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router
import tableStyles from '../../styles/Table.module.css';
import api from "../../lib/api";
import navStyles from '../../styles/Nav.module.css'; // Import Nav styles
import Nav from "../../components/Nav";
import { User } from "../../types/User";

export default function ListOfUsers() {
  const router = useRouter(); // Initialize useRouter
  const [users, setUsers] = useState<User[]>([]); // State to hold user data
  const [error, setError] = useState<string | null>(null); // State to hold error messages
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]); // New state for displayed users
  const [currentCount, setCurrentCount] = useState(5); // Number of users to show initially
  const [isShowingAll, setIsShowingAll] = useState(false); // Add this state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          router.push('/AdminLogin');
          return;
        }

        const response = await api.get('/api/users?role=USER', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status !== 200) {
          if (response.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('userData');
            router.push('/AdminLogin');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = response.data;
        console.log("Fetched users:", data);
        setUsers(data.data);
        
        // Apply initial sorting (newest first)
        const sortedUsers = [...data.data].sort((a, b) => b.id - a.id);
        setDisplayedUsers(sortedUsers.slice(0, 5));
        setIsShowingAll(data.data.length <= 5);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users. Please try again later.");
      }
    };

    fetchUsers();
  }, [router]); // Add router to dependencies

  // Add effect to sync with dark mode preference
  useEffect(() => {
    // Check initial dark mode preference
    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkMode);

    // Listen for theme changes
    const handleThemeChange = () => {
      const darkMode = localStorage.getItem("darkMode") === "true";
      setIsDarkMode(darkMode);
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  // Search functionality
  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    const filteredUsers = users.filter((user) => {
      const searchLower = searchValue.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.profile?.firstName?.toLowerCase().includes(searchLower) ||
        user.profile?.lastName?.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    });

    // Apply current sorting to filtered results
    const sortedFilteredUsers = sortUsers(filteredUsers, sortOrder);
    setDisplayedUsers(sortedFilteredUsers.slice(0, currentCount));
    setIsShowingAll(sortedFilteredUsers.length <= currentCount);
  };

  // Sorting functionality
  const sortUsers = (usersToSort: User[], order: 'asc' | 'desc') => {
    return [...usersToSort].sort((a, b) => {
      return order === 'desc' ? b.id - a.id : a.id - b.id;
    });
  };

  const handleSort = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    const sortedUsers = sortUsers(
      searchTerm ? displayedUsers : users,
      newOrder
    );
    setDisplayedUsers(sortedUsers.slice(0, currentCount));
  };

  const handleViewProfile = (userId: number) => {
    try {
      router.push(`/Profile?id=${userId}`);
    } catch (error) {
      console.error("Navigation error:", error);
      setError("Failed to navigate to profile page.");
    }
  };

  // Modified handleSeeMore to maintain search and sort
  const handleSeeMore = () => {
    if (isShowingAll) {
      setCurrentCount(5);
      const filteredUsers = users.filter((user) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.profile?.firstName?.toLowerCase().includes(searchLower) ||
          user.profile?.lastName?.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      });
      const sortedUsers = sortUsers(filteredUsers, sortOrder);
      setDisplayedUsers(sortedUsers.slice(0, 5));
      setIsShowingAll(false);
    } else {
      const nextCount = currentCount + 5;
      const filteredUsers = users.filter((user) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.profile?.firstName?.toLowerCase().includes(searchLower) ||
          user.profile?.lastName?.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      });
      const sortedUsers = sortUsers(filteredUsers, sortOrder);
      setDisplayedUsers(sortedUsers.slice(0, nextCount));
      setCurrentCount(nextCount);
      setIsShowingAll(nextCount >= filteredUsers.length);
    }
  };

  const handleVerifyProfile = async (userId: number) => {
    try {
      const response = await api.put(`/api/users/${userId}/verify-profile`);
      if (response.data.success) {
        setUsers(users.map(user => 
          user.id === userId ? { 
            ...user, 
            profile: { 
              ...user.profile, 
              isVerified: true,
              firstName: user.profile?.firstName || '',
              lastName: user.profile?.lastName || '',
              bio: user.profile?.bio || '',
              country: user.profile?.country || '',
              phoneNumber: user.profile?.phoneNumber || '',
              image: user.profile?.image || { url: '' },
              gender: user.profile?.gender || '',
              isBanned: user.profile?.isBanned || false
            } 
          } : user
        ));
        setDisplayedUsers(displayedUsers.map(user => 
          user.id === userId ? { 
            ...user, 
            profile: { 
              ...user.profile, 
              isVerified: true,
              firstName: user.profile?.firstName || '',
              lastName: user.profile?.lastName || '',
              bio: user.profile?.bio || '',
              country: user.profile?.country || '',
              phoneNumber: user.profile?.phoneNumber || '',
              image: user.profile?.image || { url: '' },
              gender: user.profile?.gender || '',
              isBanned: user.profile?.isBanned || false
            } 
          } : user
        ));
        alert('User profile verified successfully');
      }
    } catch (error) {
      console.error("Error verifying user profile:", error);
      alert('Failed to verify user profile');
    }
  };

  return (
    <div className={`${navStyles.layout} ${isDarkMode ? navStyles.darkMode : ''}`}>
      <Nav />
      <div className={`${navStyles.mainContent} ${isDarkMode ? navStyles.darkMode : ''}`}>
        <div className={`${tableStyles.container} ${isDarkMode ? tableStyles.darkMode : ''}`}>
          <h1 className={`${tableStyles.title} ${isDarkMode ? tableStyles.darkMode : ''}`}>List of Users</h1>
          
          {/* Search Controls */}
          <div className={tableStyles.controls}>
            <div className={tableStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={`${tableStyles.searchInput} ${isDarkMode ? tableStyles.darkMode : ''}`}
              />
            </div>
            <div className={tableStyles.filterContainer}>
              <select
                value={sortOrder}
                onChange={(e) => handleSort()}
                className={`${tableStyles.filterSelect} ${isDarkMode ? tableStyles.darkMode : ''}`}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          {error && <p className={tableStyles.error}>{error}</p>}
          
          <div className={`${tableStyles.tableWrapper} ${isDarkMode ? tableStyles.darkMode : ''}`}>
            <table className={`${tableStyles.table} ${isDarkMode ? tableStyles.darkMode : ''}`}>
              <thead>
                <tr>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>ID</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Image</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Name</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Email</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Phone Number</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Country</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Gender</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Verified</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((user) => (
                  <tr key={user.id} className={`${tableStyles.tr} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{user.id}</td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                      {user.profile?.image?.url ? (
                        <img
                          src={user.profile.image.url}
                          alt="Profile"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover"
                          }}
                        />
                      ) : (
                        <span>No Image</span>
                      )}
                    </td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{user.name}</td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{user.email}</td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{user.profile?.phoneNumber || 'N/A'}</td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{user.profile?.country || 'N/A'}</td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{user.profile?.gender || 'N/A'}</td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                      <span className={`${tableStyles.badge} ${user.profile?.isVerified ? tableStyles.badgeCompleted : tableStyles.badgePending}`}>
                        {user.profile?.isVerified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                      <button
                        onClick={() => handleViewProfile(user.id)}
                        className={`${tableStyles.actionButton} ${tableStyles.editButton} ${isDarkMode ? tableStyles.darkMode : ''}`}
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => !user.profile?.isVerified && handleVerifyProfile(user.id)}
                        className={`${tableStyles.actionButton} ${user.profile?.isVerified ? tableStyles.verifiedButton : tableStyles.verifyButton}`}
                        disabled={user.profile?.isVerified}
                      >
                        {user.profile?.isVerified ? 'Verified' : 'Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length > 5 && (
              <div className={tableStyles.seeMoreContainer}>
                <button 
                  className={`${tableStyles.seeMoreButton} ${isDarkMode ? tableStyles.darkMode : ''}`}
                  onClick={handleSeeMore}
                >
                  {isShowingAll ? 'See Less' : 'See More'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 