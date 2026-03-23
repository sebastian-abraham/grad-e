import { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider } from "../config/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const response = await fetch("http://localhost:5000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firebaseUid: user.uid,
              email: user.email,
              displayName: user.displayName,
            }),
          });
          
          if (response.ok) {
            const dbUser = await response.json();
            setCurrentUser(dbUser);
          } else {
            await signOut(auth);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Failed to restore session from DB", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Now sync with our backend
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }),
      });

      if (!response.ok) {
        // e.g. 403 Forbidden (email not found)
        await signOut(auth);
        throw new Error("Account not authorized. Please contact an admin.");
      }

      const dbUser = await response.json();
      setCurrentUser(dbUser);
      return dbUser;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
