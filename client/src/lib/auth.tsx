import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getTelegramUser } from "./telegram";
import type { User } from "@shared/schema";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function authenticate() {
            try {
                const tgUser = getTelegramUser();

                let telegramId = "mock_browser_id";
                let username = "Browser Admin";
                let firstName = "Browser";
                let lastName = "User";

                if (tgUser) {
                    telegramId = tgUser.id.toString();
                    username = tgUser.username || "Unknown";
                    firstName = tgUser.first_name;
                    lastName = tgUser.last_name || "";
                }

                const response = await fetch("/api/auth/telegram", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        telegramId,
                        username,
                        firstName,
                        lastName,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to authenticate with server");
                }

                const data = await response.json();
                setUser(data.user);
            } catch (err) {
                setError(err instanceof Error ? err : new Error("Unknown error"));
            } finally {
                setIsLoading(false);
            }
        }

        authenticate();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, error }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
