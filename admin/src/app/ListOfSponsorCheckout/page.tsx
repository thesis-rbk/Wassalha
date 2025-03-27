'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import api from '../../lib/api';
import { SponsorCheckout } from '@/types/SponsorCheckout';


const ListOfSponsorCheckout: React.FC = () => {
    const [checkouts, setCheckouts] = useState<SponsorCheckout[]>([]);
    const [displayedCheckouts, setDisplayedCheckouts] = useState<SponsorCheckout[]>([]);
    const [currentCount, setCurrentCount] = useState(5);
    const [isShowingAll, setIsShowingAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [platformFilter, setPlatformFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [checkoutToDelete, setCheckoutToDelete] = useState<number | null>(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
    const [uniquePlatforms, setUniquePlatforms] = useState<string[]>([]);

    // Function to show notification
    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    const filterAndSortCheckouts = (checkouts: SponsorCheckout[]) => {
        return checkouts
            .filter((checkout) => {
                const searchLower = searchTerm.toLowerCase();
                const searchMatch = searchTerm === '' || 
                    (checkout.sponsorship.title || '').toLowerCase().includes(searchLower) ||
                    checkout.sponsorship.platform.toLowerCase().includes(searchLower) ||
                    checkout.sponsorship.sponsor.name.toLowerCase().includes(searchLower) ||
                    checkout.sponsorship.category.name.toLowerCase().includes(searchLower) ||
                    checkout.sponsorship.sponsor.email.toLowerCase().includes(searchLower) ||
                    checkout.id.toString().includes(searchLower) ||
                    checkout.sponsorship.id.toString().includes(searchLower) ||
                    checkout.sponsorship.sponsor.id.toString().includes(searchLower);

                const statusMatch = statusFilter === "ALL" || checkout.status === statusFilter;
                const categoryMatch = categoryFilter === "ALL" || checkout.sponsorship.category.name === categoryFilter;
                const platformMatch = platformFilter === "ALL" || checkout.sponsorship.platform === platformFilter;

                return searchMatch && statusMatch && categoryMatch && platformMatch;
            })
            .sort((a, b) => {
                if (sortOrder === 'desc') {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
    };

    useEffect(() => {
        const fetchCheckouts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get('/api/sponsor-checkouts');
                
                if (response.status === 200 && response.data.success) {
                    const checkoutsData = response.data.data;
                    setCheckouts(checkoutsData);
                    
                    // Extract unique categories and platforms with proper typing
                    const categories = [...new Set(checkoutsData.map((checkout: SponsorCheckout) => 
                        checkout.sponsorship.category.name
                    ))] as string[];
                    const platforms = [...new Set(checkoutsData.map((checkout: SponsorCheckout) => 
                        checkout.sponsorship.platform
                    ))] as string[];
                    
                    setUniqueCategories(categories);
                    setUniquePlatforms(platforms);
                    
                    const filtered = filterAndSortCheckouts(checkoutsData);
                    setDisplayedCheckouts(filtered.slice(0, 5));
                    setIsShowingAll(filtered.length <= 5);
                } else {
                    throw new Error('Failed to fetch checkouts');
                }
            } catch (err) {
                console.error('Error fetching checkouts:', err);
                if (axios.isAxiosError(err)) {
                    const errorMessage = err.response?.data?.message || err.message || "Failed to fetch checkouts";
                    setError(errorMessage);
                    showNotification(errorMessage, "error");
                } else {
                    setError("An unexpected error occurred");
                    showNotification("An unexpected error occurred", "error");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCheckouts();
    }, []);

    useEffect(() => {
        if (checkouts.length > 0) {
            const filtered = filterAndSortCheckouts(checkouts);
            setDisplayedCheckouts(filtered.slice(0, currentCount));
            setIsShowingAll(filtered.length <= currentCount);
        }
    }, [searchTerm, statusFilter, categoryFilter, platformFilter, sortOrder, currentCount, checkouts]);

    const handleDelete = (checkoutId: number) => {
        setCheckoutToDelete(checkoutId);
        setShowConfirmation(true);
    };

    const confirmDelete = async () => {
        if (!checkoutToDelete) return;

        try {
            const response = await api.delete(`/api/sponsor-checkouts/${checkoutToDelete}`);
            
            if (response.status === 200 && response.data.success) {
                const updatedCheckouts = checkouts.filter(checkout => checkout.id !== checkoutToDelete);
                setCheckouts(updatedCheckouts);

                const filtered = filterAndSortCheckouts(updatedCheckouts);
                setDisplayedCheckouts(filtered.slice(0, currentCount));
                setIsShowingAll(filtered.length <= currentCount);

                setShowConfirmation(false);
                showNotification("Sponsor checkout deleted successfully", "success");
            } else {
                throw new Error(response.data.message || 'Failed to delete checkout');
            }
        } catch (error) {
            console.error("Error deleting sponsor checkout:", error);
            if (axios.isAxiosError(error)) {
                showNotification(error.response?.data?.message || "Failed to delete checkout", "error");
            } else {
                showNotification("Failed to delete checkout", "error");
            }
        }
    };

    const handleUpdateStatus = async (checkoutId: number, newStatus: string) => {
        // This function is no longer needed
    };

    const handleSeeMore = () => {
        if (isShowingAll) {
            setDisplayedCheckouts(checkouts.slice(0, 5));
            setCurrentCount(5);
            setIsShowingAll(false);
        } else {
            const nextCount = currentCount + 5;
            const nextCheckouts = filterAndSortCheckouts(checkouts).slice(0, nextCount);
            setDisplayedCheckouts(nextCheckouts);
            setCurrentCount(nextCount);
            setIsShowingAll(nextCount >= filterAndSortCheckouts(checkouts).length);
        }
    };

    if (loading) return (
        <div className={navStyles.layout}>
            <Nav />
            <div className={navStyles.mainContent} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div>Loading...</div>
            </div>
        </div>
    );
    
    if (error) return (
        <div className={navStyles.layout}>
            <Nav />
            <div className={navStyles.mainContent} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div>Error: {error}</div>
            </div>
        </div>
    );

    return (
        <div className={navStyles.layout}>
            <Nav />
            <div className={navStyles.mainContent}>
                <div className={tableStyles.container}>
                    <h1>List of Sponsor Checkouts</h1>

                    {notification.show && (
                        <div className={`${tableStyles.notification} ${notification.type === 'success' ? tableStyles.notificationSuccess : tableStyles.notificationError}`}>
                            {notification.message}
                        </div>
                    )}

                    {showConfirmation && (
                        <div className={tableStyles.confirmationDialog}>
                            <p>Are you sure you want to delete this checkout?</p>
                            <button onClick={confirmDelete}>Yes, Delete</button>
                            <button onClick={() => setShowConfirmation(false)}>Cancel</button>
                        </div>
                    )}

                    <div className={tableStyles.controls} style={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        gap: '16px',
                        margin: '15px 0',
                        padding: '0 10px'
                    }}>
                        <div style={{ flex: '1.8', minWidth: '250px', maxWidth: '450px', marginRight: '24px' }}>
                            <input
                                type="text"
                                placeholder="Search by ID, title, sponsor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={tableStyles.searchInput}
                                style={{ width: '100%', padding: '9px 12px' }}
                            />
                        </div>

                        <select
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value)}
                            className={tableStyles.filterSelect}
                            style={{ flex: '1', minWidth: '120px', padding: '8px 12px' }}
                        >
                            <option value="ALL">All Platforms</option>
                            {uniquePlatforms.map(platform => (
                                <option key={platform} value={platform}>{platform}</option>
                            ))}
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className={tableStyles.filterSelect}
                            style={{ flex: '1', minWidth: '120px', padding: '8px 12px' }}
                        >
                            <option value="ALL">All Categories</option>
                            {uniqueCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={tableStyles.filterSelect}
                            style={{ flex: '1', minWidth: '120px', padding: '8px 12px' }}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="FAILED">Failed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="REFUND">Refund</option>
                        </select>

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                            className={tableStyles.filterSelect}
                            style={{ flex: '1', minWidth: '120px', padding: '8px 12px' }}
                        >
                            <option value="desc">Latest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>

                    <div className={tableStyles.tableWrapper}>
                        <table className={tableStyles.table}>
                            <thead>
                                <tr>
                                    <th className={tableStyles.th}>Checkout ID</th>
                                    <th className={tableStyles.th}>Sponsorship ID</th>
                                    <th className={tableStyles.th}>Title</th>
                                    <th className={tableStyles.th}>Platform</th>
                                    <th className={tableStyles.th}>Category</th>
                                    <th className={tableStyles.th}>Sponsor ID</th>
                                    <th className={tableStyles.th}>Sponsor Info</th>
                                    <th className={tableStyles.th}>Amount</th>
                                    <th className={tableStyles.th}>Status</th>
                                    <th className={tableStyles.th}>Created At</th>
                                    <th className={tableStyles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedCheckouts.map(checkout => (
                                    <tr key={checkout.id} className={tableStyles.tr}>
                                        <td className={tableStyles.td}>{checkout.id}</td>
                                        <td className={tableStyles.td}>{checkout.sponsorship.id}</td>
                                        <td className={tableStyles.td}>
                                            {checkout.sponsorship.title || `${checkout.sponsorship.platform} Sponsorship`}
                                        </td>
                                        <td className={tableStyles.td}>{checkout.sponsorship.platform}</td>
                                        <td className={tableStyles.td}>{checkout.sponsorship.category.name}</td>
                                        <td className={tableStyles.td}>{checkout.sponsorship.sponsor.id}</td>
                                        <td className={tableStyles.td}>
                                            <div>{checkout.sponsorship.sponsor.name}</div>
                                            <div style={{ fontSize: '0.85em', color: '#666' }}>{checkout.sponsorship.sponsor.email}</div>
                                        </td>
                                        <td className={tableStyles.td}>${checkout.amount.toFixed(2)}</td>
                                        <td className={tableStyles.td}>
                                            <span className={`${tableStyles.statusBadge} ${tableStyles[`status${checkout.status}`]}`}>
                                                {checkout.status}
                                            </span>
                                        </td>
                                        <td className={tableStyles.td}>
                                            <div>{new Date(checkout.createdAt).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.85em', color: '#666' }}>
                                                {new Date(checkout.createdAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className={tableStyles.td}>
                                            <button 
                                                onClick={() => handleDelete(checkout.id)}
                                                className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {checkouts.length > 5 && (
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

export default ListOfSponsorCheckout;
