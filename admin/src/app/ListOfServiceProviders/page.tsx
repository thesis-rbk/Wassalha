'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import { ServiceProvider } from '../../types/ServiceProvider';
import Image from 'next/image';

export default function ListOfServiceProviders() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [displayedProviders, setDisplayedProviders] = useState<ServiceProvider[]>([]);
    const [currentCount, setCurrentCount] = useState(5);
    const [isShowingAll, setIsShowingAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [verificationFilter, setVerificationFilter] = useState("ALL");
    const [subscriptionFilter, setSubscriptionFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [isDarkMode, setIsDarkMode] = useState(false);

    const fetchProviders = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                router.push('/AdminLogin');
                return;
            }

            const response = await api.get('/api/service-providers');
            console.log('API Response:', response.data);
            
            if (response.data.success) {
                const sortedProviders = [...response.data.data].sort((a, b) => b.id - a.id);
                setProviders(sortedProviders);
                setDisplayedProviders(sortedProviders.slice(0, currentCount));
                setIsShowingAll(sortedProviders.length <= currentCount);
            } else {
                throw new Error(response.data.message || 'Failed to fetch providers');
            }
        } catch (error: any) {
            console.error('Error fetching providers:', error);
            if (error.response?.status === 401) {
                router.push('/AdminLogin');
            } else {
                setError(error.message || 'Failed to fetch providers');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
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
            setDisplayedProviders(providers.slice(0, 5));
            setIsShowingAll(false);
        } else {
            setCurrentCount(providers.length);
            setDisplayedProviders(providers);
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

    const filterProviders = () => {
        let filtered = providers;

        if (searchTerm) {
            filtered = filtered.filter(provider =>
                provider.user.profile?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                provider.user.profile?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (typeFilter !== "ALL") {
            filtered = filtered.filter(provider => provider.type === typeFilter);
        }

        if (verificationFilter !== "ALL") {
            const isVerified = verificationFilter === "VERIFIED";
            filtered = filtered.filter(provider => provider.isVerified === isVerified);
        }

        if (subscriptionFilter !== "ALL") {
            filtered = filtered.filter(provider => provider.subscriptionLevel === subscriptionFilter);
        }

        const sortedFiltered = sortProviders(filtered, sortOrder);
        setDisplayedProviders(sortedFiltered.slice(0, currentCount));
        setIsShowingAll(sortedFiltered.length <= currentCount);
    };

    const sortProviders = (providersToSort: ServiceProvider[], order: 'asc' | 'desc') => {
        return [...providersToSort].sort((a, b) => {
            return order === 'desc' ? b.id - a.id : a.id - b.id;
        });
    };

    const handleSort = () => {
        const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        setSortOrder(newOrder);
        const sortedProviders = sortProviders(
            searchTerm ? displayedProviders : providers,
            newOrder
        );
        setDisplayedProviders(sortedProviders.slice(0, currentCount));
    };

    useEffect(() => {
        filterProviders();
    }, [searchTerm, typeFilter, verificationFilter, subscriptionFilter, providers]);

    const handleVerifyProvider = async (userId: number) => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                router.push('/AdminLogin');
                return;
            }

            const response = await api.put(`/api/service-providers/verify/${userId}`);
            
            if (response.data.success) {
                console.log('Verification successful:', response.data);
                
                // Update the providers state with the updated data
                setProviders((prevProviders) =>
                    prevProviders.map((provider) => {
                        if (provider.userId === userId) {
                            return {
                                ...provider,
                                isVerified: true,
                                type: 'SPONSOR',
                                user: {
                                    ...provider.user,
                                    profile: provider.user.profile ? {
                                        ...provider.user.profile,
                                        isSponsor: true,
                                        isVerified: true
                                    } : undefined
                                }
                            };
                        }
                        return provider;
                    })
                );
                
                // Refresh the data to ensure we have the latest state
                fetchProviders();
            } else {
                throw new Error(response.data.message || 'Failed to verify service provider');
            }
        } catch (error: any) {
            console.error('Error verifying provider:', error);
            setError(error.response?.data?.message || error.message || 'Failed to verify service provider');
        }
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
                        <h1>Loading service providers...</h1>
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
                    <h1 className={`${tableStyles.title} ${isDarkMode ? tableStyles.darkMode : ''}`}>Service Providers</h1>
                    
                    <div className={tableStyles.controls}>
                        <div className={tableStyles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Search providers..."
                                className={`${tableStyles.searchInput} ${isDarkMode ? tableStyles.darkMode : ''}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className={tableStyles.filterContainer}>
                            <select
                                className={`${tableStyles.filterSelect} ${isDarkMode ? tableStyles.darkMode : ''}`}
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="ALL">All Types</option>
                                <option value="SPONSOR">Sponsor</option>
                                <option value="SUBSCRIBER">Subscriber</option>
                            </select>
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
                                value={subscriptionFilter}
                                onChange={(e) => setSubscriptionFilter(e.target.value)}
                            >
                                <option value="ALL">All Subscription Levels</option>
                                <option value="BASIC">Basic</option>
                                <option value="PREMIUM">Premium</option>
                                <option value="VIP">VIP</option>
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
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Type</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Badge</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Subscription</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Status</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Credit Card</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>ID Card</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>License</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Passport</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Created At</th>
                                    <th className={`${tableStyles.th} ${isDarkMode ? tableStyles.darkMode : ''}`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedProviders.map((provider) => (
                                    <tr key={provider.id} className={`${tableStyles.tr} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{provider.id}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{provider.userId}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                                            {provider.user.profile?.image?.url ? (
                                                <Image
                                                    src={provider.user.profile.image.url}
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
                                                    {provider.user.profile?.firstName?.[0]?.toUpperCase() || 
                                                     provider.user.name?.[0]?.toUpperCase() || 
                                                     provider.user.email[0].toUpperCase()}
                                                </div>
                                            )}
                                        </td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                                            {provider.user.profile?.firstName} {provider.user.profile?.lastName}
                                        </td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{provider.type}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{provider.badge || 'N/A'}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{provider.subscriptionLevel || 'N/A'}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                                            <span className={`${tableStyles.badge} ${provider.isVerified ? tableStyles.verified : tableStyles.unverified}`}>
                                                {provider.isVerified ? 'Verified' : 'Not Verified'}
                                            </span>
                                        </td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{provider.creditCardId || 'N/A'}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{provider.idCardNumber || 'N/A'}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{provider.licenseNumber || 'N/A'}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{provider.passportNumber || 'N/A'}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>{new Date(provider.createdAt).toLocaleDateString()}</td>
                                        <td className={`${tableStyles.td} ${isDarkMode ? tableStyles.darkMode : ''}`}>
                                            <div className={tableStyles.buttonContainer}>
                                                <button
                                                    onClick={() => handleViewProfile(provider.userId)}
                                                    className={`${tableStyles.actionButton} ${tableStyles.viewButton} ${isDarkMode ? tableStyles.darkMode : ''}`}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => !provider.isVerified && handleVerifyProvider(provider.userId)}
                                                    className={`${tableStyles.actionButton} ${provider.isVerified ? tableStyles.verifiedButton : tableStyles.verifyButton} ${isDarkMode ? tableStyles.darkMode : ''}`}
                                                    disabled={provider.isVerified}
                                                >
                                                    {provider.isVerified ? 'Verified' : 'Verify'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {providers.length > 5 && (
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
