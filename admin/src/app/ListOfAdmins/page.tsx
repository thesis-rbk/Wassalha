"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router
import tableStyles from '../../styles/Table.module.css';
import api from "../../lib/api";
import navStyles from '../../styles/Nav.module.css'; // Import Nav styles
import Nav from "../../components/Nav";
import { User, UserRole } from "../../types/User"; // Update import to include UserRole

export default function ListOfAdmins() {
  const router = useRouter(); // Initialize useRouter
  const [admins, setAdmins] = useState<User[]>([]); // State to hold admin data
  const [error, setError] = useState<string | null>(null); // State to hold error messages
  const [displayedAdmins, setDisplayedAdmins] = useState<User[]>([]); // New state for displayed admins
  const [currentCount, setCurrentCount] = useState(5); // Number of admins to show initially
  const [isShowingAll, setIsShowingAll] = useState(false); // Add this state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'SUPER_ADMIN'>('ALL'); // Add role filter
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error'>('success');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<number | null>(null);
  const [adminToUpgrade, setAdminToUpgrade] = useState<number | null>(null);
  const [showUpgradeConfirmation, setShowUpgradeConfirmation] = useState(false);
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          router.push('/AdminLogin');
          return;
        }

        const response = await api.get('/api/admin/admins', {
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
        console.log("Fetched admins:", data);
        setAdmins(data.data);
        
        // Apply initial sorting (newest first)
        const sortedAdmins = [...data.data].sort((a, b) => b.id - a.id);
        setDisplayedAdmins(sortedAdmins.slice(0, 5));
        setIsShowingAll(data.data.length <= 5);
      } catch (error: any) {
        console.error("Error fetching admins:", error);
        setError("Failed to fetch admins. Please try again later.");
        if (error.response?.status === 401) {
          router.push('/AdminLogin');
        }
      }
    };

    fetchAdmins();
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

  // Filter and search functionality
  const filterAndSearchAdmins = () => {
    let filtered = [...admins];

    // Apply role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(admin => admin.role === roleFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(admin => 
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.profile?.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.profile?.phoneNumber?.includes(searchTerm)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.id - b.id;
      }
      return b.id - a.id;
    });

    return filtered;
  };

  // Update displayed admins when filters change
  useEffect(() => {
    const filtered = filterAndSearchAdmins();
    setDisplayedAdmins(filtered.slice(0, currentCount));
    setIsShowingAll(filtered.length <= currentCount);
  }, [searchTerm, roleFilter, sortOrder, currentCount, admins]);

  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    setCurrentCount(5); // Reset pagination when searching
  };

  const handleRoleFilter = (role: 'ALL' | 'ADMIN' | 'SUPER_ADMIN') => {
    setRoleFilter(role);
    setCurrentCount(5); // Reset pagination when changing role filter
  };

  const handleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleSeeMore = () => {
    if (isShowingAll) {
      setCurrentCount(5);
      const filtered = filterAndSearchAdmins();
      setDisplayedAdmins(filtered.slice(0, 5));
      setIsShowingAll(false);
    } else {
      const filtered = filterAndSearchAdmins();
      setDisplayedAdmins(filtered);
      setIsShowingAll(true);
    }
  };

  const handleViewProfile = (userId: number) => {
    try {
      router.push(`/Profile?id=${userId}`);
    } catch (error) {
      console.error("Navigation error:", error);
      setError("Failed to navigate to profile page.");
    }
  };

  const handleRemoveAdmin = (adminId: number) => {
    setAdminToRemove(adminId);
    setShowConfirmation(true);
  };

  const confirmRemove = async () => {
    if (!adminToRemove) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/AdminLogin');
        return;
      }

      const response = await api.put(`/api/admin/admins/${adminToRemove}/remove`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setAdmins(prev => prev.filter(admin => admin.id !== adminToRemove));
        setDisplayedAdmins(prev => prev.filter(admin => admin.id !== adminToRemove));
        setPopupType('success');
        setPopupMessage('Admin successfully removed and converted to regular user');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      }
    } catch (error: any) {
      setPopupType('error');
      if (error.response) {
        switch (error.response.status) {
          case 403:
            setPopupMessage("Only Super Admins can remove admins");
            break;
          case 404:
            setPopupMessage("Admin not found");
            break;
          case 401:
            localStorage.removeItem('adminToken');
            router.push('/AdminLogin');
            break;
          default:
            setPopupMessage(error.response.data?.message || "Failed to remove admin");
        }
      } else {
        setPopupMessage("Network error. Please check your connection.");
      }
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setShowConfirmation(false);
      setAdminToRemove(null);
    }
  };

  const handleUpgradeRole = (adminId: number) => {
    setAdminToUpgrade(adminId);
    setShowUpgradeConfirmation(true);
  };

  const confirmUpgrade = async () => {
    if (!adminToUpgrade) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.put(
        `/api/admin/admins/${adminToUpgrade}/role`,
        { newRole: 'SUPER_ADMIN' },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        const updatedAdmins = admins.map(admin => 
          admin.id === adminToUpgrade ? { ...admin, role: 'SUPER_ADMIN' as UserRole } : admin
        );
        setAdmins(updatedAdmins);
        setDisplayedAdmins(prevDisplayed => 
          prevDisplayed.map(admin => 
            admin.id === adminToUpgrade ? { ...admin, role: 'SUPER_ADMIN' as UserRole } : admin
          )
        );
        setPopupType('success');
        setPopupMessage('Admin role upgraded successfully');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      }
    } catch (error: any) {
      setPopupType('error');
      if (error.response?.status === 403) {
        setPopupMessage("Only Super Admins can upgrade roles");
      } else {
        setPopupMessage("Failed to upgrade role. Please try again later.");
      }
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setShowUpgradeConfirmation(false);
      setAdminToUpgrade(null);
    }
  };

  const handlePromoteToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.put('/api/admin/promote-to-admin', 
        { email: emailInput },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        // Add the new admin to the list
        const newAdmin = response.data.data;
        setAdmins(prev => [...prev, newAdmin]);
        setDisplayedAdmins(prev => [...prev, newAdmin].sort((a, b) => b.id - a.id));
        
        // Show success message
        setPopupType('success');
        setPopupMessage('User successfully promoted to Admin');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
        
        // Reset form
        setEmailInput("");
        setShowAddAdminForm(false);
      }
    } catch (error: any) {
      setPopupType('error');
      setPopupMessage(error.response?.data?.message || 'Failed to promote user to Admin');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailInput(value);

    if (value.length > 0) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.get('/api/users?role=USER', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          const users = response.data.data;
          const filteredUsers = users.filter((user: User) => 
            user.email.toLowerCase().includes(value.toLowerCase()) &&
            user.profile?.isVerified 
          );
          setEmailSuggestions(filteredUsers);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching user suggestions:', error);
      }
    } else {
      setEmailSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectEmail = (email: string) => {
    setEmailInput(email);
    setShowSuggestions(false);
  };

  return (
    <div className={`${navStyles.layout} ${isDarkMode ? navStyles.darkMode : ''}`}>
      {showPopup && (
        <div className={`${tableStyles.popup} ${tableStyles[popupType]}`}>
          {popupMessage}
        </div>
      )}

      {showConfirmation && (
        <div className={tableStyles.confirmationDialog}>
          <p>Are you sure you want to remove this admin? They will become a regular user.</p>
          <div className={tableStyles.confirmationButtons}>
            <button 
              onClick={confirmRemove}
              className={`${tableStyles.actionButton} ${tableStyles.dangerButton}`}
            >
              Yes, Remove
            </button>
            <button 
              onClick={() => setShowConfirmation(false)}
              className={tableStyles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showUpgradeConfirmation && (
        <div className={tableStyles.confirmationDialog}>
          <p>Are you sure you want to upgrade this admin to Super Admin?</p>
          <div className={tableStyles.confirmationButtons}>
            <button 
              onClick={confirmUpgrade}
              className={`${tableStyles.actionButton} ${tableStyles.successButton}`}
            >
              Yes, Upgrade
            </button>
            <button 
              onClick={() => setShowUpgradeConfirmation(false)}
              className={tableStyles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Nav />
      <div className={`${navStyles.mainContent} ${isDarkMode ? navStyles.darkMode : ''}`}>
        <div className={`${tableStyles.container} ${isDarkMode ? tableStyles.darkMode : ''}`}>
          <h1 className={`${tableStyles.title} ${isDarkMode ? tableStyles.darkMode : ''}`}>List of Admins</h1>
          
          <div >
            {!showAddAdminForm ? (
              <button 
                onClick={() => setShowAddAdminForm(true)}
                className={`${tableStyles.actionButton} ${tableStyles.primaryButton} ${tableStyles.fullWidth}`}
              >
                Add Admin
              </button>
            ) : (
              <div className={tableStyles.formContainer}>
                <h2 className={`${tableStyles.formTitle} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                  Add New Admin
                </h2>
                <form onSubmit={handlePromoteToAdmin} className={tableStyles.addAdminForm}>
                  <div className={tableStyles.formRow}>
                    <div className={tableStyles.inputGroup}>
                      <div className={tableStyles.emailInputContainer}>
                        <input
                          type="email"
                          value={emailInput}
                          onChange={handleEmailInputChange}
                          placeholder="Enter user email"
                          className={`${tableStyles.emailInput} ${isDarkMode ? tableStyles.darkMode : ''}`}
                          required
                        />
                        {showSuggestions && emailSuggestions.length > 0 && (
                          <div className={`${tableStyles.suggestionsList} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                            {emailSuggestions.map((user) => (
                              <div
                                key={user.id}
                                className={`${tableStyles.suggestionItem} ${isDarkMode ? tableStyles.darkMode : ''}`}
                                onClick={() => handleSelectEmail(user.email)}
                              >
                                <div className={tableStyles.suggestionContent}>
                                  <span className={tableStyles.userEmail}>{user.email}</span>
                                  {user.profile && (
                                    <span className={tableStyles.userName}>
                                      {user.profile.firstName} {user.profile.lastName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={tableStyles.buttonGroup}>
                      <button
                        type="submit"
                        disabled={isSubmitting || !emailInput}
                        className={`${tableStyles.actionButton} ${tableStyles.primaryButton}`}
                      >
                        {isSubmitting ? 'Promoting...' : 'Promote to Admin'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddAdminForm(false);
                          setEmailInput("");
                          setShowSuggestions(false);
                        }}
                        className={`${tableStyles.actionButton} ${tableStyles.dangerButton}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className={tableStyles.controls}>
            <div className={tableStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={`${tableStyles.searchInput} ${isDarkMode ? tableStyles.darkMode : ''}`}
              />
            </div>
            
            <div className={tableStyles.filterContainer}>
              <select
                value={roleFilter}
                onChange={(e) => handleRoleFilter(e.target.value as 'ALL' | 'ADMIN' | 'SUPER_ADMIN')}
                className={`${tableStyles.filterSelect} ${isDarkMode ? tableStyles.darkMode : ''}`}
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>

              <select
                value={sortOrder}
                onChange={handleSort}
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
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Profile</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Name</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Email</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Phone</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Role</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Gender</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Country</th>
                  <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedAdmins.map((admin) => (
                  <tr key={admin.id} className={`${tableStyles.tr} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                      {admin.id}
                    </td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                      {admin.profile?.image ? (
                        <img
                          src={admin.profile.image.url}
                          alt={`${admin.profile.firstName}'s profile`}
                          className={tableStyles.profileImage}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className={tableStyles.profilePlaceholder}
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            backgroundColor: '#e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {admin.profile?.firstName?.[0] || admin.email[0].toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                      {admin.profile ? 
                        `${admin.profile.firstName} ${admin.profile.lastName}` : 
                        'N/A'}
                    </td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                      {admin.email}
                    </td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                      {admin.profile?.phoneNumber || 'N/A'}
                    </td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                      <span className={`${tableStyles.badge} ${
                        admin.role === 'SUPER_ADMIN' ? tableStyles.badgeCompleted : tableStyles.badgePending
                      }`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                      {admin.profile?.gender || 'N/A'}
                    </td>
                    <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                      {admin.profile?.country || 'N/A'}
                    </td>
                    <td className={`${tableStyles.td} ${tableStyles.actionColumn} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                      <div className={tableStyles.actionButtons}>
                        <button
                          onClick={() => handleViewProfile(admin.id)}
                          className={`${tableStyles.actionButton} ${tableStyles.primaryButton}`}
                        >
                          View Profile
                        </button>
                        {admin.role !== 'SUPER_ADMIN' && (
                          <>
                            <button
                              onClick={() => handleUpgradeRole(admin.id)}
                              className={`${tableStyles.actionButton} ${tableStyles.successButton}`}
                            >
                              Upgrade Role
                            </button>
                            <button
                              onClick={() => handleRemoveAdmin(admin.id)}
                              className={`${tableStyles.actionButton} ${tableStyles.dangerButton}`}
                            >
                              Remove Admin
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {admins.length > 5 && (
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