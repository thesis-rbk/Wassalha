'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import { Request } from '../../types/Request';
import api from '../../lib/api';

const ListOfRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [displayedRequests, setDisplayedRequests] = useState<Request[]>([]);
  const [currentCount, setCurrentCount] = useState(5);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filterAndSortRequests = (requests: Request[]) => {
    return requests
      .filter((request) => {
        const searchMatch = searchTerm.toLowerCase() === '' || 
          request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.goods.name.toLowerCase().includes(searchTerm.toLowerCase());

        const statusMatch = statusFilter === "ALL" || request.order?.status === statusFilter;

        return searchMatch && statusMatch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/api/requests');
        const data = response.data.data;
        setRequests(data);
        const filtered = filterAndSortRequests(data);
        setDisplayedRequests(filtered.slice(0, 5));
        setIsShowingAll(data.length <= 5);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    const filtered = filterAndSortRequests(requests);
    setDisplayedRequests(filtered.slice(0, currentCount));
  }, [searchTerm, statusFilter, sortOrder, requests, currentCount]);

  const handleSeeMore = () => {
    if (isShowingAll) {
      setDisplayedRequests(requests.slice(0, 5));
      setCurrentCount(5);
      setIsShowingAll(false);
    } else {
      const nextCount = currentCount + 5;
      const nextRequests = requests.slice(0, nextCount);
      setDisplayedRequests(nextRequests);
      setCurrentCount(nextCount);
      setIsShowingAll(nextCount >= requests.length);
    }
  };

  const handleDelete = (requestId: number) => {
    setRequestToDelete(requestId);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!requestToDelete) return;

    try {
      await api.delete(`/api/requests/${requestToDelete}`);
      setRequests(requests.filter(request => request.id !== requestToDelete));
      setShowConfirmation(false);
      alert('Request deleted successfully');
    } catch (error) {
      console.error("Error deleting request:", error);
      alert('Failed to delete request');
    }
  };

  return (
    <div className={navStyles.layout}>
      <Nav />
      <div className={navStyles.mainContent}>
        <div className={tableStyles.container}>
          <h1>List of Requests</h1>
          {showConfirmation && (
            <div className={tableStyles.confirmationDialog}>
              <p>Are you sure you want to delete this request?</p>
              <button onClick={confirmDelete}>Yes, Delete</button>
              <button onClick={() => setShowConfirmation(false)}>Cancel</button>
            </div>
          )}
          <div className={tableStyles.controls}>
            <div className={tableStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search by user or goods name..."
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
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
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
          
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th className={tableStyles.th}>ID</th>
                <th className={tableStyles.th}>User</th>
                <th className={tableStyles.th}>Goods Name</th>
                <th className={tableStyles.th}>Goods Description</th>
                <th className={tableStyles.th}>Pickup Location</th>
                <th className={tableStyles.th}>Pickup Scheduled Time</th>
                <th className={tableStyles.th}>Order Status</th>
                <th className={tableStyles.th}>Quantity</th>
                <th className={tableStyles.th}>Goods Location</th>
                <th className={tableStyles.th}>Goods Destination</th>
                <th className={tableStyles.th}>Date</th>
                <th className={tableStyles.th}>With Box</th>
                <th className={tableStyles.th}>Created At</th>
                <th className={tableStyles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedRequests.map((request) => (
                <tr key={request.id} className={tableStyles.tr}>
                  <td className={tableStyles.td}>{request.id}</td>
                  <td className={tableStyles.td}>{request.user.name}</td>
                  <td className={tableStyles.td}>{request.goods.name}</td>
                  <td className={tableStyles.td}>{request.goods.description}</td>
                  <td className={tableStyles.td}>{request.pickup?.location || 'N/A'}</td>
                  <td className={tableStyles.td}>{request.pickup?.scheduledTime || 'N/A'}</td>
                  <td className={tableStyles.td}>
                    <span className={`${tableStyles.badge} ${tableStyles[`badge${request.order?.status}`]}`}>
                      {request.order?.status || 'N/A'}
                    </span>
                  </td>
                  <td className={tableStyles.td}>{request.quantity}</td>
                  <td className={tableStyles.td}>{request.goodsLocation}</td>
                  <td className={tableStyles.td}>{request.goodsDestination}</td>
                  <td className={tableStyles.td}>{new Date(request.date).toLocaleDateString()}</td>
                  <td className={tableStyles.td}>{request.withBox ? 'Yes' : 'No'}</td>
                  <td className={tableStyles.td}>{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td className={tableStyles.td}>
                    <button 
                      onClick={() => handleDelete(request.id)}
                      className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {requests.length > 5 && (
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

export default ListOfRequests;
