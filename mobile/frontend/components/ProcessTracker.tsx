import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProcessStatus } from '@/types';

interface ProcessTrackerProps {
  currentStatus: ProcessStatus;
  events: Array<{
    fromStatus: ProcessStatus;
    toStatus: ProcessStatus;
    createdAt: string;
    note?: string;
    changedByUser?: {
      name: string;
    };
  }>;
}

const ProcessTracker: React.FC<ProcessTrackerProps> = ({ currentStatus, events }) => {
  const statusOrder = [
    'INITIALIZED',
    'CONFIRMED',
    'PAID',
    'IN_TRANSIT',
    'PICKUP_MEET',
    'FINALIZED'
  ];
  
  const getStatusLabel = (status: ProcessStatus) => {
    switch (status) {
      case 'INITIALIZED': return 'Initialized';
      case 'CONFIRMED': return 'Confirmed';
      case 'PAID': return 'Paid';
      case 'IN_TRANSIT': return 'In Transit';
      case 'PICKUP_MEET': return 'Ready for Pickup';
      case 'FINALIZED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };
  
  const getStatusColor = (status: ProcessStatus) => {
    switch (status) {
      case 'INITIALIZED': return '#3b82f6'; // blue
      case 'CONFIRMED': return '#8b5cf6'; // purple
      case 'PAID': return '#10b981'; // green
      case 'IN_TRANSIT': return '#f97316'; // orange
      case 'PICKUP_MEET': return '#eab308'; // yellow
      case 'FINALIZED': return '#14b8a6'; // teal
      case 'CANCELLED': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };
  
  const currentStatusIndex = statusOrder.indexOf(currentStatus);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Progress</Text>
      
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        {statusOrder.map((status, index) => {
          const isActive = index <= currentStatusIndex && currentStatus !== 'CANCELLED';
          const isCurrentStatus = status === currentStatus;
          
          return (
            <View key={status} style={styles.statusStep}>
              <View style={[
                styles.statusDot,
                { backgroundColor: isActive ? getStatusColor(status as ProcessStatus) : '#e2e8f0' },
                isCurrentStatus && styles.currentStatusDot
              ]} />
              
              {index < statusOrder.length - 1 && (
                <View style={[
                  styles.statusLine,
                  { backgroundColor: index < currentStatusIndex ? getStatusColor(status as ProcessStatus) : '#e2e8f0' }
                ]} />
              )}
              
              <Text style={[
                styles.statusLabel,
                { color: isActive ? getStatusColor(status as ProcessStatus) : '#94a3b8' },
                isCurrentStatus && styles.currentStatusLabel
              ]}>
                {getStatusLabel(status as ProcessStatus)}
              </Text>
            </View>
          );
        })}
      </View>
      
      {/* Status history */}
      {events.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Status History</Text>
          
          {events.map((event, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyDot} />
              <View style={styles.historyContent}>
                <Text style={styles.historyStatus}>
                  {getStatusLabel(event.toStatus)}
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(event.createdAt).toLocaleString()}
                </Text>
                {event.note && (
                  <Text style={styles.historyNote}>{event.note}</Text>
                )}
                {event.changedByUser && (
                  <Text style={styles.historyUser}>
                    Updated by {event.changedByUser.name}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusStep: {
    flex: 1,
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    zIndex: 1,
  },
  currentStatusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  statusLine: {
    position: 'absolute',
    top: 6,
    right: '50%',
    left: '50%',
    height: 2,
    backgroundColor: '#e2e8f0',
  },
  statusLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    color: '#94a3b8',
  },
  currentStatusLabel: {
    fontWeight: 'bold',
  },
  historyContainer: {
    marginTop: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginTop: 6,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  historyNote: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  historyUser: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
});

export default ProcessTracker;
