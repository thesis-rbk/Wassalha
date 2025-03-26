"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import { Pickup, PickupStatus, PickupType } from '../../types/Pickup';
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
    const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
    const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Add dark mode effect
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
                    (pickup.location?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
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

    // Update displayed pickups when filters or search term changes
    useEffect(() => {
        if (pickups.length > 0) {
            const filtered = filterAndSortPickups(pickups);
            setDisplayedPickups(filtered.slice(0, currentCount));
            setIsShowingAll(filtered.length <= currentCount);
        }
    }, [searchTerm, statusFilter, pickupTypeFilter, sortOrder, currentCount, pickups]);

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
            const nextPickups = filterAndSortPickups(pickups).slice(0, nextCount);
            setDisplayedPickups(nextPickups);
            setCurrentCount(nextCount);
            setIsShowingAll(nextCount >= filterAndSortPickups(pickups).length);
        }
    };

    const viewQrCode = (qrCode: string) => {
        setSelectedQrCode(qrCode);
        setQrCodeModalOpen(true);
    };

    const formatScheduledTime = (time?: string) => {
        if (!time) return 'Not scheduled';
        return new Date(time).toLocaleString();
    };

    if (loading) return (
        <div className={`${navStyles.layout} ${isDarkMode ? navStyles.darkMode : ''}`}>
            <Nav />
            <div className={`${navStyles.mainContent} ${isDarkMode ? navStyles.darkMode : ''}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div>Loading...</div>
            </div>
        </div>
    );
    
    if (error) return (
        <div className={`${navStyles.layout} ${isDarkMode ? navStyles.darkMode : ''}`}>
            <Nav />
            <div className={`${navStyles.mainContent} ${isDarkMode ? navStyles.darkMode : ''}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div>Error: {error}</div>
            </div>
        </div>
    );

    return (
        <div className={`${navStyles.layout} ${isDarkMode ? navStyles.darkMode : ''}`}>
            <Nav />
            <div className={`${navStyles.mainContent} ${isDarkMode ? navStyles.darkMode : ''}`}>
                <div className={`${tableStyles.container} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                    <h1 className={`${tableStyles.title} ${isDarkMode ? tableStyles.darkMode : ''}`}>All Pickups</h1>
                    
                    {/* Custom Notification */}
                    {notification.show && (
                        <div className={`${tableStyles.notification} ${notification.type === 'success' ? tableStyles.notificationSuccess : tableStyles.notificationError}`}>
                            {notification.message}
                        </div>
                    )}
                    
                    {/* QR Code Modal */}
                    {qrCodeModalOpen && selectedQrCode && (
                        <div className={`${tableStyles.modalOverlay} ${isDarkMode ? tableStyles.darkMode : ''}`} onClick={() => setQrCodeModalOpen(false)}>
                            <div className={`${tableStyles.qrCodeModal} ${isDarkMode ? tableStyles.darkMode : ''}`} onClick={e => e.stopPropagation()}>
                                <img 
                                    src={selectedQrCode} 
                                    alt="QR Code" 
                                    className={tableStyles.qrCodeLarge}
                                />
                                <button 
                                    className={`${tableStyles.closeModalButton} ${isDarkMode ? tableStyles.darkMode : ''}`}
                                    onClick={() => setQrCodeModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
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
                                <option value={PickupStatus.SCHEDULED}>Scheduled</option>
                                <option value={PickupStatus.IN_PROGRESS}>In Progress</option>
                                <option value={PickupStatus.COMPLETED}>Completed</option>
                                <option value={PickupStatus.CANCELLED}>Cancelled</option>
                                <option value={PickupStatus.DELAYED}>Delayed</option>
                                <option value={PickupStatus.DELIVERED}>Delivered</option>
                            </select>

                            <select
                                value={pickupTypeFilter}
                                onChange={(e) => setPickupTypeFilter(e.target.value)}
                                className={tableStyles.filterSelect}
                            >
                                <option value="ALL">All Pickup Types</option>
                                <option value={PickupType.AIRPORT}>Airport</option>
                                <option value={PickupType.IN_PERSON}>In Person</option>
                                <option value={PickupType.PICKUPPOINT}>Pickup Point</option>
                                <option value={PickupType.DELIVERY}>Delivery</option>
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

                    <div className={tableStyles.tableWrapper}>
                        <table className={tableStyles.table}>
                            <thead>
                                <tr>
                                    <th className={tableStyles.th}>ID</th>
                                    <th className={tableStyles.th}>Order ID</th>
                                    <th className={tableStyles.th}>Pickup Type</th>
                                    <th className={tableStyles.th}>Location</th>
                                    <th className={tableStyles.th}>Address</th>
                                    <th className={tableStyles.th}>Coordinates</th>
                                    <th className={tableStyles.th}>Contact Phone</th>
                                    <th className={tableStyles.th}>QR Code</th>
                                    <th className={tableStyles.th}>Status</th>
                                    <th className={tableStyles.th}>Scheduled Time</th>
                                    <th className={tableStyles.th}>User Confirmed</th>
                                    <th className={tableStyles.th}>Traveler Confirmed</th>
                                    <th className={tableStyles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedPickups.map((pickup) => (
                                    <tr key={pickup.id} className={tableStyles.tr}>
                                        <td className={tableStyles.td}>{pickup.id}</td>
                                        <td className={tableStyles.td}>{pickup.orderId}</td>
                                        <td className={tableStyles.td}>{pickup.pickupType}</td>
                                        <td className={tableStyles.td}>{pickup.location || 'N/A'}</td>
                                        <td className={tableStyles.td}>{pickup.address || 'N/A'}</td>
                                        <td className={tableStyles.td}>{pickup.coordinates || 'N/A'}</td>
                                        <td className={tableStyles.td}>{pickup.contactPhoneNumber || 'N/A'}</td>
                                        <td className={tableStyles.td}>
                                            {pickup.qrCode ? (
                                                <button 
                                                    onClick={() => viewQrCode(pickup.qrCode as string)}
                                                    className={`${tableStyles.actionButton} ${tableStyles.viewButton}`}
                                                >
                                                    View QR
                                                </button>
                                            ) : (
                                                'No QR'
                                            )}
                                        </td>
                                        <td className={tableStyles.td}>
                                            <span className={`${tableStyles.badge} ${tableStyles[`badge${pickup.status}`]}`}>
                                                {pickup.status}
                                            </span>
                                        </td>
                                        <td className={tableStyles.td}>{formatScheduledTime(pickup.scheduledTime)}</td>
                                        <td className={tableStyles.td}>
                                            <span className={`${tableStyles.badge} ${pickup.userconfirmed ? tableStyles.badgeCOMPLETED : tableStyles.badgePENDING}`}>
                                                {pickup.userconfirmed ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className={tableStyles.td}>
                                            <span className={`${tableStyles.badge} ${pickup.travelerconfirmed ? tableStyles.badgeCOMPLETED : tableStyles.badgePENDING}`}>
                                                {pickup.travelerconfirmed ? 'Yes' : 'No'}
                                            </span>
                                        </td>
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
                    </div>

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