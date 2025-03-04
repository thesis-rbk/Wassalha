"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import styles from "../styles/UserRoleChart.module.css"; // Import the CSS module

ChartJS.register(ArcElement, Tooltip, Legend);

const UserRoleChart: React.FC = () => {
  const data = {
    labels: ["Clients", "Travelers", "Service Providers"],
    datasets: [
      {
        data: [50, 30, 20],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)", // Clients
          "rgba(153, 102, 255, 0.6)", // Travelers
          "rgba(255, 159, 64, 0.6)",   // Service Providers
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: { label: string; raw: number }) => {
            return `${tooltipItem.label}: ${tooltipItem.raw}%`;
          },
        },
      },
    },
    cutout: "70%", // Makes it a donut chart
  };

  return (
    
      <div className={styles.chartContainer}>
        <Doughnut data={data} options={options} />
      </div>
    
  );
};

export default UserRoleChart; 