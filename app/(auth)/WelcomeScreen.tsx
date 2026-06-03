import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Animated } from 'react-native';
import { useRef, useEffect } from 'react';


export default function WelcomeScreen() {
  const router = useRouter();
  const flyAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(flyAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  const translateX = flyAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 0], 
  });

  const translateY = flyAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const scale = flyAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.introSection}>
        <Animated.Text
          style={[
            styles.icon,
            {
              opacity: flyAnim,
              transform: [{ translateX}, {translateY}, {scale}],
            },
          ]}
        >
          ✈️
        </Animated.Text>

        <Text style={styles.title}>
          Personal Trip Planner
        </Text>

        <Text style={styles.subtitle}>
          Plan, organize, and remember{'\n'}every adventure.
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <Pressable
          style={styles.signUpBtn}
          onPress={() => router.push('/(auth)/SignUpScreen')}
        >
          <Text style={styles.signUpBtnText}>Get started</Text>
        </Pressable>

        <Pressable
          style={styles.logInBtn}
          onPress={() => router.push('/(auth)/LoginScreen')}
        >
          <Text style={styles.logInBtnText}>I already have an account</Text>
        </Pressable>

        <Text style={styles.terms}>
          By continuing you agree to our Terms of Service.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  introSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1A3C6B',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    gap: 10,
  },
  signUpBtn: {
    backgroundColor: '#185FA5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signUpBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logInBtn: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logInBtnText: {
    color: '#444',
    fontSize: 16,
  },
  terms: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
});