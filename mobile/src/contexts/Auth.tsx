import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  deleteToken as ssDelete,
  getToken as ssGet,
  saveToken as ssSave,
} from "../services/auth";

type AuthCtx = {
  token: string | null;
  loading: boolean;
  loginWithToken: (t: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};
const Ctx = createContext<AuthCtx>({} as any);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await ssGet();
        setToken(t ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loginWithToken(t: string) {
    await ssSave(t);
    setToken(t);
  }
  async function logout() {
    await ssDelete();
    setToken(null);
  }

  return (
    <Ctx.Provider
      value={{
        token,
        loading,
        loginWithToken,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
