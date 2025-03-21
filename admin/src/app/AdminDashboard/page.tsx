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
import api from '../../lib/api';

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

  // Fetch user, service provider, and traveler data
  const [users, setUsers] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [travelers, setTravelers] = useState([]);

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Add this useEffect to detect dark mode
  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkMode);

    const handleThemeChange = () => {
      const darkMode = localStorage.getItem("darkMode") === "true";
      setIsDarkMode(darkMode);
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use Promise.allSettled for more robust error handling
        const fetchedData = await Promise.allSettled([
          api.get('/api/orders'),
          api.get('/api/requests'),
          api.get('/api/promo-posts')
        ]);
        
        // Process results, using empty arrays if any request failed
        const [ordersResponse, requestsResponse, promoPostsResponse] = fetchedData;
        
        // Set orders data
        if (ordersResponse.status === 'fulfilled' && ordersResponse.value.data?.data) {
          setOrderData(ordersResponse.value.data.data);
        } else {
          console.warn('Orders API request failed, using empty array');
          setOrderData([]);
        }
        
        // Set requests data
        if (requestsResponse.status === 'fulfilled' && requestsResponse.value.data?.data) {
          setRequestData(requestsResponse.value.data.data);
        } else {
          console.warn('Requests API request failed, using empty array');
          setRequestData([]);
        }
        
        // Set promo posts data
        if (promoPostsResponse.status === 'fulfilled' && promoPostsResponse.value.data?.data) {
          setPromoPostData(promoPostsResponse.value.data.data);
        } else {
          console.warn('Promo posts API request failed, using empty array');
          setPromoPostData([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set default empty arrays if the entire operation fails
        setOrderData([]);
        setRequestData([]);
        setPromoPostData([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Try to fetch all user data with proper error handling
        const fetchedData = await Promise.allSettled([
          api.get('/api/users'),
          api.get('/api/service-providers'),
          api.get('/api/travelers')
        ]);
        
        // Process results, using default values if any request failed
        const [usersResponse, serviceProvidersResponse, travelersResponse] = fetchedData;
        
        // Set users data
        if (usersResponse.status === 'fulfilled' && usersResponse.value.data?.data) {
          setUsers(usersResponse.value.data.data);
        } else {
          console.warn('Users API request failed, using default data');
          // Keep existing users data or set default
          setUsers(users.length ? users : []);
        }
        
        // Set service providers data
        if (serviceProvidersResponse.status === 'fulfilled' && serviceProvidersResponse.value.data?.data) {
          setServiceProviders(serviceProvidersResponse.value.data.data);
        } else {
          console.warn('Service providers API request failed, using default data');
          // Keep existing service providers data or set default
          setServiceProviders(serviceProviders.length ? serviceProviders : []);
        }
        
        // Set travelers data
        if (travelersResponse.status === 'fulfilled' && travelersResponse.value.data?.data) {
          setTravelers(travelersResponse.value.data.data);
        } else {
          console.warn('Travelers API request failed, using default data');
          // Keep existing travelers data or set default
          setTravelers(travelers.length ? travelers : []);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
        // If the entire operation fails, we still have the default values set
      }
    };

    fetchCounts();
  }, []);

  // For testing purposes, set default values
  const userCount = users.length || 100; // Default to 100 if no data
  const serviceProviderCount = serviceProviders.length || 50; // Default to 50 if no data
  const travelerCount = travelers.length || 30; // Default to 30 if no data

  // Calculate total and percentages
  const totalUsers = userCount + serviceProviderCount + travelerCount;
  const userPercentage = ((userCount / totalUsers) * 100).toFixed(2);
  const serviceProviderPercentage = ((serviceProviderCount / totalUsers) * 100).toFixed(2);
  const travelerPercentage = ((travelerCount / totalUsers) * 100).toFixed(2);

  // Function to aggregate data by date
  const aggregateDataByDate = (data: { [key: string]: any }[], dateField: string) => {
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
        backgroundColor: '#018ABE' // --color-primary
      },
      {
        label: 'Requests',
        data: Object.values(requestsByDate),
        backgroundColor: '#05AFF0' // --color-secondary
      },
      {
        label: 'Promo Posts',
        data: Object.values(promoPostsByDate),
        backgroundColor: '#3703C8' // --color-dark
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

  // Update pie chart data for user distribution
  const userChartData = {
    labels: [
      `Customers (${userPercentage}%)`,
      `Service Providers (${serviceProviderPercentage}%)`,
      `Travelers (${travelerPercentage}%)`
    ],
    datasets: [{
      data: [userCount, serviceProviderCount, travelerCount],
      backgroundColor: [
        '#018ABE', // --color-primary
        '#05AFF0', // --color-secondary
        '#3703C8'  // --color-dark
      ]
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

  // Update chart options with proper color handling
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? '#ffffff' : '#000000'
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: isDarkMode ? '#ffffff' : '#000000'
        }
      },
      y: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: isDarkMode ? '#ffffff' : '#000000'
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
            <h3>Current users</h3>
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
            <h3>Posts Overview</h3>
            <Bar data={barData} options={chartOptions} />
          </div>

          {/* User Chart */}
          <div className={styles.chartCard}>
            <h3>User Distribution</h3>
            <Pie data={userChartData} options={{
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
