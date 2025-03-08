'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import Nav from "../components/Nav";        
import navStyles from '../styles/Nav.module.css';
import tableStyles from '../styles/Table.module.css';
import { ServiceProvider } from '../types/ServiceProvider';

const ListOfServiceProviders: React.FC = () => {
    const router = useRouter();
    const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
    const [displayedProviders, setDisplayedProviders] = useState<ServiceProvider[]>([]);
    const [currentCount, setCurrentCount] = useState(5);
    const [isShowingAll, setIsShowingAll] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [eligibilityFilter, setEligibilityFilter] = useState("ALL");
    const [subscriptionFilter, setSubscriptionFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const filterAndSortProviders = (providers: ServiceProvider[]) => {
        return providers
            .filter((provider) => {
                const searchMatch = searchTerm.toLowerCase() === '' || 
                    provider.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    provider.user.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    provider.user.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    provider.brandName?.toLowerCase().includes(searchTerm.toLowerCase());

                const typeMatch = typeFilter === "ALL" || provider.type === typeFilter;
                const eligibilityMatch = eligibilityFilter === "ALL" || 
                    (eligibilityFilter === "ELIGIBLE" ? provider.isEligible : !provider.isEligible);
                const subscriptionMatch = subscriptionFilter === "ALL" || 
                    provider.subscriptionLevel === subscriptionFilter;

                return searchMatch && typeMatch && eligibilityMatch && subscriptionMatch;
            })
            .sort((a, b) => {
                if (sortOrder === 'desc') {
                    return (b.followerCount || 0) - (a.followerCount || 0);
                }
                return (a.followerCount || 0) - (b.followerCount || 0);
            });
    };

    useEffect(() => {
        const fetchServiceProviders = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/service-providers`);
                const data = await response.json();
                if (data.success) {
                    setServiceProviders(data.data);
                    const filtered = filterAndSortProviders(data.data);
                    setDisplayedProviders(filtered.slice(0, 5));
                    setIsShowingAll(filtered.length <= 5);
                } else {
                    setError(data.message);
                }
            } catch (error) {
                setError(error instanceof Error ? error.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchServiceProviders();
    }, []);

    useEffect(() => {
        const filtered = filterAndSortProviders(serviceProviders);
        setDisplayedProviders(filtered.slice(0, currentCount));
        setIsShowingAll(filtered.length <= currentCount);
    }, [serviceProviders, searchTerm, typeFilter, eligibilityFilter, subscriptionFilter, sortOrder, currentCount]);

    const handleViewProfile = (userId: number) => {
        try {
            router.push(`/Profile?id=${userId}`);
        } catch (error) {
            console.error("Navigation error:", error);
            setError("Failed to navigate to profile page.");
        }
    };

    const handleSeeMore = () => {
        if (isShowingAll) {
            setDisplayedProviders(serviceProviders.slice(0, 5));
            setCurrentCount(5);
            setIsShowingAll(false);
        } else {
            const nextCount = currentCount + 5;
            const nextProviders = serviceProviders.slice(0, nextCount);
            setDisplayedProviders(nextProviders);
            setCurrentCount(nextCount);
            setIsShowingAll(nextCount >= serviceProviders.length);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={navStyles.layout}>
            <Nav />
            <div className={navStyles.mainContent}>
                <div className={tableStyles.container}>
                    <h1>List of Service Providers</h1>

                    {/* Search and Filter Controls */}
                    <div className={tableStyles.controls}>
                        <div className={tableStyles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Search by name, brand name..."
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
                                {Array.from(new Set(serviceProviders.map(provider => provider.type)))
                                    .map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                            </select>

                            <select
                                value={eligibilityFilter}
                                onChange={(e) => setEligibilityFilter(e.target.value)}
                                className={tableStyles.filterSelect}
                            >
                                <option value="ALL">All Eligibility</option>
                                <option value="ELIGIBLE">Eligible</option>
                                <option value="NOT_ELIGIBLE">Not Eligible</option>
                            </select>

                            <select
                                value={subscriptionFilter}
                                onChange={(e) => setSubscriptionFilter(e.target.value)}
                                className={tableStyles.filterSelect}
                            >
                                <option value="ALL">All Subscriptions</option>
                                {Array.from(new Set(serviceProviders.map(provider => provider.subscriptionLevel)))
                                    .filter(Boolean)
                                    .map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                            </select>

                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                                className={tableStyles.filterSelect}
                            >
                                <option value="desc">Most Followers</option>
                                <option value="asc">Least Followers</option>
                            </select>
                        </div>
                    </div>

                    <table className={tableStyles.table}>
                        <thead>
                            <tr>
                                <th className={tableStyles.th}>ID</th>
                                <th className={tableStyles.th}> Image</th>
                                <th className={tableStyles.th}>User Name</th>
                                <th className={tableStyles.th}>First Name</th>
                                <th className={tableStyles.th}>Last Name</th>
                                <th className={tableStyles.th}>Type</th>
                                <th className={tableStyles.th}>Brand Name</th>
                                <th className={tableStyles.th}>Subscription Level</th>
                                <th className={tableStyles.th}>Is Eligible</th>
                                <th className={tableStyles.th}>Followers Count</th>
                                <th className={tableStyles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedProviders.map(provider => (
                                <tr key={provider.id} className={tableStyles.tr}>
                                    <td className={tableStyles.td}>{provider.id}</td>
                                    <td className={tableStyles.td}>
                                        <img
                                            src={provider.user.profile?.image?.url || "/default-profile.png"}
                                            alt="Profile"
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                borderRadius: "50%",
                                            }}
                                        />
                                    </td>
                                    <td className={tableStyles.td}>{provider.user.name}</td>
                                    <td className={tableStyles.td}>{provider.user.profile?.firstName || 'N/A'}</td>
                                    <td className={tableStyles.td}>{provider.user.profile?.lastName || 'N/A'}</td>
                                    <td className={tableStyles.td}>{provider.type}</td>
                                    <td className={tableStyles.td}>{provider.brandName}</td>
                                    <td className={tableStyles.td}>{provider.subscriptionLevel}</td>
                                    <td className={tableStyles.td}>{provider.isEligible ? 'Yes' : 'No'}</td>
                                    <td className={tableStyles.td}>{provider.followerCount}</td>
                                    <td className={tableStyles.td}>
                                        <button 
                                            className={`${tableStyles.actionButton} ${tableStyles.editButton}`}
                                            onClick={() => handleViewProfile(provider.user.id)}
                                        >
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {serviceProviders.length > 5 && (
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

export default ListOfServiceProviders;
