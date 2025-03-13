'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/api';  // Update import path
import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import { Order } from '../../types/Order';

export default function ListOfOrders() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [displayedOrders, setDisplayedOrders] = useState<Order[]>([]);
  const [currentCount, setCurrentCount] = useState(5);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filterAndSortOrders = (orders: Order[]) => {
    if (!orders.length) return [];
    
    return orders
      .filter((order) => {
        if (!order?.traveler?.profile) return false;
        
        const searchMatch = searchTerm.toLowerCase() === '' || 
          `${order.traveler.profile.firstName} ${order.traveler.profile.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const statusMatch = statusFilter === "ALL" || order.orderStatus === statusFilter;
        const paymentMatch = paymentFilter === "ALL" || 
          (order.payment?.[0]?.status === paymentFilter);

        return searchMatch && statusMatch && paymentMatch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/api/orders');
        console.log('API Response:', response); // Debug log
        
        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch orders');
        }
        
        const data = response.data.data;
        setOrders(data);
        const filtered = filterAndSortOrders(data);
        setDisplayedOrders(filtered.slice(0, currentCount));
        setIsShowingAll(filtered.length <= currentCount);
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        setError(error.message || 'Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const filtered = filterAndSortOrders(orders);
      setDisplayedOrders(filtered.slice(0, currentCount));
      setIsShowingAll(filtered.length <= currentCount);
    }
  }, [searchTerm, statusFilter, paymentFilter, sortOrder, orders, currentCount, isLoading]);

  const handleDelete = async (orderId: number) => {
    setOrderToDelete(orderId);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await api.delete(`/api/orders/${orderToDelete}`);
      setOrders(orders.filter(order => order.id !== orderToDelete));
      setShowConfirmation(false);
      // alert('Order deleted successfully');
    } catch (error) {
      console.error("Error deleting order:", error);
      alert('Failed to delete order');
    }
  };

  const handleSeeMore = () => {
    if (isShowingAll) {
      setDisplayedOrders(orders.slice(0, 5));
      setCurrentCount(5);
      setIsShowingAll(false);
    } else {
      const nextCount = currentCount + 5;
      setDisplayedOrders(orders.slice(0, nextCount));
      setCurrentCount(nextCount);
      setIsShowingAll(nextCount >= orders.length);
    }
  };

  if (error) {
    return (
      <div className={navStyles.layout}>
        <Nav />
        <div className={navStyles.mainContent}>
          <div className={tableStyles.container}>
            <h1>Error</h1>
            <p className={tableStyles.error}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={navStyles.layout}>
        <Nav />
        <div className={navStyles.mainContent}>
          <div className={tableStyles.container}>
            <h1>Loading orders...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={navStyles.layout}>
      <Nav />
      <div className={navStyles.mainContent}>
        <div className={tableStyles.container}>
          <h1>List of Orders</h1>
          
          <div className={tableStyles.controls}>
            <div className={tableStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search by traveler name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={tableStyles.searchInput}
              />
            </div>
            <div className={tableStyles.filterContainer}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={tableStyles.filterSelect}
              >
                <option value="ALL">All Order Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className={tableStyles.filterSelect}
              >
                <option value="ALL">All Payment Status</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="REFUND">Refund</option>
                <option value="FAILED">Failed</option>
                <option value="PROCCESSING">Processing</option>
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

          {showConfirmation && (
            <div className={tableStyles.confirmationDialog}>
              <p>Are you sure you want to delete this order?</p>
              <button onClick={confirmDelete}>Yes, Delete</button>
              <button onClick={() => setShowConfirmation(false)}>Cancel</button>
            </div>
          )}

          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th className={tableStyles.th}>ID</th>
                <th className={tableStyles.th}>Traveler</th>
                <th className={tableStyles.th}>Image</th>
                <th className={tableStyles.th}>Goods Location</th>
                <th className={tableStyles.th}>Goods Destination</th>
                <th className={tableStyles.th}>Total Amount</th>
                <th className={tableStyles.th}>Payment Status</th>
                <th className={tableStyles.th}>Order Status</th>
                <th className={tableStyles.th}>Pickup Location</th>
                <th className={tableStyles.th}>Scheduled Pickup Time</th>
                <th className={tableStyles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.map((order) => (
                <tr key={order.id} className={tableStyles.tr}>
                  <td className={tableStyles.td}>{order.id}</td>
                  <td className={tableStyles.td}>
                    {order.traveler.profile.firstName} {order.traveler.profile.lastName}
                  </td>
                  <td className={tableStyles.td}>
                    <img 
                      src={order.traveler.profile.image?.url || "/default-profile.png"}
                      alt="Traveler"
                      className={tableStyles.userImage}
                    />
                  </td>
                  <td className={tableStyles.td}>{order.request.goodsLocation}</td>
                  <td className={tableStyles.td}>{order.request.goodsDestination}</td>
                  <td className={tableStyles.td}>{order.totalAmount}</td>
                  <td className={tableStyles.td}>
                    <span className={`${tableStyles.badge} ${tableStyles[`badge${order.payment[0]?.status}`]}`}>
                      {order.payment[0]?.status || 'N/A'}
                    </span>
                  </td>
                  <td className={tableStyles.td}>{order.orderStatus}</td>
                  <td className={tableStyles.td}>{order.pickup?.location || 'N/A'}</td>
                  <td className={tableStyles.td}>{order.pickup?.scheduledTime || 'N/A'}</td>
                  <td className={tableStyles.td}>
                    <button 
                      onClick={() => handleDelete(order.id)}
                      className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {orders.length > 5 && (
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
}
