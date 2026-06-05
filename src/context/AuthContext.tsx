import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
/*
  const auth = {
    listeners: [] as ((user: User | null) => void)[],
  };

  function onAuthStateChanged(
    auth: { listeners: ((user: User | null) => void)[] },
    callback: (user: User | null) => void
  ) {
    auth.listeners.push(callback);
    return function unsubscribe() {
      auth.listeners = auth.listeners.filter((l) => l !== callback);
    };
  }

  useEffect(() => {
    const callback = (firebaseUser: User | null) => {
      setUser(firebaseUser);
      setLoading(false);
    };

    // onAuthStateChanged:
    // 1. pushes callback into auth.listeners:starts listening
    // 2. returns unsubscribe function       :to stop later
    const unsubscribe = onAuthStateChanged(auth, callback);

    // React stores this and calls it on unmount
    return unsubscribe; 
  }, []);
*/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}