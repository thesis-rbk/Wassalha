'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from "../components/Nav";
import navStyles from '../styles/Nav.module.css';
import tableStyles from '../styles/Table.module.css';
// Define the type for a promo post
interface PromoPost {
  id: number;
  title: string;
  content: string;
  publisher: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
}

const ListOfPromoPosts: React.FC = () => {
  const [promoPosts, setPromoPosts] = useState<PromoPost[]>([]);

  useEffect(() => {
    const fetchPromoPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/promo-posts');
        setPromoPosts(response.data.data);
      } catch (error) {
        console.error("Error fetching promo posts:", error);
      }
    };

    fetchPromoPosts();
  }, []);

  return (
    <div className={navStyles.layout}>
      <Nav />
      <div className={navStyles.mainContent}>
        <div className={tableStyles.container}>
          <h1>List of Promo Posts</h1>
          <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Content</th>
            <th>Publisher</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {promoPosts.map((promoPost) => (
            <tr key={promoPost.id}>
              <td>{promoPost.id}</td>
              <td>{promoPost.title}</td>
              <td>{promoPost.content}</td>
              <td>{promoPost.publisher.profile.firstName} {promoPost.publisher.profile.lastName}</td>
              <td>{new Date(promoPost.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      </div>
    </div>
  );
};

export default ListOfPromoPosts;
