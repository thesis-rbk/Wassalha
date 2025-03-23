'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import { Traveler } from '../../types/Traveler';
import Image from 'next/image';

export default function ListOfTravelers() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [travelers, setTravelers] = useState<Traveler[]>([]);
    const [displayedTravelers, setDisplayedTravelers] = useState<Traveler[]>([]);
    const [currentCount, setCurrentCount] = useState(5);
    const [isShowingAll, setIsShowingAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [verificationFilter, setVerificationFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [isDarkMode, setIsDarkMode] = useState(false);

    const fetchTravelers = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                console.log('No admin token found, redirecting to login');
                router.push('/AdminLogin');
                return;
            }

            try {
                const response = await api.get('/api/travelers');
                console.log('API Response:', response.data);
                
                if (response.data.success) {
                    const sortedTravelers = [...response.data.data].sort((a, b) => b.id - a.id);
                    setTravelers(sortedTravelers);
                    setDisplayedTravelers(sortedTravelers.slice(0, currentCount));
                    setIsShowingAll(sortedTravelers.length <= currentCount);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch travelers');
                }
            } catch (error: any) {
                console.error('Error fetching travelers:', error);
                if (error.response?.status === 401) {
                    // Let the API interceptor handle the redirect
                    console.log('Authentication error. The API interceptor will handle redirection.');
                } else {
                    setError(error.message || 'Failed to fetch travelers');
                }
            }
        } catch (error: any) {
            console.error('Error in fetchTravelers:', error);
            setError(error.message || 'Failed to fetch travelers');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTravelers();
    }, [router]);

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

    const handleSeeMore = () => {
        if (isShowingAll) {
            setCurrentCount(5);
            setDisplayedTravelers(travelers.slice(0, 5));
            setIsShowingAll(false);
        } else {
            setCurrentCount(travelers.length);
            setDisplayedTravelers(travelers);
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

    const filterTravelers = () => {
        let filtered = travelers;

        if (searchTerm) {
            filtered = filtered.filter(traveler =>
                traveler.user.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                traveler.user.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                traveler.user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (verificationFilter !== "ALL") {
            const isVerified = verificationFilter === "VERIFIED";
            filtered = filtered.filter(traveler => traveler.isVerified === isVerified);
        }

        const sortedFiltered = sortTravelers(filtered, sortOrder);
        setDisplayedTravelers(sortedFiltered.slice(0, currentCount));
        setIsShowingAll(sortedFiltered.length <= currentCount);
    };

    const sortTravelers = (travelersToSort: Traveler[], order: 'asc' | 'desc') => {
        return [...travelersToSort].sort((a, b) => {
            return order === 'desc' ? b.id - a.id : a.id - b.id;
        });
    };

    const handleSort = () => {
        const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        setSortOrder(newOrder);
        const sortedTravelers = sortTravelers(
            searchTerm ? displayedTravelers : travelers,
            newOrder
        );
        setDisplayedTravelers(sortedTravelers.slice(0, currentCount));
    };

    useEffect(() => {
        filterTravelers();
    }, [searchTerm, verificationFilter, travelers]);

    const handleVerifyTraveler = async (id: number) => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                router.push('/AdminLogin');
                return;
            }

            const response = await api.put(`/api/travelers/${id}/verify`);
            
            if (response.data.success) {
                console.log('Verification successful:', response.data);
                
                // Update the travelers state with the updated data
                setTravelers((prevTravelers) =>
                    prevTravelers.map((traveler) => {
                        if (traveler.id === id) {
                            return {
                                ...traveler,
                                isVerified: true
                            };
                        }
                        return traveler;
                    })
                );
                
                // Refresh the data to ensure we have the latest state
                fetchTravelers();
            } else {
                throw new Error(response.data.message || 'Failed to verify traveler');
            }
        } catch (error: any) {
            console.error('Error verifying traveler:', error);
            setError(error.response?.data?.message || error.message || 'Failed to verify traveler');
        }
    };

    // Update the profile display in the table to handle the name correctly
    const getUserName = (traveler: Traveler) => {
        // First try to get name from profile
        if (traveler.user.profile?.firstName && traveler.user.profile?.lastName) {
            return `${traveler.user.profile.firstName} ${traveler.user.profile.lastName}`;
        }
        
        // Then try the user.name
        if (traveler.user.name) {
            return traveler.user.name;
        }
        
        // Fallback to email if nothing else is available
        return traveler.user.email.split('@')[0];
    };

    const getInitial = (traveler: Traveler) => {
        if (traveler.user.profile?.firstName) {
            return traveler.user.profile.firstName[0].toUpperCase();
        }
        
        if (traveler.user.name) {
            return traveler.user.name[0].toUpperCase();
        }
        
        return traveler.user.email[0].toUpperCase();
    };

    // Format gender for display
    const formatGender = (gender?: string) => {
        if (!gender) return 'Not specified';
        
        // Format from enum values like "MALE" to "Male"
        return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
    };

    if (error) {
        return (
            <div className={`${navStyles.layout} ${isDarkMode ? navStyles.darkMode : ''}`}>
                <Nav />
                <div className={`${navStyles.mainContent} ${isDarkMode ? navStyles.darkMode : ''}`}>
                    <div className={`${tableStyles.container} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                        <h1>Error</h1>
                        <p className={tableStyles.error}>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={`${navStyles.layout} ${isDarkMode ? navStyles.darkMode : ''}`}>
                <Nav />
                <div className={`${navStyles.mainContent} ${isDarkMode ? navStyles.darkMode : ''}`}>
                    <div className={`${tableStyles.container} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                        <h1>Loading travelers...</h1>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${navStyles.layout} ${isDarkMode ? navStyles.darkMode : ''}`}>
            <Nav />
            <div className={`${navStyles.mainContent} ${isDarkMode ? navStyles.darkMode : ''}`}>
                <div className={`${tableStyles.container} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                    <h1 className={`${tableStyles.title} ${isDarkMode ? tableStyles.darkMode : ''}`}>Travelers</h1>
                    
                    <div className={tableStyles.controls}>
                        <div className={tableStyles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Search travelers..."
                                className={`${tableStyles.searchInput} ${isDarkMode ? tableStyles.darkMode : ''}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className={tableStyles.filterContainer}>
                            <select
                                className={`${tableStyles.filterSelect} ${isDarkMode ? tableStyles.darkMode : ''}`}
                                value={verificationFilter}
                                onChange={(e) => setVerificationFilter(e.target.value)}
                            >
                                <option value="ALL">All Verification Status</option>
                                <option value="VERIFIED">Verified</option>
                                <option value="UNVERIFIED">Not Verified</option>
                            </select>
                            <select
                                className={`${tableStyles.filterSelect} ${isDarkMode ? tableStyles.darkMode : ''}`}
                                value={sortOrder}
                                onChange={handleSort}
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    <div className={`${tableStyles.tableWrapper} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                        <table className={`${tableStyles.table} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                            <thead>
                                <tr>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>ID</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>User ID</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Profile</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Name</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Email</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Gender</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Status</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>ID Card</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Bank Card</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Created At</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedTravelers.map((traveler) => (
                                    <tr key={traveler.id} className={`${tableStyles.tr} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{traveler.id}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{traveler.userId}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                                            {traveler.user.profile?.image?.url ? (
                                                <Image
                                                    src={traveler.user.profile.image.url}
                                                    alt="Profile"
                                                    width={40}
                                                    height={40}
                                                    className={tableStyles.userImage}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        borderRadius: "50%",
                                                        backgroundColor: '#e0e0e0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.2rem',
                                                        color: '#666'
                                                    }}
                                                >
                                                    {getInitial(traveler)}
                                                </div>
                                            )}
                                        </td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                                            {getUserName(traveler)}
                                        </td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{traveler.user.email}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                                            {formatGender(traveler.user.profile?.gender)}
                                        </td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                                            <span className={`${tableStyles.badge} ${traveler.isVerified ? tableStyles.verified : tableStyles.unverified}`}>
                                                {traveler.isVerified ? 'Verified' : 'Not Verified'}
                                            </span>
                                        </td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{traveler.idCard || 'N/A'}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{traveler.bankCard || 'N/A'}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{new Date(traveler.createdAt).toLocaleDateString()}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                                            <div className={tableStyles.buttonContainer}>
                                                <button
                                                    onClick={() => handleViewProfile(traveler.userId)}
                                                    className={`${tableStyles.actionButton} ${tableStyles.viewButton} ${isDarkMode ? tableStyles.darkMode : ''}`}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => !traveler.isVerified && handleVerifyTraveler(traveler.id)}
                                                    className={`${tableStyles.actionButton} ${traveler.isVerified ? tableStyles.verifiedButton : tableStyles.verifyButton} ${isDarkMode ? tableStyles.darkMode : ''}`}
                                                    disabled={traveler.isVerified}
                                                >
                                                    {traveler.isVerified ? 'Verified' : 'Verify'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {travelers.length > 5 && (
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
    );
}
