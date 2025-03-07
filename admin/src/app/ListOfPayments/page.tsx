'use client'
import React, { useEffect, useState } from 'react';
import Nav from "../components/Nav";
import navStyles from '../styles/Nav.module.css';
import tableStyles from '../styles/Table.module.css';
// Define the type for a payment
interface Payment {
    id: number;
    orderId: number;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
}

const ListOfPayments: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]); // Declare the type for state

    useEffect(() => {
        const fetchPayments = async () => {
            const response = await fetch('http://localhost:5000/api/payments');
            const data = await response.json();
            if (data.success) {
                setPayments(data.data);
            }
        };

        fetchPayments();
    }, []);

    return (
        <div className={navStyles.layout}>
            <Nav />
            <div className={navStyles.mainContent}>
                <div className={tableStyles.container}>
                    <h1>List of Payments</h1>
                    <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Order ID</th>
                        <th>Amount</th>
                        <th>Currency</th>
                        <th>Status</th>
                        <th>Payment Method</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr key={payment.id}>
                            <td>{payment.id}</td>
                            <td>{payment.orderId}</td>
                            <td>{payment.amount}</td>
                            <td>{payment.currency}</td>
                            <td>{payment.status}</td>
                            <td>{payment.paymentMethod}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
                            </div>
            </div>
        </div>  
    );
};

export default ListOfPayments; 