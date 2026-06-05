import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading){
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }} />
    );
  } 

  return (
    <Redirect href={user ? '/(traveler)/HomeScreen' : '/(auth)/WelcomeScreen'} />
  );
}
