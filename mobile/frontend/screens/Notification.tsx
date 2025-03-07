// import React, { useEffect } from 'react';
// import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

// export const AppNotification: React.FC = () => {
//     // Function to request permission and get FCM token
//     const requestUserPermission = async (): Promise<void> => {
//         try {
//             const authStatus: number = await messaging().requestPermission();
//             const enabled: boolean =
//                 authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//                 authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//             if (enabled) {
//                 console.log('Authorization status:', authStatus);
//                 await getFcmToken();
//             }
//         } catch (error) {
//             console.error('Error requesting permission:', error);
//         }
//     };

//     const getFcmToken = async (): Promise<void> => {
//         try {
//             const token: string = await messaging().getToken();
//             console.log('FCM token:', token);
//         } catch (error) {
//             console.error('Error getting FCM token:', error);
//         }
//     };

//     useEffect(() => {
//         requestUserPermission();
//         const unsubscribe = messaging().onMessage(
//             async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
//                 console.log('Notification received in foreground:', remoteMessage);
//             }
//         );
//         return () => unsubscribe();
//     }, []);

//     return null;
// };
