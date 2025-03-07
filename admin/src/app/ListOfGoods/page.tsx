'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from "../components/Nav";
import navStyles from '../styles/Nav.module.css';
import tableStyles from '../styles/Table.module.css';
// Define the type for a good
interface Good {
  id: number;
  name: string;
  size: string;
  weight: number;
  price: number;
  description: string;
  isVerified: boolean;
  image: { url: string } | null; // Assuming image is an object with a URL
  category: { name: string }; // Assuming category has a name
}

const ListOfGoods: React.FC = () => {
  const [goods, setGoods] = useState<Good[]>([]);

  useEffect(() => {
    const fetchGoods = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/goods'); // Fetching goods
        setGoods(response.data.data);
      } catch (error) {
        console.error('Error fetching goods:', error);
      }
    };

    fetchGoods();
  }, []);

  return (
    <div className={navStyles.layout}>
      <Nav />
      <div className={navStyles.mainContent}>
        <div className={tableStyles.container}>
          <h1>List of Goods</h1>
          <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Size</th>
            <th>Weight</th>
            <th>Price</th>
            <th>Description</th>
            <th>Image</th>
            <th>Category</th>
            <th>Verified</th>
          </tr>
        </thead>
        <tbody>
          {goods.map((good) => (
            <tr key={good.id}>
              <td>{good.id}</td>
              <td>{good.name}</td>
              <td>{good.size}</td>
              <td>{good.weight}</td>
              <td>{good.price}</td>
              <td>{good.description}</td>
              <td>{good.image ? <img src={good.image.url} alt={good.name} width="50" /> : 'No image'}</td>
              <td>{good.category.name}</td>
              <td>{good.isVerified ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>    
    </div>
  );
};

export default ListOfGoods;
