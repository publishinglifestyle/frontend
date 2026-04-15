import { getSubscription } from "@/managers/subscriptionManager";
import { getProfilePic, getUser } from "@/managers/userManager";
import { IUser } from "@/types/user.types";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user?: IUser | null;
  profilePic?: string | null;
  subscription?: any;
  isImpersonating: boolean;
  refreshSubscription: () => Promise<void>;
  login: (token: string) => void;
  logout: () => void;
  impersonate: (token: string) => void;
  returnToAdmin: () => void;
  setProfilePic: Dispatch<SetStateAction<string | undefined>>;
}

const defaultPic = "./profile.png";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!Cookies.get("authToken")
  );
  const [user, setUser] = useState<IUser | null>(null);
  const [profilePic, setProfilePic] = useState<string | undefined>(defaultPic);
  const [subscription, setSubscription] = useState<any>(null);
  const [isImpersonating, setIsImpersonating] = useState<boolean>(
    !!Cookies.get("adminToken")
  );
  const [authRefreshKey, setAuthRefreshKey] = useState(0);
  const router = useRouter();

  const refreshSubscription = useCallback(async () => {
    try {
      const sub = await getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const token = Cookies.get("authToken");

    if (token) {
      const { exp } = jwtDecode<{ exp: number }>(token);
      const currentTime = Date.now() / 1000;

      if (exp < currentTime) {
        logout();
        router.push("/");
      } else {
        (async () => {
          try {
            const user = await getUser(true);
            setUser(user);
          } catch (error) {
            console.error(error);
          }

          try {
            const logo = await getProfilePic();
            setProfilePic(logo);
          } catch (error) {
            console.error(error);
          }

          try {
            const sub = await getSubscription();
            setSubscription(sub);
          } catch (error) {
            console.error(error);
          }
        })();
      }
    }
  }, [isAuthenticated, authRefreshKey]);

  const login = (token: string) => {
    Cookies.set("authToken", token);
    setIsAuthenticated(true);
  };

  const impersonate = (token: string) => {
    const currentToken = Cookies.get("authToken");
    if (currentToken) {
      Cookies.set("adminToken", currentToken);
    }
    Cookies.set("authToken", token);
    setUser(null);
    setIsImpersonating(true);
    setAuthRefreshKey((k) => k + 1);
  };

  const returnToAdmin = () => {
    const adminToken = Cookies.get("adminToken");
    if (adminToken) {
      Cookies.set("authToken", adminToken);
      Cookies.remove("adminToken");
      setUser(null);
      setIsImpersonating(false);
      setAuthRefreshKey((k) => k + 1);
    }
  };

  const logout = () => {
    setUser(null);
    setProfilePic(defaultPic);
    setSubscription(null);
    setIsImpersonating(false);
    Cookies.remove("authToken");
    Cookies.remove("adminToken");
    Cookies.remove("user_id");
    Cookies.remove("user_name");
    setIsAuthenticated(false);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        impersonate,
        returnToAdmin,
        isImpersonating,
        user,
        profilePic,
        setProfilePic,
        subscription,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
