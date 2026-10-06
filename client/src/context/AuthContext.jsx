import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // ===============================
  // USER STATE
  // ===============================
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("staysphere_user");

      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("USER STORAGE ERROR:", error);

      localStorage.removeItem("staysphere_user");

      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // ===============================
  // CHECK AUTH ON APP LOAD
  // ===============================
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("staysphere_token");

      // No token → user is not logged in
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        const loggedInUser =
          response.data?.user || response.data;

        setUser(loggedInUser);

        localStorage.setItem(
          "staysphere_user",
          JSON.stringify(loggedInUser)
        );
      } catch (error) {
        console.error(
          "AUTH CHECK ERROR:",
          error.response?.data || error.message
        );

        // Remove invalid/expired authentication
        localStorage.removeItem("staysphere_token");
        localStorage.removeItem("staysphere_user");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ===============================
  // LOGIN
  // ===============================
  const login = async (data) => {
    try {
      const response = await api.post(
        "/auth/login",
        data
      );

      console.log(
        "LOGIN RESPONSE:",
        response.data
      );

      const token = response.data?.token;
      const loggedInUser = response.data?.user;

      // Make sure backend returned token
      if (!token) {
        throw new Error(
          "Login failed: token was not received from server."
        );
      }

      // Make sure backend returned user
      if (!loggedInUser) {
        throw new Error(
          "Login failed: user data was not received from server."
        );
      }

      // Save token
      localStorage.setItem(
        "staysphere_token",
        token
      );

      // Save user
      localStorage.setItem(
        "staysphere_user",
        JSON.stringify(loggedInUser)
      );

      // Update React state
      setUser(loggedInUser);

      return response.data;
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error.response?.data || error.message
      );

      throw error;
    }
  };

  // ===============================
  // REGISTER
  // ===============================
  const register = async (data) => {
    try {
      const response = await api.post(
        "/auth/register",
        data
      );

      console.log(
        "REGISTER RESPONSE:",
        response.data
      );

      const token = response.data?.token;
      const registeredUser = response.data?.user;

      // Make sure backend returned token
      if (!token) {
        throw new Error(
          "Registration failed: token was not received from server."
        );
      }

      // Make sure backend returned user
      if (!registeredUser) {
        throw new Error(
          "Registration failed: user data was not received from server."
        );
      }

      // Save token
      localStorage.setItem(
        "staysphere_token",
        token
      );

      // Save user
      localStorage.setItem(
        "staysphere_user",
        JSON.stringify(registeredUser)
      );

      // Update React state
      setUser(registeredUser);

      return response.data;
    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error.response?.data || error.message
      );

      throw error;
    }
  };

  // ===============================
  // LOGOUT
  // ===============================
  const logout = () => {
    localStorage.removeItem(
      "staysphere_token"
    );

    localStorage.removeItem(
      "staysphere_user"
    );

    setUser(null);
  };

  // ===============================
  // AUTH LOADING
  // ===============================
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        Loading StaySphere...
      </div>
    );
  }

  // ===============================
  // PROVIDER
  // ===============================
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ===============================
// useAuth HOOK
// ===============================
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

export default AuthContext;