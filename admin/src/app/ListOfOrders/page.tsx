'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Define the type for an order
interface Order {
  id: number;
  traveler: {
    profile: {
      firstName: string;
      lastName: string;
      image?: {
        url: string; // Assuming the image has a URL field
      };
    };
  };
  request: {
    goodsLocation: string;
    goodsDestination: string;
  };
  totalAmount: number;
  createdAt: string;
  payment: {
    amount: number;
    status: string; // Payment status
  };
  pickup: {
    location: string; // Pickup location
    scheduledTime: string; // Scheduled pickup time
  };
}

const ListOfOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/orders');
        setOrders(response.data.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h1>List of Orders</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Traveler</th>
            <th>Traveler Image</th>
            <th>Goods Location</th>
            <th>Goods Destination</th>
            <th>Total Amount</th>
            <th>Payment Status</th>
            <th>Pickup Location</th>
            <th>Scheduled Pickup Time</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.traveler.profile.firstName} {order.traveler.profile.lastName}</td>
              <td>
                {order.traveler.profile.image ? (
                  <img src={order.traveler.profile.image.url} alt="Traveler" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                ) : (
                  <img src="/default-profile.png" alt="Default" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                )}
              </td>
              <td>{order.request.goodsLocation}</td>
              <td>{order.request.goodsDestination}</td>
              <td>{order.totalAmount}</td>
              <td>{order.payment.status}</td>
              <td>{order.pickup?.location || 'N/A'}</td>
              <td>{order.pickup?.scheduledTime || 'N/A'}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListOfOrders;
