'use client'
import React, { useEffect, useState } from 'react';
import Nav from "../../components/Nav";
import navStyles from '../../styles/Nav.module.css';
import tableStyles from '../../styles/Table.module.css';
import { Payment } from '../../types/Payment';
import api from '../../lib/api';
import Image from 'next/image';

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
    const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const filterAndSortPayments = (payments: Payment[]) => {
        return payments
            .filter((payment) => {
                const searchMatch = searchTerm.toLowerCase() === '' || 
                    payment.orderId.toString().includes(searchTerm.toLowerCase()) ||
                    (payment.transactionId && payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));

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
            setIsLoading(true);
            setError(null);

            try {
                const response = await api.get('/api/payments');
                
                if (response.status === 200 && response.data && response.data.data) {
                    const paymentsData = response.data.data;
                    
                    // Extract unique currencies from payments
                    const currencies = [...new Set(paymentsData.map((payment: Payment) => payment.currency))];
                    setAvailableCurrencies(currencies as string[]);
                    
                    // Apply filters
                    setPayments(paymentsData);
                    const filtered = filterAndSortPayments(paymentsData);
                    setDisplayedPayments(filtered.slice(0, 5));
                    setIsShowingAll(filtered.length <= 5);
                } else {
                    console.error('Invalid response format:', response);
                    setError('Failed to fetch payment data. Please try again later.');
                }
            } catch (error) {
                console.error('Error fetching payments:', error);
                setError('An error occurred while fetching payments. Please try again later.');
                setPayments([]);
                setDisplayedPayments([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPayments();
    }, []);

    // Apply filters when filter states change
    useEffect(() => {
        if (payments.length > 0) {
            const filtered = filterAndSortPayments(payments);
            setDisplayedPayments(filtered.slice(0, currentCount));
            setIsShowingAll(currentCount >= filtered.length);
        }
    }, [searchTerm, statusFilter, methodFilter, currencyFilter, sortOrder, currentCount, payments]);

    const handleSeeMore = () => {
        if (isShowingAll) {
            setDisplayedPayments(payments.slice(0, 5));
            setCurrentCount(5);
            setIsShowingAll(false);
        } else {
            const nextCount = currentCount + 5;
            const filtered = filterAndSortPayments(payments);
            const nextPayments = filtered.slice(0, nextCount);
            setDisplayedPayments(nextPayments);
            setCurrentCount(nextCount);
            setIsShowingAll(nextCount >= filtered.length);
        }
    };

    // Map status to appropriate badge class
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'PENDING':
                return tableStyles.badgePENDING;
            case 'COMPLETED':
                return tableStyles.badgeCOMPLETED;
            case 'FAILED':
                return tableStyles.badgeFAILED;
            case 'REFUND':
                return tableStyles.badgeREFUND;
            case 'PROCCESSING':
                return tableStyles.badgePROCCESSING;
            default:
                return '';
        }
    };

    // Handle QR code click to view larger
    const handleQrCodeClick = (qrCode: string) => {
        setSelectedQrCode(qrCode);
    };

    // Close QR code modal
    const closeQrCodeModal = () => {
        setSelectedQrCode(null);
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
                                placeholder="Search by order ID or transaction ID..."
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
                                <option value="PROCCESSING">Processing</option>
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
                                <option value="D17">D17</option>
                                <option value="STRIPE">Stripe</option>
                                <option value="PAYPAL">PayPal</option>
                                <option value="BANKTRANSFER">Bank Transfer</option>
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

                    {isLoading ? (
                        <div className={tableStyles.loading}>Loading payments data...</div>
                    ) : error ? (
                        <div className={tableStyles.error}>{error}</div>
                    ) : (
                        <>
                            <table className={tableStyles.table}>
                                <thead>
                                    <tr>
                                        <th className={tableStyles.th}>ID</th>
                                        <th className={tableStyles.th}>Order ID</th>
                                        <th className={tableStyles.th}>Transaction ID</th>
                                        <th className={tableStyles.th}>Amount</th>
                                        <th className={tableStyles.th}>Currency</th>
                                        <th className={tableStyles.th}>Status</th>
                                        <th className={tableStyles.th}>Payment Method</th>
                                        <th className={tableStyles.th}>Payment URL</th>
                                        <th className={tableStyles.th}>QR Code</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedPayments.length > 0 ? (
                                        displayedPayments.map((payment) => (
                                            <tr key={payment.id} className={tableStyles.tr}>
                                                <td className={tableStyles.td}>{payment.id}</td>
                                                <td className={tableStyles.td}>{payment.orderId}</td>
                                                <td className={tableStyles.td}>{payment.transactionId || 'N/A'}</td>
                                                <td className={tableStyles.td}>{payment.amount}</td>
                                                <td className={tableStyles.td}>{payment.currency}</td>
                                                <td className={tableStyles.td}>
                                                    <span className={`${tableStyles.badge} ${getStatusBadgeClass(payment.status)}`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className={tableStyles.td}>{payment.paymentMethod}</td>
                                                <td className={tableStyles.td}>
                                                    {payment.paymentUrl ? (
                                                        <a 
                                                            href={payment.paymentUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className={tableStyles.linkText}
                                                        >
                                                            View Payment
                                                        </a>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </td>
                                                <td className={tableStyles.td}>
                                                    {payment.qrCode ? (
                                                        <div className={tableStyles.qrCodeContainer}>
                                                            <img 
                                                                src={payment.qrCode} 
                                                                alt="QR Code" 
                                                                className={tableStyles.qrCode}
                                                                onClick={() => handleQrCodeClick(payment.qrCode as string)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className={tableStyles.noData}>No payments found</td>
                                        </tr>
                                    )}
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
                        </>
                    )}

                    {/* QR Code Modal */}
                    {selectedQrCode && (
                        <div className={tableStyles.modalOverlay} onClick={closeQrCodeModal}>
                            <div className={tableStyles.qrCodeModal} onClick={e => e.stopPropagation()}>
                                <img 
                                    src={selectedQrCode} 
                                    alt="QR Code" 
                                    className={tableStyles.qrCodeLarge}
                                />
                                <button 
                                    className={tableStyles.closeModalButton}
                                    onClick={closeQrCodeModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>  
    );
};

export default ListOfPayments;