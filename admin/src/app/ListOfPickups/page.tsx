"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Define the type for a pickup
interface Pickup {
    id: number;
    orderId: number;
    pickupType: string; // Adjust according to your pickup model
    location?: string;
    address?: string;
    // qrCode?: string;
    coordinates?: string;
    contactPhoneNumber?: string;
    status: string; // Adjust according to your pickup model
    scheduledTime?: string; // Adjust according to your pickup model
}

const PickupList: React.FC = () => {
    const [pickups, setPickups] = useState<Pickup[]>([]); // Declare the type for state
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPickups = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/pickups');
                if (response.data.success) {
                    setPickups(response.data.data);
                } else {
                    setError("Failed to fetch pickups");
                }
            } catch (err) {
                if (axios.isAxiosError(err) && err.response) {
                    setError(err.response.data.message || "An error occurred");
                } else if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPickups();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>All Pickups</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Order ID</th>
                        <th>Pickup Type</th>
                        <th>Location</th>
                        <th>Address</th>
                        {/* <th>QR Code</th> */}
                        <th>Coordinates</th>
                        <th>Contact Phone Number</th>
                        <th>Status</th>
                        <th>Scheduled Time</th>
                    </tr>
                </thead>
                <tbody>
                    {pickups.map((pickup) => (
                        <tr key={pickup.id}>
                            <td>{pickup.id}</td>
                            <td>{pickup.orderId}</td>
                            <td>{pickup.pickupType}</td>
                            <td>{pickup.location}</td>
                            <td>{pickup.address}</td>
                            {/* <td>{pickup.qrCode}</td> */}
                            <td>{pickup.coordinates}</td>
                            <td>{pickup.contactPhoneNumber}</td>
                            <td>{pickup.status}</td>
                            <td>{pickup.scheduledTime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PickupList;