"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import { Pickup } from '../../types/Pickup';
import api from '../../lib/api';
const PickupList: React.FC = () => {
    const [pickups, setPickups] = useState<Pickup[]>([]);
    const [displayedPickups, setDisplayedPickups] = useState<Pickup[]>([]);
    const [currentCount, setCurrentCount] = useState(5);
    const [isShowingAll, setIsShowingAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [pickupTypeFilter, setPickupTypeFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pickupToDelete, setPickupToDelete] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [availablePickupTypes, setAvailablePickupTypes] = useState<string[]>([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Function to show notification
    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    const filterAndSortPickups = (pickups: Pickup[]) => {
        return pickups
            .filter((pickup) => {
                const searchMatch = searchTerm.toLowerCase() === '' || 
                    pickup.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pickup.orderId.toString().includes(searchTerm);

                const statusMatch = statusFilter === "ALL" || pickup.status === statusFilter;
                const typeMatch = pickupTypeFilter === "ALL" || pickup.pickupType === pickupTypeFilter;

                return searchMatch && statusMatch && typeMatch;
            })
            .sort((a, b) => {
                const dateA = new Date(a.scheduledTime || '').getTime();
                const dateB = new Date(b.scheduledTime || '').getTime();
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });
    };

    useEffect(() => {
        const fetchPickups = async () => {
            try {
                const response = await api.get('/api/pickup');
                if (response.status === 200) {
                    const pickupsData = response.data.data;
                    // Extract unique pickup types
                    const types = [...new Set(pickupsData.map((pickup: Pickup) => pickup.pickupType))];
                    setAvailablePickupTypes(types as string[]);
                    
                    const filtered = filterAndSortPickups(pickupsData);
                    setPickups(pickupsData);
                    setDisplayedPickups(filtered.slice(0, 5));
                    setIsShowingAll(filtered.length <= 5);
                } else {
                    setError("Failed to fetch pickups");
                    showNotification("Failed to fetch pickups", "error");
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

        fetchPickups();
    }, []);

    const handleDelete = (pickupId: number) => {
        setPickupToDelete(pickupId);
        setShowConfirmation(true);
    };

    const confirmDelete = async () => {
        if (!pickupToDelete) return;

        try {
            await api.delete(`/api/pickup/${pickupToDelete}`);
            
            // Update the pickups state
            const updatedPickups = pickups.filter(pickup => pickup.id !== pickupToDelete);
            setPickups(updatedPickups);

            // Re-filter and sort the pickups
            const filtered = filterAndSortPickups(updatedPickups);
            setDisplayedPickups(filtered.slice(0, currentCount));
            setIsShowingAll(filtered.length <= currentCount);

            setShowConfirmation(false);
            showNotification("Pickup deleted successfully", "success");
        } catch (error) {
            console.error("Error deleting pickup:", error);
            showNotification("Failed to delete pickup", "error");
        }
    };

    const handleSeeMore = () => {
        if (isShowingAll) {
            setDisplayedPickups(pickups.slice(0, 5));
            setCurrentCount(5);
            setIsShowingAll(false);
        } else {
            const nextCount = currentCount + 5;
            const nextPickups = pickups.slice(0, nextCount);
            setDisplayedPickups(nextPickups);
            setCurrentCount(nextCount);
            setIsShowingAll(nextCount >= pickups.length);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={navStyles.layout}>
            <Nav />
            <div className={navStyles.mainContent}>
                <div className={tableStyles.container}>
                    <h1>All Pickups</h1>
                    
                    {/* Custom Notification */}
                    {notification.show && (
                        <div className={`${tableStyles.notification} ${notification.type === 'success' ? tableStyles.notificationSuccess : tableStyles.notificationError}`}>
                            {notification.message}
                        </div>
                    )}
                    
                    {showConfirmation && (
                        <div className={tableStyles.confirmationDialog}>
                            <p>Are you sure you want to delete this pickup?</p>
                            <button onClick={confirmDelete}>Yes, Delete</button>
                            <button onClick={() => setShowConfirmation(false)}>Cancel</button>
                        </div>
                    )}
                    <div className={tableStyles.controls}>
                        <div className={tableStyles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Search by location or order ID..."
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
                                <option value="PENDING">Pending</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>

                            <select
                                value={pickupTypeFilter}
                                onChange={(e) => setPickupTypeFilter(e.target.value)}
                                className={tableStyles.filterSelect}
                            >
                                <option value="ALL">All Pickup Types</option>
                                {availablePickupTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
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
                                <th className={tableStyles.th}>Order ID</th>
                                <th className={tableStyles.th}>Pickup Type</th>
                                <th className={tableStyles.th}>Location</th>
                                <th className={tableStyles.th}>Address</th>
                                <th className={tableStyles.th}>Coordinates</th>
                                <th className={tableStyles.th}>Contact Phone Number</th>
                                <th className={tableStyles.th}>Status</th>
                                <th className={tableStyles.th}>Scheduled Time</th>
                                <th className={tableStyles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedPickups.map((pickup) => (
                                <tr key={pickup.id} className={tableStyles.tr}>
                                    <td className={tableStyles.td}>{pickup.id}</td>
                                    <td className={tableStyles.td}>{pickup.orderId}</td>
                                    <td className={tableStyles.td}>{pickup.pickupType}</td>
                                    <td className={tableStyles.td}>{pickup.location}</td>
                                    <td className={tableStyles.td}>{pickup.address}</td>
                                    <td className={tableStyles.td}>{pickup.coordinates}</td>
                                    <td className={tableStyles.td}>{pickup.contactPhoneNumber}</td>
                                    <td className={tableStyles.td}>
                                        <span className={`${tableStyles.badge} ${tableStyles[`badge${pickup.status}`]}`}>
                                            {pickup.status}
                                        </span>
                                    </td>
                                    <td className={tableStyles.td}>{pickup.scheduledTime}</td>
                                    <td className={tableStyles.td}>
                                        <button 
                                            onClick={() => handleDelete(pickup.id)}
                                            className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {pickups.length > 5 && (
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

export default PickupList;