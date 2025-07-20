import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  hasValidMembership: boolean;
  login: (user: User, hasValidMembership: boolean) => void;
  logout: () => void;
  updateMembership: (hasValidMembership: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hasValidMembership, setHasValidMembership] = useState(false);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem("user");
    const storedMembership = localStorage.getItem("hasValidMembership");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setHasValidMembership(storedMembership === "true");
    }
  }, []);

  const login = (user: User, hasValidMembership: boolean) => {
    setUser(user);
    setHasValidMembership(hasValidMembership);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("hasValidMembership", hasValidMembership.toString());
  };

  const logout = () => {
    setUser(null);
    setHasValidMembership(false);
    localStorage.removeItem("user");
    localStorage.removeItem("hasValidMembership");
  };

  const updateMembership = (hasValidMembership: boolean) => {
    setHasValidMembership(hasValidMembership);
    localStorage.setItem("hasValidMembership", hasValidMembership.toString());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        hasValidMembership,
        login,
        logout,
        updateMembership,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
