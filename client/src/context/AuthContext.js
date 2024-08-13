import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import Loading from "../pages/Loading";

export const Context = createContext();

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const values = {
    user,
    setUser,
    loading,
    setLoading,
  };

  return (
    <Context.Provider value={values}>
      {loading ? <Loading /> : children}
    </Context.Provider>
  );
};
export { AuthContext };
