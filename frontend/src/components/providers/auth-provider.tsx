"use client";

import { UserActions } from "@/api-actions/user-actions";
import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function AuthProvider({ children} : {children: React.ReactNode}) {
    const {setLogin, setLogout , setUser} = useAuthStore(); 
    const {data , isLoading, isError, error} = useQuery({
        queryKey: ["current_user"],
        queryFn: () => UserActions.GetCurrentUserAction(),
        refetchOnWindowFocus: false,
        retry: false,
    });

    useEffect(() => {
        if(!isLoading && data) {
            setUser(data)
        }
    }, [data, isLoading])

    useEffect(() => {
        if(error && isError) {
            setLogout();
        }
    }, [error, isError])

    return (
        <>
            {children}
        </>
    )
}