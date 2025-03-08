'use client'
import React, { useEffect, useState } from 'react';
import Nav from "../components/Nav";
import navStyles from '../styles/Nav.module.css';
import tableStyles from '../styles/Table.module.css';
import { Payment } from '../types/Payment';


const ListOfPayments: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [displayedPayments, setDisplayedPayments] = useState<Payment[]>([]);
    const [currentCount, setCurrentCount] = useState(5);
    const [isShowingAll, setIsShowingAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [methodFilter, setMethodFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [currencyFilter, setCurrencyFilter] = useState("ALL");
    const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);

    const filterAndSortPayments = (payments: Payment[]) => {
        return payments
            .filter((payment) => {
                const searchMatch = searchTerm.toLowerCase() === '' || 
                    payment.orderId.toString().includes(searchTerm.toLowerCase());

                const statusMatch = statusFilter === "ALL" || payment.status === statusFilter;
                const methodMatch = methodFilter === "ALL" || payment.paymentMethod === methodFilter;
                const currencyMatch = currencyFilter === "ALL" || payment.currency === currencyFilter;

                return searchMatch && statusMatch && methodMatch && currencyMatch;
            })
            .sort((a, b) => {
                return sortOrder === 'desc' ? b.id - a.id : a.id - b.id;
            });
    };

    useEffect(() => {
        const fetchPayments = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments`);
            const data = await response.json();
            if (data.success) {
                // Extract unique currencies from payments
                const currencies = [...new Set(data.data.map((payment: Payment) => payment.currency))];
                setAvailableCurrencies(currencies as string[]);
                
                const filtered = filterAndSortPayments(data.data);
                setPayments(data.data);
                setDisplayedPayments(filtered.slice(0, 5));
                setIsShowingAll(filtered.length <= 5);
            }
        };

        fetchPayments();
    }, [searchTerm, statusFilter, methodFilter, currencyFilter, sortOrder]);

    const handleSeeMore = () => {
        if (isShowingAll) {
            setDisplayedPayments(payments.slice(0, 5));
            setCurrentCount(5);
            setIsShowingAll(false);
        } else {
            const nextCount = currentCount + 5;
            const nextPayments = payments.slice(0, nextCount);
            setDisplayedPayments(nextPayments);
            setCurrentCount(nextCount);
            setIsShowingAll(nextCount >= payments.length);
        }
    };

    return (
        <div className={navStyles.layout}>
            <Nav />
            <div className={navStyles.mainContent}>
                <div className={tableStyles.container}>
                    <h1>List of Payments</h1>

                    {/* Search and Filter Controls */}
                    <div className={tableStyles.controls}>
                        <div className={tableStyles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Search by order ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={tableStyles.searchInput}
                            />
                        </div>
                        <div className={tableStyles.filterContainer}>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={tableStyles.filterSelect}
                            >
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="FAILED">Failed</option>
                                <option value="REFUND">Refund</option>
                            </select>

                            <select
                                value={currencyFilter}
                                onChange={(e) => setCurrencyFilter(e.target.value)}
                                className={tableStyles.filterSelect}
                            >
                                <option value="ALL">All Currencies</option>
                                {availableCurrencies.map((currency) => (
                                    <option key={currency} value={currency}>
                                        {currency}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                className={tableStyles.filterSelect}
                            >
                                <option value="ALL">All Payment Methods</option>
                                <option value="CARD">Card</option>
                                <option value="PAYPAL">PayPal</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                            </select>

                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                                className={tableStyles.filterSelect}
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    <table className={tableStyles.table}>
                        <thead>
                            <tr>
                                <th className={tableStyles.th}>ID</th>
                                <th className={tableStyles.th}>Order ID</th>
                                <th className={tableStyles.th}>Amount</th>
                                <th className={tableStyles.th}>Currency</th>
                                <th className={tableStyles.th}>Status</th>
                                <th className={tableStyles.th}>Payment Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedPayments.map((payment) => (
                                <tr key={payment.id} className={tableStyles.tr}>
                                    <td className={tableStyles.td}>{payment.id}</td>
                                    <td className={tableStyles.td}>{payment.orderId}</td>
                                    <td className={tableStyles.td}>{payment.amount}</td>
                                    <td className={tableStyles.td}>{payment.currency}</td>
                                    <td className={tableStyles.td}>
                                        <span className={`${tableStyles.badge} ${tableStyles[`badge${payment.status}`]}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className={tableStyles.td}>{payment.paymentMethod}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {payments.length > 5 && (
                        <div className={tableStyles.seeMoreContainer}>
                            <button 
                                className={tableStyles.seeMoreButton}
                                onClick={handleSeeMore}
                            >
                                {isShowingAll ? 'See Less' : 'See More'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>  
    );
};

export default ListOfPayments; 