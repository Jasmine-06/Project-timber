"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Socket } from "socket.io-client";
import { socketService } from "@/lib/socket";
import { useAuthStore } from "@/store/auth-store";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, isAuthenticated } = useAuthStore();
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // We only connect if the user is authenticated and has an ID
        if (isAuthenticated && user?._id) {
            const socketInstance = socketService.connect(user._id);
            setSocket(socketInstance);

            // Initial check
            setIsConnected(socketInstance.connected);

            function onConnect() {
                setIsConnected(true);
            }

            function onDisconnect() {
                setIsConnected(false);
            }

            socketInstance.on("connect", onConnect);
            socketInstance.on("disconnect", onDisconnect);

            return () => {
                socketInstance.off("connect", onConnect);
                socketInstance.off("disconnect", onDisconnect);
                // We don't necessarily want to disconnect hard here if we navigated pages, 
                // but if the component unmounts (e.g. logout), we might.
                // However, socketService handles singleton logic, so it's fine.
            };
        } else {
            // If not authenticated, disconnect
            socketService.disconnect();
            setSocket(null);
            setIsConnected(false);
        }
    }, [isAuthenticated, user?._id]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
