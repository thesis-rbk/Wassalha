'use client';
import React, { useEffect, useState } from 'react';
import Nav from "../components/Nav";
import navStyles from '../styles/Nav.module.css';
import tableStyles from '../styles/Table.module.css';
interface User {
    id: number;
    name: string;
}

interface Subscription {
    id: number;
    name: string;
    description?: string;
    price: number;
    duration: number;
    type: string; // Assuming you have a type field
  
}

const ListOfSubscriptions: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/subscriptions');
                if (!response.ok) {
                    throw new Error('Failed to fetch subscriptions');
                }
                const data = await response.json();
                setSubscriptions(data.data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={navStyles.layout}>
            <Nav />
            <div className={navStyles.mainContent}>
                <div className={tableStyles.container}>
                    <h1>List of Subscriptions</h1>
                    <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Duration</th>
                        <th>Type</th>
                     
                    </tr>
                </thead>
                <tbody>
                    {subscriptions.map(subscription => (
                        <tr key={subscription.id}>
                            <td>{subscription.id}</td>
                            <td>{subscription.name}</td>
                            <td>{subscription.description}</td>
                            <td>{subscription.price}</td>
                            <td>{subscription.duration}</td>
                            <td>{subscription.type}</td>
                           
                        </tr>
                    ))}
                </tbody>
            </table>
                </div>
            </div>
            </div>
    );
};

export default ListOfSubscriptions;
