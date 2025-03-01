// App.tsx (or your screen component)

import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import TicketCard from '@/components/TicketCard';

export function AppTickets() {
    // Sample data for tickets
    const tickets = [
        {
            ticketId: '12345',
            title: 'Issue with Login',
            status: 'Open',
            priority: 'High',
            createdDate: 'Feb 25, 2025',
            description: 'User is unable to login due to an invalid password error.',
        },
        {
            ticketId: '12346',
            title: 'App Crashing on Startup',
            status: 'In Progress',
            priority: 'Medium',
            createdDate: 'Feb 24, 2025',
            description: 'App crashes every time it is opened after the latest update.',
        },
        {
            ticketId: '12347',
            title: 'UI Glitch on Profile Page',
            status: 'Closed',
            priority: 'Low',
            createdDate: 'Feb 23, 2025',
            description: 'Minor visual bug in the profile page UI elements.',
        },
    ];

    const handleViewDetails = (ticketId: string) => {
        console.log(`View details for Ticket ${ticketId}`);
    };

    return (
        <ScrollView style={styles.container}>
            {tickets.map((ticket) => (
                <TicketCard
                    key={ticket.ticketId}
                    ticketId={ticket.ticketId}
                    title={ticket.title}
                    status="Open"
                    priority="High"
                    createdDate={ticket.createdDate}
                    description={ticket.description}
                    onPressDetails={() => handleViewDetails(ticket.ticketId)}
                />
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
});

