import React from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import QnASection from '../components/QnASection';
import styles from '../components/style/Home.module.css'; // Create a CSS module for styles

const Home = () => {
  return (
    <div className={styles.home}>
      <Nav />
      <main>
        <h1>Welcome to Wassalha</h1>
        {/* Add main content here */}
        <QnASection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;