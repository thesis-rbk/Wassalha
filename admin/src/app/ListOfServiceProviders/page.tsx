'use client';

import React, { useEffect, useState } from 'react';
import Nav from "../components/Nav";        
import navStyles from '../styles/Nav.module.css';
import tableStyles from '../styles/Table.module.css';
// Define the type for a service provider
interface User {
    id: number;
    name: string;
}

interface ServiceProvider {
    id: number;
    userId: number;
    type: string;
    brandName?: string;
    subscriptionLevel?: string;
    isEligible: boolean;
    followerCount?: number;
    user: User; // Include user data
}

const ListOfServiceProviders: React.FC = () => {
    const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServiceProviders = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/service-providers');
                const data = await response.json();
                if (data.success) {
                    setServiceProviders(data.data);
                } else {
                    setError(data.message);
                }
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchServiceProviders();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={navStyles.layout}>
            <Nav />
            <div className={navStyles.mainContent}>
                <div className={tableStyles.container}>
                    <h1>List of Service Providers</h1>
                    <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User ID</th>
                        <th>Type</th>
                        <th>Brand Name</th>
                        <th>Subscription Level</th>
                        <th>Is Eligible</th>
                        <th>Follower Count</th>
                        <th>User Name</th>
                    </tr>
                </thead>
                <tbody>
                    {serviceProviders.map(provider => (
                        <tr key={provider.id}>
                            <td>{provider.id}</td>
                            <td>{provider.userId}</td>
                            <td>{provider.type}</td>
                            <td>{provider.brandName}</td>
                            <td>{provider.subscriptionLevel}</td>
                            <td>{provider.isEligible ? 'Yes' : 'No'}</td>
                            <td>{provider.followerCount}</td>
                            <td>{provider.user.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
                </div>
            </div>
        </div>
    );
};

export default ListOfServiceProviders;
