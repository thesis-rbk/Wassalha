"use client"; // ✅ Ensure it's a client component
import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import styles from '../../styles/Dashboard.module.css';
import Nav from '../../components/Nav';
import WorldMap from '../../components/WorldMap';
import api from '../../types/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  // State to hold fetched data
  const [orderData, setOrderData] = useState([]);
  const [requestData, setRequestData] = useState([]);
  const [promoPostData, setPromoPostData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, requestsResponse, promoPostsResponse] = await Promise.all([
          api.get('/api/orders'),
          api.get('/api/requests'),
          api.get('/api/promo-posts')
        ]);

        setOrderData(ordersResponse.data.data);
        setRequestData(requestsResponse.data.data);
        setPromoPostData(promoPostsResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Function to aggregate data by date
  const aggregateDataByDate = (data, dateField) => {
    return data.reduce((acc, item) => {
      const date = new Date(item[dateField]).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
  };

  // Aggregate data
  const ordersByDate = aggregateDataByDate(orderData, 'createdAt');
  const requestsByDate = aggregateDataByDate(requestData, 'createdAt');
  const promoPostsByDate = aggregateDataByDate(promoPostData, 'createdAt');

  // Prepare bar chart data
  const barData = {
    labels: Object.keys(ordersByDate),
    datasets: [
      {
        label: 'Orders',
        data: Object.values(ordersByDate),
        backgroundColor: '#36A2EB'
      },
      {
        label: 'Requests',
        data: Object.values(requestsByDate),
        backgroundColor: '#4BC0C0'
      },
      {
        label: 'Promo Posts',
        data: Object.values(promoPostsByDate),
        backgroundColor: '#FF6384'
      }
    ]
  };

  // Sample data for the metrics
  const metrics = {
    currentMRR: '12.4k',
    currentCustomers: '16,601',
    activeCustomers: '33%',
    churnRate: '2%'
  };

  // Pie chart data
  const pieData = {
    labels: ['Direct Plan', 'Pro Plan', 'Advanced Plan', 'Enterprise Plan'],
    datasets: [{
      data: [120, 90, 80, 52],
      backgroundColor: ['#36A2EB', '#4BC0C0', '#FF6384', '#9966FF']
    }]
  };

  // Transactions data
  const transactions = [
    { name: 'Evergrow', amount: '+$145' },
    { name: 'StartUp', amount: '+$90' },
    { name: 'Meadows', amount: '+$75' },
    { name: 'HealthCare', amount: '+$68' },
    { name: 'WithFirm', amount: '+$55' }
  ];

  // Support tickets data
  const tickets = [
    { email: 'jessica.smith123@example.com', issue: 'Login Issue' },
    { email: 'david.jones456@gmail.com', issue: 'Billing Inquiry' },
    { email: 'emily.wilson789@hotmail.com', issue: 'Product Malfunction' },
    { email: 'andrew.johnson223@mybox.org', issue: 'Feature Request' }
  ];

  // Update chart options with lighter grid lines
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'var(--color-text)'
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(200, 200, 200, 0.1)', // Light gray with low opacity
          drawBorder: false // Removes the border line
        },
        ticks: {
          color: 'var(--color-text)'
        }
      },
      y: {
        grid: {
          color: 'rgba(200, 200, 200, 0.1)', // Light gray with low opacity
          drawBorder: false // Removes the border line
        },
        ticks: {
          color: 'var(--color-text)'
        }
      }
    }
  };

  return (
    <div className={styles.dashboard}>
      <Nav />
      <div className={styles.content}>
        {/* Metrics Cards */}
        <div className={styles.metricsContainer}>
          <div className={styles.metricCard}>
            <h3>Current MRR</h3>
            <h2>${metrics.currentMRR}</h2>
          </div>
          <div className={styles.metricCard}>
            <h3>Current Customers</h3>
            <h2>{metrics.currentCustomers}</h2>
          </div>
          <div className={styles.metricCard}>
            <h3>Active Customers</h3>
            <h2>{metrics.activeCustomers}</h2>
          </div>
          <div className={styles.metricCard}>
            <h3>Churn Rate</h3>
            <h2>{metrics.churnRate}</h2>
          </div>
        </div>

        {/* Charts Section */}
        <div className={styles.chartsContainer}>
          {/* Trend Chart */}
          <div className={styles.chartCard}>
            <h3>Trend</h3>
            <Bar data={barData} options={chartOptions} />
          </div>

          {/* Sales Chart */}
          <div className={styles.chartCard}>
            <h3>Sales</h3>
            <Pie data={pieData} options={{
              ...chartOptions,
              maintainAspectRatio: false
            }} />
          </div>

          {/* Transactions */}
          <div className={styles.chartCard}>
            <h3>Transactions</h3>
            <div className={styles.transactionsList}>
              {transactions.map((transaction, index) => (
                <div key={index} className={styles.transactionItem}>
                  <span>{transaction.name}</span>
                  <span className={styles.amount}>{transaction.amount}</span>
                </div>
              ))}
              <button className={styles.viewAllButton}>View all transactions</button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomContainer}>
          {/* Support Tickets */}
          <div className={styles.ticketsCard}>
            <h3>Support Tickets</h3>
            <div className={styles.ticketsList}>
              {tickets.map((ticket, index) => (
                <div key={index} className={styles.ticketItem}>
                  <span>{ticket.email}</span>
                  <span>{ticket.issue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Demographics Map */}
          <div className={styles.mapCard}>
            <h3>Customer Demographic</h3>
            <WorldMap />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
