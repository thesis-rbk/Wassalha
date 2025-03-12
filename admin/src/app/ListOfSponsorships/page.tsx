'use client';
import React, { useEffect, useState } from 'react';

import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import { Sponsorship } from '../../types/Sponsorship';
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
    const [durationFilter, setDurationFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
    const [availableDurations, setAvailableDurations] = useState<number[]>([]);

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
                    sponsorship.name.toLowerCase().includes(searchTerm.toLowerCase());

                const platformMatch = platformFilter === "ALL" || sponsorship.platform === platformFilter;
                const durationMatch = durationFilter === "ALL" || 
                    isDurationInRange(sponsorship.duration, durationFilter);

                return searchMatch && platformMatch && durationMatch;
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
                    
                    const platforms = [...new Set(sponsorshipsData.map((sub: Sponsorship) => sub.platform))];
                    const durations = [...new Set(sponsorshipsData.map((sub: Sponsorship) => sub.duration))];
                    
                    setAvailablePlatforms(platforms as string[]);
                    setAvailableDurations(durations as number[]);
                    
                    const filtered = filterAndSortSponsorships(sponsorshipsData);
                    setSponsorships(sponsorshipsData);
                    setDisplayedSponsorships(filtered.slice(0, 5));
                    setIsShowingAll(filtered.length <= 5);
                }
            } catch (error) {
                console.error('Error fetching sponsorships:', error);
            }
        };

        fetchSponsorships();
    }, [searchTerm, platformFilter, durationFilter, sortOrder]);

    const handleDelete = (sponsorshipId: number) => {
        setSponsorshipToDelete(sponsorshipId);
        setShowConfirmation(true);
    };

    const confirmDelete = async () => {
        if (!sponsorshipToDelete) return;

        try {
            await api.delete(`/api/sponsorships/${sponsorshipToDelete}`);
            setSponsorships(sponsorships.filter(sponsorship => sponsorship.id !== sponsorshipToDelete));
            setShowConfirmation(false);
            alert('Sponsorship deleted successfully');
        } catch (error) {
            console.error("Error deleting sponsorship:", error);
            alert('Failed to delete sponsorship');
        }
    };

    const handleSeeMore = () => {
        if (isShowingAll) {
            setDisplayedSponsorships(sponsorships.slice(0, 5));
            setCurrentCount(5);
            setIsShowingAll(false);
        } else {
            const nextCount = currentCount + 5;
            const nextSponsorships = sponsorships.slice(0, nextCount);
            setDisplayedSponsorships(nextSponsorships);
            setCurrentCount(nextCount);
            setIsShowingAll(nextCount >= sponsorships.length);
        }
    };

    if (sponsorships.length === 0) return <div>Loading...</div>;

    return (
        <div className={navStyles.layout}>
            <Nav />
            <div className={navStyles.mainContent}>
                <div className={tableStyles.container}>
                    <h1>List of Sponsorships</h1>
                    {showConfirmation && (
                        <div className={tableStyles.confirmationDialog}>
                            <p>Are you sure you want to delete this sponsorship?</p>
                            <button onClick={confirmDelete}>Yes, Delete</button>
                            <button onClick={() => setShowConfirmation(false)}>Cancel</button>
                        </div>
                    )}
                    <div className={tableStyles.controls}>
                        <div className={tableStyles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Search by sponsorship name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={tableStyles.searchInput}
                            />
                        </div>
                        <div className={tableStyles.filterContainer}>
                            <select
                                value={platformFilter}
                                onChange={(e) => setPlatformFilter(e.target.value)}
                                className={tableStyles.filterSelect}
                            >
                                <option value="ALL">All Platforms</option>
                                {availablePlatforms.map((platform) => (
                                    <option key={platform} value={platform}>
                                        {platform}
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
                                <th className={tableStyles.th}>Platform</th>
                                <th className={tableStyles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedSponsorships.map(sponsorship => (
                                <tr key={sponsorship.id} className={tableStyles.tr}>
                                    <td className={tableStyles.td}>{sponsorship.id}</td>
                                    <td className={tableStyles.td}>{sponsorship.name}</td>
                                    <td className={tableStyles.td}>{sponsorship.description}</td>
                                    <td className={tableStyles.td}>{sponsorship.price}</td>
                                    <td className={tableStyles.td}>
                                        {sponsorship.duration} days
                                        ({getDurationCategory(sponsorship.duration)})
                                    </td>
                                    <td className={tableStyles.td}>{sponsorship.platform}</td>
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
