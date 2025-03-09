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
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user?: IUser | null;
  profilePic?: string | null;
  login: (token: string) => void;
  logout: () => void;
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
  const router = useRouter();

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
        })();
      }
    }
  }, [isAuthenticated]);

  const login = (token: string) => {
    Cookies.set("authToken", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setProfilePic(defaultPic);
    Cookies.remove("authToken");
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
        user,
        profilePic,
        setProfilePic,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
