'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import { Subscription, SubscriptionType } from '../../types/Subscription';
import api from '../../lib/api';

const ListOfSubscriptions: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [displayedSubscriptions, setDisplayedSubscriptions] = useState<Subscription[]>([]);
    const [currentCount, setCurrentCount] = useState(5);
    const [isShowingAll, setIsShowingAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [durationFilter, setDurationFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState<number | null>(null);
    const [availableCategories, setAvailableCategories] = useState<{id: number, name: string}[]>([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Function to show notification
    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };
    
    // Function to get duration category
    const getDurationCategory = (days: number): string => {
        if (days <= 30) return "Monthly";
        if (days <= 90) return "Quarterly";
        if (days <= 180) return "Semi-Annual";
        if (days <= 365) return "Annual";
        return "Multi-Year";
    };

    // Function to get duration range for filtering
    const isDurationInRange = (duration: number, filterValue: string): boolean => {
        switch (filterValue) {
            case "Monthly":
                return duration <= 30;
            case "Quarterly":
                return duration > 30 && duration <= 90;
            case "Semi-Annual":
                return duration > 90 && duration <= 180;
            case "Annual":
                return duration > 180 && duration <= 365;
            case "Multi-Year":
                return duration > 365;
            default:
                return true; // "ALL" case
        }
    };

    const filterAndSortSubscriptions = (subscriptions: Subscription[]) => {
        return subscriptions
            .filter((subscription) => {
                const searchMatch = searchTerm.toLowerCase() === '' || 
                    subscription.name.toLowerCase().includes(searchTerm.toLowerCase());

                const typeMatch = typeFilter === "ALL" || subscription.type === typeFilter;
                const durationMatch = durationFilter === "ALL" || 
                    isDurationInRange(subscription.duration, durationFilter);
                const categoryMatch = categoryFilter === "ALL" || 
                    (subscription.category && subscription.category.id.toString() === categoryFilter);
                const activeMatch = activeFilter === "ALL" || 
                    (activeFilter === "ACTIVE" && subscription.isActive) || 
                    (activeFilter === "INACTIVE" && !subscription.isActive);

                return searchMatch && typeMatch && durationMatch && categoryMatch && activeMatch;
            })
            .sort((a, b) => {
                return sortOrder === 'desc' ? b.id - a.id : a.id - b.id;
            });
    };

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const response = await api.get('/api/subscriptions');
                if (response.status === 200) {
                    const subscriptionsData = response.data.data;
                    
                    // Extract categories
                    const categories = subscriptionsData
                        .filter((sub: Subscription) => sub.category)
                        .map((sub: Subscription) => sub.category)
                        .filter((category: any, index: number, self: any[]) => 
                            index === self.findIndex((c) => c.id === category.id)
                        );
                    
                    setAvailableCategories(categories);
                    setSubscriptions(subscriptionsData);
                    
                    const filtered = filterAndSortSubscriptions(subscriptionsData);
                    setDisplayedSubscriptions(filtered.slice(0, 5));
                    setIsShowingAll(filtered.length <= 5);
                }
            } catch (err) {
                if (axios.isAxiosError(err) && err.response) {
                    setError(err.response.data.message || "An error occurred");
                    showNotification(err.response.data.message || "An error occurred", "error");
                } else if (err instanceof Error) {
                    setError(err.message);
                    showNotification(err.message, "error");
                } else {
                    setError("An unknown error occurred");
                    showNotification("An unknown error occurred", "error");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, []);

    // Update displayed subscriptions when filters or search term changes
    useEffect(() => {
        if (subscriptions.length > 0) {
            const filtered = filterAndSortSubscriptions(subscriptions);
            setDisplayedSubscriptions(filtered.slice(0, currentCount));
            setIsShowingAll(filtered.length <= currentCount);
        }
    }, [searchTerm, typeFilter, durationFilter, categoryFilter, activeFilter, sortOrder, currentCount, subscriptions]);

    const handleDelete = (subscriptionId: number) => {
        setSubscriptionToDelete(subscriptionId);
        setShowConfirmation(true);
    };

    const confirmDelete = async () => {
        if (!subscriptionToDelete) return;

        try {
            await api.delete(`/api/subscriptions/${subscriptionToDelete}`);
            
            // Update the subscriptions state
            const updatedSubscriptions = subscriptions.filter(subscription => subscription.id !== subscriptionToDelete);
            setSubscriptions(updatedSubscriptions);

            // Re-filter and sort the subscriptions
            const filtered = filterAndSortSubscriptions(updatedSubscriptions);
            setDisplayedSubscriptions(filtered.slice(0, currentCount));
            setIsShowingAll(filtered.length <= currentCount);

            setShowConfirmation(false);
            showNotification("Subscription deleted successfully", "success");
        } catch (error) {
            console.error("Error deleting subscription:", error);
            showNotification("Failed to delete subscription", "error");
        }
    };

    const handleSeeMore = () => {
        if (isShowingAll) {
            setDisplayedSubscriptions(subscriptions.slice(0, 5));
            setCurrentCount(5);
            setIsShowingAll(false);
        } else {
            const nextCount = currentCount + 5;
            const nextSubscriptions = filterAndSortSubscriptions(subscriptions).slice(0, nextCount);
            setDisplayedSubscriptions(nextSubscriptions);
            setCurrentCount(nextCount);
            setIsShowingAll(nextCount >= filterAndSortSubscriptions(subscriptions).length);
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
                    <h1>List of Subscriptions</h1>

                    {/* Custom Notification */}
                    {notification.show && (
                        <div className={`${tableStyles.notification} ${notification.type === 'success' ? tableStyles.notificationSuccess : tableStyles.notificationError}`}>
                            {notification.message}
                        </div>
                    )}

                    {showConfirmation && (
                        <div className={tableStyles.confirmationDialog}>
                            <p>Are you sure you want to delete this subscription?</p>
                            <button onClick={confirmDelete}>Yes, Delete</button>
                            <button onClick={() => setShowConfirmation(false)}>Cancel</button>
                        </div>
                    )}

                    <div className={tableStyles.controls} style={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        flexWrap: 'nowrap', 
                        gap: '16px', 
                        overflowX: 'hidden',
                        width: '100%',
                        margin: '15px 0',
                        padding: '0 10px'
                    }}>
                        <div style={{ 
                            flex: '1.8',
                            minWidth: '250px',
                            maxWidth: '450px',
                            marginRight: '24px'
                        }}>
                            <input
                                type="text"
                                placeholder="Search by subscription name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={tableStyles.searchInput}
                                style={{ width: '100%', padding: '9px 12px' }}
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className={tableStyles.filterSelect}
                            style={{ 
                                flex: '1',
                                minWidth: '120px',
                                padding: '8px 12px',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="ALL">All Types</option>
                            <option value={SubscriptionType.STREAMING}>Streaming</option>
                            <option value={SubscriptionType.SOFTWARE}>Software</option>
                            <option value={SubscriptionType.GAMING}>Gaming</option>
                            <option value={SubscriptionType.EDUCATION}>Education</option>
                            <option value={SubscriptionType.OTHER}>Other</option>
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className={tableStyles.filterSelect}
                            style={{ 
                                flex: '1',
                                minWidth: '130px',
                                padding: '8px 12px',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="ALL">All Categories</option>
                            {availableCategories.map((category) => (
                                <option key={category.id} value={category.id.toString()}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                            className={tableStyles.filterSelect}
                            style={{ 
                                flex: '1',
                                minWidth: '110px',
                                padding: '8px 12px',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>

                        <select
                            value={durationFilter}
                            onChange={(e) => setDurationFilter(e.target.value)}
                            className={tableStyles.filterSelect}
                            style={{ 
                                flex: '1',
                                minWidth: '140px',
                                padding: '8px 12px',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="ALL">All Durations</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Semi-Annual">Semi-Annual</option>
                            <option value="Annual">Annual</option>
                            <option value="Multi-Year">Multi-Year</option>
                        </select>

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                            className={tableStyles.filterSelect}
                            style={{ 
                                flex: '1',
                                minWidth: '130px',
                                padding: '8px 12px',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>

                    <div className={tableStyles.tableWrapper}>
                        <table className={tableStyles.table}>
                            <thead>
                                <tr>
                                    <th className={tableStyles.th}>ID</th>
                                    <th className={tableStyles.th}>Name</th>
                                    <th className={tableStyles.th}>Description</th>
                                    <th className={tableStyles.th}>Price</th>
                                    <th className={tableStyles.th}>Duration</th>
                                    <th className={tableStyles.th}>Type</th>
                                    <th className={tableStyles.th}>Category</th>
                                    <th className={tableStyles.th}>Status</th>
                                    <th className={tableStyles.th}>Users</th>
                                    <th className={tableStyles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedSubscriptions.map(subscription => (
                                    <tr key={subscription.id} className={tableStyles.tr}>
                                        <td className={tableStyles.td}>{subscription.id}</td>
                                        <td className={tableStyles.td}>{subscription.name}</td>
                                        <td className={tableStyles.td}>{subscription.description || 'N/A'}</td>
                                        <td className={tableStyles.td}>${subscription.price.toFixed(2)}</td>
                                        <td className={tableStyles.td}>
                                            {subscription.duration} days
                                            ({getDurationCategory(subscription.duration)})
                                        </td>
                                        <td className={tableStyles.td}>{subscription.type}</td>
                                        <td className={tableStyles.td}>
                                            {subscription.category?.name || 'N/A'}
                                        </td>
                                        <td className={tableStyles.td}>
                                            <span className={`${tableStyles.badge} ${subscription.isActive ? tableStyles.badgeCOMPLETED : tableStyles.badgeCANCELLED}`}>
                                                {subscription.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className={tableStyles.td}>
                                            {subscription.users?.length || 0}
                                        </td>
                                        <td className={tableStyles.td}>
                                            <button 
                                                onClick={() => handleDelete(subscription.id)}
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

                    {subscriptions.length > 5 && (
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

export default ListOfSubscriptions;
