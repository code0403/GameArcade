'use client';

import { useEffect } from "react";
import { socket } from "@/lib/socket";


export default function useSocket(eventHandler ={}) {
    useEffect(() => {
        socket.connect();

        for(const [event, handler] of Object.entries(eventHandler)){
            socket.on(event, handler);
        }

        return () => {
            for(const [event, handler] of Object.entries(eventHandler)){
                socket.off(event, handler);
            }
            socket.disconnect();
        };
        
    }, []);
}