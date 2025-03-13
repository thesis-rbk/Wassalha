// import React from "react";
// import { View, Text, StyleSheet } from "react-native";
// import { useAuth } from "@/hooks/useAuth";
// import { useRoleDetection } from "@/hooks/useRoleDetection";

// export default function RoleTest() {
//   const { user } = useAuth();
//   const { role, loading } = useRoleDetection(
//     user?.id ? parseInt(user.id) : undefined
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Role Detection Test</Text>

//       {loading ? (
//         <Text style={styles.loading}>Detecting role...</Text>
//       ) : (
//         <>
//           <Text style={styles.info}>
//             User ID: {user?.id || "Not logged in"}
//           </Text>
//           <Text style={styles.info}>Detected Role: {role}</Text>

//           <View style={styles.roleCard}>
//             <Text style={styles.roleTitle}>What this means:</Text>
//             {role === "SHOPPER" && (
//               <Text style={styles.roleDescription}>
//                 You are a Shopper. You can create orders for travelers to
//                 fulfill.
//               </Text>
//             )}
//             {role === "TRAVELER" && (
//               <Text style={styles.roleDescription}>
//                 You are a Traveler. You can find orders to deliver while
//                 traveling.
//               </Text>
//             )}
//             {role === "BOTH" && (
//               <Text style={styles.roleDescription}>
//                 You are both a Shopper and a Traveler. You can create orders and
//                 deliver for others.
//               </Text>
//             )}
//             {role === "NONE" && (
//               <Text style={styles.roleDescription}>
//                 You haven't created any orders or registered as a traveler yet.
//               </Text>
//             )}
//           </View>
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   loading: {
//     fontSize: 18,
//     color: "#666",
//   },
//   info: {
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   roleCard: {
//     width: "100%",
//     padding: 20,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 10,
//     marginTop: 20,
//   },
//   roleTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   roleDescription: {
//     fontSize: 16,
//     lineHeight: 24,
//   },
// });
