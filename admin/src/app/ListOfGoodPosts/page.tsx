'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Define the type for a goods post
interface GoodsPost {
  id: number;
  title: string;
  content: string;
  arrivalDate: string | null;
  availableKg: number | null;
  phoneNumber: string | null;
  airportLocation: string | null;
  traveler: {
    id: number;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  category: {
    id: number;
    name: string;
  } | null;
}

const ListOfGoodPosts: React.FC = () => {
  const [goodsPosts, setGoodsPosts] = useState<GoodsPost[]>([]);

  useEffect(() => {
    const fetchGoodsPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/goods-posts');
        setGoodsPosts(response.data.data);
      } catch (error) {
        console.error('Error fetching goods posts:', error);
      }
    };

    fetchGoodsPosts();
  }, []);

  return (
    <div>
      <h1>List of Goods Posts</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Content</th>
            <th>Traveler</th>
            <th>Arrival Date</th>
            <th>Available Kg</th>
            <th>Phone Number</th>
            <th>Airport Location</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {goodsPosts.map((post) => (
            <tr key={post.id}>
              <td>{post.id}</td>
              <td>{post.title}</td>
              <td>{post.content}</td>
              <td>{post.traveler.profile.firstName} {post.traveler.profile.lastName}</td>
              <td>{post.arrivalDate ? new Date(post.arrivalDate).toLocaleDateString() : 'N/A'}</td>
              <td>{post.availableKg !== null ? post.availableKg : 'N/A'}</td>
              <td>{post.phoneNumber || 'N/A'}</td>
              <td>{post.airportLocation || 'N/A'}</td>
              <td>{post.category ? post.category.name : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListOfGoodPosts;
