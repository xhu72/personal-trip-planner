import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  function validate(): string | null {
    if (!name.trim()) return 'Please enter your name.';
    if (!email.trim()) return 'Please enter your email.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirm) return 'Passwords do not match.';
    return null;
  }

  async function handleSignUp() {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        email: email.trim(),
        profilePhoto: null,
        language: 'en',
        createdAt: new Date(),
      });
      // router.replace('/(traveler)/HomeScreen');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        alert('That email is already registered.');
      } else {
        alert('Could not create account. Please try again.');
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.containerContent} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subTitle}>Start planning your trips</Text>

        <Text style={styles.label}>Full name</Text>
        <TextInput
          style={styles.input}
          placeholder="Xiling Hu"
          autoCapitalize="words"
          textContentType="name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          textContentType="newPassword"
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Confirm password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          textContentType="password"
          value={confirm}
          onChangeText={setConfirm}
        />

        <Pressable style={styles.signUpBtn} onPress={handleSignUp}>
          <Text style={styles.signUpBtnText}>Create account</Text>
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={styles.subTitle}>Have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/LoginScreen')}>
            <Text style={styles.signInLink}>Sign in</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
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
  signUpBtn: {
    backgroundColor: '#185FA5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  signUpBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  signInLink: {
    color: '#185FA5',
    fontSize: 13,
    fontWeight: '500',
  },
});
