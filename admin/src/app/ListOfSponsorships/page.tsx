'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import { Sponsorship, SponsorshipPlatform } from '../../types/Sponsorship';
import api from '../../lib/api';

const ListOfSponsorships: React.FC = () => {
    const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
    const [displayedSponsorships, setDisplayedSponsorships] = useState<Sponsorship[]>([]);
    const [currentCount, setCurrentCount] = useState(5);
    const [isShowingAll, setIsShowingAll] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [sponsorshipToDelete, setSponsorshipToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [platformFilter, setPlatformFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [durationFilter, setDurationFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [availableCategories, setAvailableCategories] = useState<{id: number, name: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Function to show notification
    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    const getDurationCategory = (days: number): string => {
        if (days <= 30) return "Monthly";
        if (days <= 90) return "Quarterly";
        if (days <= 180) return "Semi-Annual";
        if (days <= 365) return "Annual";
        return "Multi-Year";
    };

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

    const filterAndSortSponsorships = (sponsorships: Sponsorship[]) => {
        return sponsorships
            .filter((sponsorship) => {
                const searchMatch = searchTerm.toLowerCase() === '' || 
                    (sponsorship.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    sponsorship.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    sponsorship.sponsor?.badge?.toLowerCase().includes(searchTerm.toLowerCase()));

                const platformMatch = platformFilter === "ALL" || sponsorship.platform === platformFilter;
                const durationMatch = durationFilter === "ALL" || 
                    isDurationInRange(sponsorship.duration, durationFilter);
                const categoryMatch = categoryFilter === "ALL" || 
                    (sponsorship.category && sponsorship.category.id.toString() === categoryFilter);
                const activeMatch = activeFilter === "ALL" || 
                    (activeFilter === "ACTIVE" && sponsorship.isActive) || 
                    (activeFilter === "INACTIVE" && !sponsorship.isActive);
                const statusMatch = statusFilter === "ALL" || sponsorship.status === statusFilter;

                return searchMatch && platformMatch && durationMatch && categoryMatch && activeMatch && statusMatch;
            })
            .sort((a, b) => {
                return sortOrder === 'desc' ? b.id - a.id : a.id - b.id;
            });
    };

    useEffect(() => {
        const fetchSponsorships = async () => {
            try {
                const response = await api.get('/api/sponsorships');
                if (response.status === 200) {
                    const sponsorshipsData = response.data.data;
                    
                    // Extract categories
                    const categories = sponsorshipsData
                        .filter((sub: Sponsorship) => sub.category)
                        .map((sub: Sponsorship) => sub.category)
                        .filter((category: any, index: number, self: any[]) => 
                            index === self.findIndex((c) => c.id === category.id)
                        );
                    
                    setAvailableCategories(categories);
                    setSponsorships(sponsorshipsData);
                    
                    const filtered = filterAndSortSponsorships(sponsorshipsData);
                    setDisplayedSponsorships(filtered.slice(0, 5));
                    setIsShowingAll(filtered.length <= 5);
                } else {
                    setError('Failed to fetch sponsorships');
                    showNotification('Failed to fetch sponsorships', 'error');
                }
            } catch (error) {
                console.error('Error fetching sponsorships:', error);
                setError('Error fetching sponsorships');
                showNotification('Error fetching sponsorships', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchSponsorships();
    }, []);

    // Update displayed sponsorships when filters or search term changes
    useEffect(() => {
        if (sponsorships.length > 0) {
            const filtered = filterAndSortSponsorships(sponsorships);
            setDisplayedSponsorships(filtered.slice(0, currentCount));
            setIsShowingAll(filtered.length <= currentCount);
        }
    }, [searchTerm, platformFilter, categoryFilter, activeFilter, statusFilter, durationFilter, sortOrder, currentCount, sponsorships]);

    const handleDelete = (sponsorshipId: number) => {
        setSponsorshipToDelete(sponsorshipId);
        setShowConfirmation(true);
    };

    const confirmDelete = async () => {
        if (!sponsorshipToDelete) return;

        try {
            await api.delete(`/api/sponsorships/${sponsorshipToDelete}`);
            
            // Update the sponsorships state
            const updatedSponsorships = sponsorships.filter(sponsorship => sponsorship.id !== sponsorshipToDelete);
            setSponsorships(updatedSponsorships);

            // Re-filter and sort the sponsorships
            const filtered = filterAndSortSponsorships(updatedSponsorships);
            setDisplayedSponsorships(filtered.slice(0, currentCount));
            setIsShowingAll(filtered.length <= currentCount);

            setShowConfirmation(false);
            showNotification("Sponsorship deleted successfully", "success");
        } catch (error) {
            console.error("Error deleting sponsorship:", error);
            showNotification("Failed to delete sponsorship", "error");
        }
    };

    const handleSeeMore = () => {
        if (isShowingAll) {
            setDisplayedSponsorships(filterAndSortSponsorships(sponsorships).slice(0, 5));
            setCurrentCount(5);
            setIsShowingAll(false);
        } else {
            const nextCount = currentCount + 5;
            const nextSponsorships = filterAndSortSponsorships(sponsorships).slice(0, nextCount);
            setDisplayedSponsorships(nextSponsorships);
            setCurrentCount(nextCount);
            setIsShowingAll(nextCount >= filterAndSortSponsorships(sponsorships).length);
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
                    <h1>List of Sponsorships</h1>
                    
                    {/* Custom Notification */}
                    {notification.show && (
                        <div className={`${tableStyles.notification} ${notification.type === 'success' ? tableStyles.notificationSuccess : tableStyles.notificationError}`}>
                            {notification.message}
                        </div>
                    )}
                    
                    {showConfirmation && (
                        <div className={tableStyles.confirmationDialog}>
                            <p>Are you sure you want to delete this sponsorship?</p>
                            <button onClick={confirmDelete}>Yes, Delete</button>
                            <button onClick={() => setShowConfirmation(false)}>Cancel</button>
                        </div>
                    )}
                    <div className={tableStyles.controls} style={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        flexWrap: 'nowrap', 
                        gap: '10px', 
                        overflowX: 'hidden',
                        width: '100%'
                    }}>
                        <div style={{ 
                            flex: '1',
                            minWidth: '180px',
                            maxWidth: '300px',
                            marginRight: '30px'
                        }}>
                            <input
                                type="text"
                                placeholder="Search sponsorships..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={tableStyles.searchInput}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <select
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value)}
                            className={tableStyles.filterSelect}
                            style={{ 
                                flex: '0 0 auto',
                                minWidth: '120px',
                                padding: '8px',
                                fontSize: '0.85rem',
                                marginRight: '10px'
                            }}
                        >
                            <option value="ALL">All Platforms</option>
                            <option value={SponsorshipPlatform.FACEBOOK}>Facebook</option>
                            <option value={SponsorshipPlatform.INSTAGRAM}>Instagram</option>
                            <option value={SponsorshipPlatform.YOUTUBE}>YouTube</option>
                            <option value={SponsorshipPlatform.TWITTER}>Twitter</option>
                            <option value={SponsorshipPlatform.TIKTOK}>TikTok</option>
                            <option value={SponsorshipPlatform.OTHER}>Other</option>
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className={tableStyles.filterSelect}
                            style={{ 
                                flex: '0 0 auto',
                                minWidth: '120px',
                                padding: '8px',
                                fontSize: '0.85rem'
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
                                flex: '0 0 auto',
                                minWidth: '100px',
                                padding: '8px',
                                fontSize: '0.85rem'
                            }}
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={tableStyles.filterSelect}
                            style={{ 
                                flex: '0 0 auto',
                                minWidth: '150px',
                                padding: '8px',
                                fontSize: '0.85rem'
                            }}
                        >
                            <option value="ALL">All Process Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>

                        <select
                            value={durationFilter}
                            onChange={(e) => setDurationFilter(e.target.value)}
                            className={tableStyles.filterSelect}
                            style={{ 
                                flex: '0 0 auto',
                                minWidth: '140px',
                                padding: '8px',
                                fontSize: '0.85rem'
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
                                flex: '0 0 auto',
                                minWidth: '130px',
                                padding: '8px',
                                fontSize: '0.85rem'
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
                                    <th className={tableStyles.th}>Category</th>
                                    <th className={tableStyles.th}>Description</th>
                                    <th className={tableStyles.th}>Price</th>
                                    <th className={tableStyles.th}>Duration</th>
                                    <th className={tableStyles.th}>Platform</th>
                                    <th className={tableStyles.th}>Status</th>
                                    <th className={tableStyles.th}>Active</th>
                                    <th className={tableStyles.th}>Sponsor</th>
                                    <th className={tableStyles.th}>Users</th>
                                    <th className={tableStyles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedSponsorships.map(sponsorship => (
                                    <tr key={sponsorship.id} className={tableStyles.tr}>
                                        <td className={tableStyles.td}>{sponsorship.id}</td>
                                        <td className={tableStyles.td}>{sponsorship.category?.name || 'N/A'}</td>
                                        <td className={tableStyles.td}>{sponsorship.description || 'N/A'}</td>
                                        <td className={tableStyles.td}>${sponsorship.price.toFixed(2)}</td>
                                        <td className={tableStyles.td}>
                                            {sponsorship.duration} days
                                            ({getDurationCategory(sponsorship.duration)})
                                        </td>
                                        <td className={tableStyles.td}>{sponsorship.platform}</td>
                                        <td className={tableStyles.td}>
                                            <span className={`${tableStyles.badge} ${
                                                sponsorship.status === 'APPROVED' ? tableStyles.badgeCOMPLETED : 
                                                sponsorship.status === 'REJECTED' ? tableStyles.badgeCANCELLED : 
                                                tableStyles.badgePENDING
                                            }`}>
                                                {sponsorship.status}
                                            </span>
                                        </td>
                                        <td className={tableStyles.td}>
                                            <span className={`${tableStyles.badge} ${
                                                sponsorship.isActive ? tableStyles.badgeCOMPLETED : tableStyles.badgeCANCELLED
                                            }`}>
                                                {sponsorship.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className={tableStyles.td}>
                                            {sponsorship.sponsor ? (
                                                <div>
                                                    {sponsorship.sponsor.isVerified && (
                                                        <span className={`${tableStyles.badge} ${tableStyles.badgeCOMPLETED}`}>Verified</span>
                                                    )}
                                                </div>
                                            ) : 'N/A'}
                                        </td>
                                        <td className={tableStyles.td}>
                                            {sponsorship.users?.length || 0}
                                        </td>
                                        <td className={tableStyles.td}>
                                            <button 
                                                onClick={() => handleDelete(sponsorship.id)}
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
                    {sponsorships.length > 5 && (
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

export default ListOfSponsorships;
