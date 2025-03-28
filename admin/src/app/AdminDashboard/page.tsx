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
import { useRouter } from 'next/navigation';
import { Ticket } from '../../types/Ticket'; // Import Ticket type

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
  const [goodPostData, setGoodPostData] = useState([]);
  const [ticketData, setTicketData] = useState<Ticket[]>([]);

  // Fetch user, service provider, and traveler data
  const [users, setUsers] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [travelers, setTravelers] = useState([]);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

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
          api.get('/api/promo-posts'),
          api.get('/api/payments'), // Added payments API call
          api.get('/api/tickets'), // Added tickets API call
          api.get('/api/goods') // Added goods API call
        ]);
        
        // Process results, using empty arrays if any request failed
        const [ordersResponse, requestsResponse, promoPostsResponse, paymentsResponse, ticketsResponse, goodsResponse] = fetchedData;
        
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

        // Set payments data and calculate total revenue
        if (paymentsResponse.status === 'fulfilled' && paymentsResponse.value.data?.data) {
          const paymentsData = paymentsResponse.value.data.data;
          try {
            // Calculate total revenue from all payments with additional error handling
            const totalRevenue = paymentsData.reduce((sum: number, payment: any) => {
              const amount = Number(payment.amount) || 0;
              return sum + amount;
            }, 0);
            setTotalRevenue(totalRevenue);
          } catch (reduceError) {
            console.error('Error calculating revenue:', reduceError);
            setTotalRevenue(0);
          }
        } else {
          console.warn('Payments API request failed, using default value');
          setTotalRevenue(0);
        }

        // Set tickets data
        if (ticketsResponse.status === 'fulfilled' && ticketsResponse.value.data?.data) {
          setTicketData(ticketsResponse.value.data.data);
        } else {
          console.warn('Tickets API request failed, using empty array');
          setTicketData([]);
        }
        
        // Set goods data
        if (goodsResponse.status === 'fulfilled' && goodsResponse.value.data?.data) {
          setGoodPostData(goodsResponse.value.data.data);
        } else {
          console.warn('Goods API request failed, using empty array');
          setGoodPostData([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set default empty arrays if the entire operation fails
        setOrderData([]);
        setRequestData([]);
        setPromoPostData([]);
        setTotalRevenue(0);
        setTicketData([]);
        setGoodPostData([]);
      }
    };

    fetchData();
  }, []);

  // Add state for metrics data
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [regularUsersCount, setRegularUsersCount] = useState(0);
  const [serviceProvidersCount, setServiceProvidersCount] = useState(0);
  const [travelersCount, setTravelersCount] = useState(0);
  
  // Add animated counters state
  const [animatedRevenue, setAnimatedRevenue] = useState(0);
  const [animatedTotalUsers, setAnimatedTotalUsers] = useState(0);
  const [animatedActivePercentage, setAnimatedActivePercentage] = useState(0);
  const [animatedProfitRate, setAnimatedProfitRate] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      // Set default fallback data
      let regularCount = 4;
      let providersCount = 1;
      let travelersCount = 1;
      let useDefaultData = true;
      
      try {
        // Check for admin token first
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          console.log('No admin token found, using sample data');
          setRegularUsersCount(regularCount);
          setServiceProvidersCount(providersCount);
          setTravelersCount(travelersCount);
          return;
        }
        
        // Try to get regular users directly
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await api.get('/api/users?role=USER', { 
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.data?.data) {
            regularCount = response.data.data.length;
            console.log(`Regular users found: ${regularCount}`);
            useDefaultData = false;
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log('Request for regular users timed out');
          } else {
            console.log('Could not fetch regular users data:', error.message);
          }
        }
        
        // Get service providers from the dedicated endpoint
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await api.get('/api/service-providers', { 
            signal: controller.signal 
          });
          
          clearTimeout(timeoutId);
          
          if (response.data?.data) {
            providersCount = response.data.data.length;
            console.log(`Service providers from API: ${providersCount}`);
            useDefaultData = false;
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log('Request for service providers timed out');
          } else {
            console.log('Could not fetch service providers data:', error.message);
          }
        }
        
        // Get travelers from the dedicated endpoint
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await api.get('/api/travelers', { 
            signal: controller.signal 
          });
          
          clearTimeout(timeoutId);
          
          if (response.data?.data) {
            travelersCount = response.data.data.length;
            console.log(`Travelers from API: ${travelersCount}`);
            useDefaultData = false;
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.log('Request for travelers timed out');
          } else {
            console.log('Could not fetch travelers data:', error.message);
          }
        }
        
        // Make sure we don't have zeros that would break the chart
        regularCount = Math.max(1, regularCount);
        providersCount = Math.max(1, providersCount);
        travelersCount = Math.max(1, travelersCount);
        
        // Set the counts from real data or fallbacks
        setRegularUsersCount(regularCount);
        setServiceProvidersCount(providersCount);
        setTravelersCount(travelersCount);
        
        if (useDefaultData) {
          console.log('Using default data for user distribution');
        } else {
          console.log(`Final data: ${regularCount} regular, ${providersCount} providers, ${travelersCount} travelers`);
        }
        
      } catch (error) {
        console.error('Error fetching user counts:', error);
        // Use default values if there was a catastrophic error
        setRegularUsersCount(regularCount);
        setServiceProvidersCount(providersCount);
        setTravelersCount(travelersCount);
      }
    };

    fetchCounts();
  }, []);

  // Calculate total users and active users whenever the individual counts change
  useEffect(() => {
    // Calculate total users
    const total = regularUsersCount + serviceProvidersCount + travelersCount;
    setTotalUsersCount(total);
    
    // Since we don't have real active user data anymore, use a more realistic estimate
    // Regular users typically have lower engagement
    const activeRegularUsers = Math.round(regularUsersCount * 0.15); 
    // Service providers are typically more active since they're running businesses
    const activeServiceProviders = Math.round(serviceProvidersCount * 0.4); 
    // Travelers have medium engagement
    const activeTravelers = Math.round(travelersCount * 0.25); 
    
    const totalActive = activeRegularUsers + activeServiceProviders + activeTravelers;
    setActiveUserCount(totalActive);
    
    // Log for debugging
    console.log(`User distribution: ${regularUsersCount} regular, ${serviceProvidersCount} providers, ${travelersCount} travelers`);
    console.log(`Estimated active users: ${totalActive} of ${total} (${Math.round((totalActive/total)*100)}%)`);
  }, [regularUsersCount, serviceProvidersCount, travelersCount]);

  // Format total revenue to display with 2 decimal places
  const formattedTotalRevenue = totalRevenue.toFixed(2);
  
  // Calculate active users percentage - make sure not to divide by zero
  const activeUserPercentage = totalUsersCount > 0 
    ? Math.min(100, Math.max(0, Math.round((activeUserCount / totalUsersCount) * 100)))
    : 0;

  // Add animation effects for the metrics
  useEffect(() => {
    // Reset animation complete flag when values change
    setAnimationComplete(false);
    
    // Animation duration in ms
    const duration = 1500;
    // Number of steps
    const steps = 20;
    // Time per step
    const stepTime = Math.floor(duration / steps);
    
    // Current step
    let currentStep = 0;
    
    // Target values
    const targetRevenue = totalRevenue;
    const targetTotalUsers = totalUsersCount;
    const targetActivePercentage = activeUserPercentage;
    const targetProfitRate = 6; // Fixed value
    
    // Reset animated values to 0
    setAnimatedRevenue(0);
    setAnimatedTotalUsers(0);
    setAnimatedActivePercentage(0);
    setAnimatedProfitRate(0);
    
    // Set up animation interval
    const timer = setInterval(() => {
      currentStep++;
      
      // Calculate current values based on easeOutQuad function
      const progress = currentStep / steps;
      // Using easeOutQuad for smoother animation: t * (2-t)
      const easedProgress = progress * (2 - progress);
      
      setAnimatedRevenue(Math.round((targetRevenue * easedProgress) * 100) / 100);
      setAnimatedTotalUsers(Math.round(targetTotalUsers * easedProgress));
      setAnimatedActivePercentage(Math.round(targetActivePercentage * easedProgress));
      setAnimatedProfitRate(Math.round(targetProfitRate * easedProgress));
      
      // Clear interval when animation is complete
      if (currentStep >= steps) {
        clearInterval(timer);
        // Set final values exactly
        setAnimatedRevenue(targetRevenue);
        setAnimatedTotalUsers(targetTotalUsers);
        setAnimatedActivePercentage(targetActivePercentage);
        setAnimatedProfitRate(targetProfitRate);
        setAnimationComplete(true);
      }
    }, stepTime);
    
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [totalRevenue, totalUsersCount, activeUserPercentage]);

  // Format animated revenue to display with 2 decimal places
  const formattedAnimatedRevenue = animatedRevenue.toFixed(2);

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
  const goodPostsByDate = aggregateDataByDate(goodPostData, 'createdAt');

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
      },
      {
        label: 'Good Posts',
        data: Object.values(goodPostsByDate),
        backgroundColor: '#00C49A' // A teal color for good posts
      }
    ]
  };

  // Sample data for the metrics
  // const metrics = {
  //   currentMRR: '12.4k',
  //   currentCustomers: '16,601',
  //   activeCustomers: '33%',
  //   churnRate: '2%'
  // };

  // Update pie chart data for user distribution
  const userChartData = {
    labels: [
      `Regular Users (${regularUsersCount})`,
      `Service Providers (${serviceProvidersCount})`,
      `Travelers (${travelersCount})`
    ],
    datasets: [{
      data: [
        // Ensure no zero values that might cause chart issues
        Math.max(1, regularUsersCount), 
        Math.max(1, serviceProvidersCount), 
        Math.max(1, travelersCount)
      ],
      backgroundColor: [
        '#018ABE', // --color-primary
        '#05AFF0', // --color-secondary
        '#3703C8'  // --color-dark
      ]
    }]
  };
  
  // Create posts distribution pie chart data
  const postsChartData = {
    labels: [
      `Orders (${orderData.length})`,
      `Requests (${requestData.length})`,
      `Promo Posts (${promoPostData.length})`,
      `Good Posts (${goodPostData.length})`
    ],
    datasets: [{
      data: [
        // Ensure no zero values that might cause chart issues
        Math.max(1, orderData.length),
        Math.max(1, requestData.length),
        Math.max(1, promoPostData.length),
        Math.max(1, goodPostData.length)
      ],
      backgroundColor: [
        '#018ABE', // Orders
        '#05AFF0', // Requests
        '#3703C8', // Promo Posts
        '#00C49A'  // Good Posts
      ]
    }]
  };

  // Transactions data
  const transactions = [
    { name: 'order', amount: '+$145' },
    { name: 'order2', amount: '+$90' },
    { name: 'order3', amount: '+$75' },
    { name: 'order4', amount: '+$68' }
  
  ];

  // // Support tickets data
  // const tickets = [
  //   { email: 'jessica.smith123@example.com', issue: 'Login Issue' },
  //   { email: 'david.jones456@gmail.com', issue: 'Billing Inquiry' },
  //   { email: 'emily.wilson789@hotmail.com', issue: 'Product Malfunction' },
  //   { email: 'andrew.johnson223@mybox.org', issue: 'Feature Request' }
  // ];

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

  // Add this helper function near the top of your component
  const formatCategory = (category: string) => {
    return category?.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'No category';
  };

  // Add state for card hover
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  // Define hover styles
  const getHoverStyles = (cardType: string) => {
    return hoveredCard === cardType ? {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease'
    } : {
      transition: 'all 0.3s ease'
    };
  };

  return (
    <div className={styles.dashboard}>
      <Nav />
      <div className={styles.content}>
        {/* Metrics Cards */}
        <div className={styles.metricsContainer}>
          <div 
            className={styles.metricCard}
            style={getHoverStyles('revenue')}
            onMouseEnter={() => setHoveredCard('revenue')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h3>Total Revenue</h3>
            <h2>${formattedAnimatedRevenue}</h2>
          </div>
          <div 
            className={styles.metricCard}
            style={getHoverStyles('users')}
            onMouseEnter={() => setHoveredCard('users')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h3>Total Users</h3>
            <h2>{animatedTotalUsers}</h2>
          </div>
          <div 
            className={styles.metricCard}
            style={getHoverStyles('active')}
            onMouseEnter={() => setHoveredCard('active')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h3>Active Users</h3>
            <h2>{animatedActivePercentage}%</h2>
          </div>
          <div 
            className={styles.metricCard}
            style={getHoverStyles('profit')}
            onMouseEnter={() => setHoveredCard('profit')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h3>Profit Rate</h3>
            <h2>{animatedProfitRate}%</h2>
          </div>
        </div>

        {/* Charts Section */}
        <div className={styles.chartsContainer} style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
          {/* Trend Chart */}
          <div 
            className={styles.chartCard}
            style={getHoverStyles('posts')}
            onMouseEnter={() => setHoveredCard('posts')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h3>Posts Overview</h3>
            <Bar data={barData} options={chartOptions} />
          </div>

          {/* User Chart */}
          <div 
            className={styles.chartCard} 
            style={{
              height: '250px',
              ...getHoverStyles('distribution')
            }}
            onMouseEnter={() => setHoveredCard('distribution')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h3>User Distribution</h3>
            <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pie data={userChartData} options={{
              ...chartOptions,
                maintainAspectRatio: true,
                responsive: true
            }} />
            </div>
          </div>

          {/* Transactions */}
          <div 
            className={styles.chartCard} 
            style={{
              position: 'relative',
              ...getHoverStyles('transactions')
            }}
            onMouseEnter={() => setHoveredCard('transactions')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h3>Transactions</h3>
            <div style={{ marginTop: '10px', marginBottom: '50px' }}>
              {transactions.map((transaction, index) => (
                <div key={index} className={styles.transactionItem}>
                  <span>{transaction.name}</span>
                  <span className={styles.amount}>{transaction.amount}</span>
                </div>
              ))}
            </div>
            <button 
              className={styles.viewAllButton}
              style={{ 
                position: 'absolute', 
                bottom: '15px', 
                left: '15px', 
                right: '15px', 
                width: 'calc(100% - 30px)'
              }}
            >
              View all transactions
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomContainer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {/* Support Tickets */}
          <div 
            className={styles.ticketsCard} 
            style={{ 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              minHeight: '470px',
              maxHeight: '470px',
              ...getHoverStyles('tickets')
            }}
            onMouseEnter={() => setHoveredCard('tickets')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h3>Support Tickets</h3>
            <div className={styles.ticketsList} style={{ 
              overflowY: 'auto', 
              flex: 1, 
              marginBottom: '50px' 
            }}>
              {ticketData.length > 0 ? (
                ticketData.slice(0, 4).map((ticket, index) => (
                <div key={index} className={styles.ticketItem}>
                    <span>{ticket.user?.email || 'No email'}</span>
                    <span>{formatCategory(ticket.category)}</span>
                </div>
                ))
              ) : (
                <div className={styles.noData}>No tickets available</div>
              )}
            </div>
            <button 
              className={styles.viewAllButton}
              onClick={() => router.push('/ListOfTickets')}
              style={{ 
                position: 'absolute', 
                bottom: '15px', 
                left: '15px', 
                right: '15px', 
                width: 'calc(100% - 30px)'
              }}
            >
              View all tickets
            </button>
          </div>

          {/* Customer Demographics Map */}
          <div 
            className={styles.mapCard} 
            style={{ 
              height: '100%',
              minHeight: '470px',
              maxHeight: '470px',
              display: 'flex',
              flexDirection: 'column',
              ...getHoverStyles('map')
            }}
            onMouseEnter={() => setHoveredCard('map')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h3>Customer Demographic</h3>
            <div style={{ flex: 1, position: 'relative' }}>
            <WorldMap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;