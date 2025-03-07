'use client';
import React, { useEffect, useState } from 'react';

interface User {
    id: number;
    name: string;
}

interface Sponsorship {
    id: number;
    name: string;
    description?: string;
    price: number;
    duration: number;
    platform: string;
  
}

const ListOfSponsorships: React.FC = () => {
    const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSponsorships = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/sponsorships');
                if (!response.ok) {
                    throw new Error('Failed to fetch sponsorships');
                }
                const data = await response.json();
                setSponsorships(data.data);
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

        fetchSponsorships();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>List of Sponsorships</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Duration</th>
                        <th>Platform</th>
                    
                    </tr>
                </thead>
                <tbody>
                    {sponsorships.map(sponsorship => (
                        <tr key={sponsorship.id}>
                            <td>{sponsorship.id}</td>
                            <td>{sponsorship.name}</td>
                            <td>{sponsorship.description}</td>
                            <td>{sponsorship.price}</td>
                            <td>{sponsorship.duration}</td>
                            <td>{sponsorship.platform}</td>
                          
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListOfSponsorships;
