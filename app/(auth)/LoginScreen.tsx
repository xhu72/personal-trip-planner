import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  async function handleLogin() {
    if (!email.trim() || !password) {
      alert('Please enter your email and password.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // router.replace('/(traveler)/HomeScreen');
    } catch {
      alert('Email or password is incorrect.');
    }
  }

  function togglePassword() {
    if (showPassword === true) {
      setShowPassword(false);
    } else {
      setShowPassword(true);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle= {styles.containerContent}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <Text style={styles.title}>
          Welcome back
        </Text>
        <Text style={styles.subTitle}>
          Sign in to your account
        </Text>

        <Text style={styles.label}>
          Email
        </Text>

        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>
          Password
        </Text>

        <View style={styles.passwordGroup}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            textContentType="password"
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={styles.eyeBtn}
            onPress={togglePassword}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#888"
            />
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/(auth)/ForgotPasswordScreen')}>
          <Text style={styles.forgotText}>
            Forgot password?
          </Text>
        </Pressable>

        <Pressable style={styles.signInBtn} onPress={handleLogin}>
          <Text style={styles.signInBtnText}>Sign in</Text>
        </Pressable>

        <View style={styles.signupRow}>
          <Text style={styles.subTitle}>
            No account? 
          </Text>

          <Pressable onPress={() => router.push('/(auth)/SignUpScreen')}>
            <Text style={styles.link}>
              Sign up
            </Text>
          </Pressable>
        </View>

      </ScrollView >
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  containerContent: { 
    flex: 1, 
    paddingHorizontal: 24, 
    paddingTop: 16, 
  },
  backIcon: { 
    fontSize: 20, 
    color: 'black', 
    marginBottom: 24,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#1A3C6B', 
    marginBottom: 4,
  },
  subTitle: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 24, 
  },
  label: { 
    fontSize: 13, 
    fontWeight: '500', 
    color: '#444', 
    marginBottom: 6, 
  },
  input: {
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    marginBottom: 16,
  },
  passwordGroup: {
    position: 'relative',
    marginBottom: 24,
  },
  passwordInput: {
    paddingRight: 44,
    marginBottom: 0,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 4,
  },
  forgotText: {
    fontSize: 13,
    color: '#185FA5',    
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  signInBtn: {
    backgroundColor: '#185FA5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  signInBtnText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600',
  },
  disabled: { 
    opacity: 0.6, 
  },
  signupRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 8,
  },
  link: { 
    color: '#185FA5', 
    fontSize: 13, 
    fontWeight: '500', 
  },
});