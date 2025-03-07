'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import styles from './ListOfRequests.module.css'; // Assuming you have some styles

// Define the type for a request
interface Request {
  id: number;
  user: {
    name: string; // Assuming the user has a name field
  };
  goods: {
    title: string; // Assuming goods have a title
    description: string; // Assuming goods have a description
  };
  pickup: {
    location: string; // Pickup location
    scheduledTime: string; // Scheduled pickup time
  };
  order: {
    status: string; // Order status
  };
  quantity: number;
  goodsLocation: string;
  goodsDestination: string;
  date: string;
  withBox: boolean;
  createdAt: string;
}

const ListOfRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/requests');
        setRequests(response.data.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div>
      <h1>List of Requests</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Goods Title</th>
            <th>Goods Description</th>
            <th>Pickup Location</th>
            <th>Pickup Scheduled Time</th>
            <th>Order Status</th>
            <th>Quantity</th>
            <th>Goods Location</th>
            <th>Goods Destination</th>
            <th>Date</th>
            <th>With Box</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.id}</td>
              <td>{request.user.name}</td>
              <td>{request.goods.title}</td>
              <td>{request.goods.description}</td>
              <td>{request.pickup?.location || 'N/A'}</td>
              <td>{request.pickup?.scheduledTime || 'N/A'}</td>
              <td>{request.order?.status || 'N/A'}</td>
              <td>{request.quantity}</td>
              <td>{request.goodsLocation}</td>
              <td>{request.goodsDestination}</td>
              <td>{new Date(request.date).toLocaleDateString()}</td>
              <td>{request.withBox ? 'Yes' : 'No'}</td>
              <td>{new Date(request.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListOfRequests;
