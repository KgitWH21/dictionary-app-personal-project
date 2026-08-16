import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { userLogin, userRegister, userLogOut, userConfirmation } from "../api/utilities";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // on mount, ask the server if a valid cookie already exists
    useEffect(() => {
        const checkAuth = async () => {
            const currentUser = await userConfirmation();
            setUser(currentUser);
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = useCallback(async (username, password) => {
        const loggedIn = await userLogin(username, password);
        setUser(loggedIn);
        return loggedIn;
    }, []);

    const register = useCallback(async (userObj) => {
        const created = await userRegister(userObj);
        setUser(created);
        return created;
    }, []);

    const logout = useCallback(async () => {
        await userLogOut();
        setUser(null);
    }, []);

    const value = { user, loading, login, register, logout };

    return <AuthContext.Provider value={value}>
             {children}
           </AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);