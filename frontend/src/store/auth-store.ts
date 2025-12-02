import { create } from "zustand";
import { setCookie, getCookie } from "cookies-next/client";


interface AuthStore {
    isAuthenticated : boolean,
    user: IUser | null,
    setLogin : (data: ILoginResponse) => void,
    setLogout : () => void,
    setUser : (user : IUser) => void
}

const useAuthStore = create<AuthStore>() (
    (set) => {
        const token = getCookie("auth_token") as string | null ;
        return {
            isAuthenticated : !!token,
            user : null,
            setLogin : (data : ILoginResponse) => {

                setCookie("auth_token", data.access_token);
                set(() => ({
                    isAuthenticated: true,
                    user: data.user
                }))
            },
            setLogout: () => {
                setCookie("auth_token", '');
                set(() => ({
                    isAuthenticated: false,
                    user: null
                }))
            },
            setUser : (user : IUser) => {
                set(() => ({
                    user : user
                }))
            }
        }
    }


) 

export { useAuthStore };

// {access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7I…zI5fQ.jKtJIpNkEZgWLPUHTEob-TLJQLhlXJz3Gf2VtqFm3-4', user: {…}, message: 'User LoggedIn Successfully!'}
