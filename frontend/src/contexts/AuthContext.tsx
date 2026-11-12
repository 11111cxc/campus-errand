import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { AuthPayload, PublicUser } from '../../../shared/types/users';

const TOKEN_KEY = 'token';
const USER_KEY = 'authUser';

interface AuthContextType {
  isAuthenticated: boolean | null;
  user: PublicUser | null;
  token: string | null;
  login: (payload: AuthPayload) => void;
  logout: () => void;
  refresh: () => Promise<void>;
  authFetch: (input: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredUser(): PublicUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as PublicUser) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<PublicUser | null>(() => readStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() =>
    localStorage.getItem(TOKEN_KEY) ? null : false,
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const login = useCallback((payload: AuthPayload) => {
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
    setIsAuthenticated(true);
  }, []);

  const refresh = useCallback(async () => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setIsAuthenticated(false);
      return;
    }
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${stored}` },
      });
      const data = await response.json();
      if (data?.success && data.data?.user) {
        setUser(data.data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
        setToken(stored);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, [logout]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const authFetch = useCallback(async (input: string, init: RequestInit = {}) => {
    const stored = localStorage.getItem(TOKEN_KEY);
    const headers = new Headers(init.headers || {});
    headers.set('Content-Type', 'application/json');
    if (stored) headers.set('Authorization', `Bearer ${stored}`);
    return fetch(input, { ...init, headers });
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, token, login, logout, refresh, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
