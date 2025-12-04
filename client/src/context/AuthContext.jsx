import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';


const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);


export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
const [token, setToken] = useState(localStorage.getItem('token'));


useEffect(() => {
if (token) localStorage.setItem('token', token);
else localStorage.removeItem('token');
}, [token]);


const login = (u, t) => {
setUser(u);
setToken(t);
};


const logout = () => {
setUser(null);
setToken(null);
};


const value = { user, token, login, logout };
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}