import HomeScreen from '../screens/HomeScreen';
import { Grid } from '../constants/Grid';
import { Colors } from '../constants/Colors';
import { StyleSheet } from 'react-native';
import { Posts } from '../components/posts';
import RootLayout from './_layout';
import Login from "./auth/login"
// Example usage in styles
// const styles = StyleSheet.create({
//   container: {
//     padding: Grid.padding.horizontal,
//     backgroundColor: Colors.light.background,
//   },
//   card: {
//     borderRadius: Grid.card.borderRadius,
//     padding: Grid.card.padding,
//     marginBottom: Grid.spacing.md,
//   },
// });
export default function Index() {
  return <Login />;
}
