import React from 'react';
import styles from '../styles/WorldMap.module.css';
import Image from 'next/image';

const WorldMap: React.FC = () => {
  return (
    <div className={styles.worldMapContainer}>
      <Image 
        src="/images/"
        alt="World Map" 
        layout="fill"
        objectFit="contain"
        className={styles.worldMap}
        priority
      />
    </div>
  );
};

export default WorldMap;