'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import { Subscription } from '../../types/Subscription';

const ListOfSubscriptions: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [displayedSubscriptions, setDisplayedSubscriptions] = useState<Subscription[]>([]);
    const [currentCount, setCurrentCount] = useState(5);
    const [isShowingAll, setIsShowingAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [durationFilter, setDurationFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState<number | null>(null);
    const [availableTypes, setAvailableTypes] = useState<string[]>([]);
    const [availableDurations, setAvailableDurations] = useState<number[]>([]);

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

                return searchMatch && typeMatch && durationMatch;
            })
            .sort((a, b) => {
                return sortOrder === 'desc' ? b.id - a.id : a.id - b.id;
            });
    };

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions`);
                if (response.data.success) {
                    const subscriptionsData = response.data.data;
                    
                    // Extract unique types and durations
                    const types = [...new Set(subscriptionsData.map((sub: Subscription) => sub.type))];
                    const durations = [...new Set(subscriptionsData.map((sub: Subscription) => sub.duration))];
                    
                    setAvailableTypes(types as string[]);
                    setAvailableDurations(durations as number[]);
                    
                    const filtered = filterAndSortSubscriptions(subscriptionsData);
                    setSubscriptions(subscriptionsData);
                    setDisplayedSubscriptions(filtered.slice(0, 5));
                    setIsShowingAll(filtered.length <= 5);
                }
            } catch (error) {
                console.error('Error fetching subscriptions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, [searchTerm, typeFilter, durationFilter, sortOrder]);

    const handleDelete = (subscriptionId: number) => {
        setSubscriptionToDelete(subscriptionId);
        setShowConfirmation(true);
    };

    const confirmDelete = async () => {
        if (!subscriptionToDelete) return;

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/${subscriptionToDelete}`);
            setSubscriptions(subscriptions.filter(subscription => subscription.id !== subscriptionToDelete));
            setShowConfirmation(false);
            alert('Subscription deleted successfully');
        } catch (error) {
            console.error("Error deleting subscription:", error);
            alert('Failed to delete subscription');
        }
    };

    const handleSeeMore = () => {
        if (isShowingAll) {
            setDisplayedSubscriptions(subscriptions.slice(0, 5));
            setCurrentCount(5);
            setIsShowingAll(false);
        } else {
            const nextCount = currentCount + 5;
            const nextSubscriptions = subscriptions.slice(0, nextCount);
            setDisplayedSubscriptions(nextSubscriptions);
            setCurrentCount(nextCount);
            setIsShowingAll(nextCount >= subscriptions.length);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={navStyles.layout}>
            <Nav />
            <div className={navStyles.mainContent}>
                <div className={tableStyles.container}>
                    <h1>List of Subscriptions</h1>

                    {showConfirmation && (
                        <div className={tableStyles.confirmationDialog}>
                            <p>Are you sure you want to delete this subscription?</p>
                            <button onClick={confirmDelete}>Yes, Delete</button>
                            <button onClick={() => setShowConfirmation(false)}>Cancel</button>
                        </div>
                    )}

                    <div className={tableStyles.controls}>
                        <div className={tableStyles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Search by subscription name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={tableStyles.searchInput}
                            />
                        </div>
                        <div className={tableStyles.filterContainer}>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className={tableStyles.filterSelect}
                            >
                                <option value="ALL">All Types</option>
                                {availableTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={durationFilter}
                                onChange={(e) => setDurationFilter(e.target.value)}
                                className={tableStyles.filterSelect}
                            >
                                <option value="ALL">All Durations</option>
                                <option value="Monthly">Monthly (≤ 30 days)</option>
                                <option value="Quarterly">Quarterly (31-90 days)</option>
                                <option value="Semi-Annual">Semi-Annual (91-180 days)</option>
                                <option value="Annual">Annual (181-365 days)</option>
                                <option value="Multi-Year">Multi-Year (&gt; 365 days)</option>
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
                                <th className={tableStyles.th}>Description</th>
                                <th className={tableStyles.th}>Price</th>
                                <th className={tableStyles.th}>Duration</th>
                                <th className={tableStyles.th}>Type</th>
                                <th className={tableStyles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedSubscriptions.map(subscription => (
                                <tr key={subscription.id} className={tableStyles.tr}>
                                    <td className={tableStyles.td}>{subscription.id}</td>
                                    <td className={tableStyles.td}>{subscription.name}</td>
                                    <td className={tableStyles.td}>{subscription.description}</td>
                                    <td className={tableStyles.td}>{subscription.price}</td>
                                    <td className={tableStyles.td}>
                                        {subscription.duration} days
                                        ({getDurationCategory(subscription.duration)})
                                    </td>
                                    <td className={tableStyles.td}>{subscription.type}</td>
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
