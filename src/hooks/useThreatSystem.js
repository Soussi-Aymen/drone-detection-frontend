import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = "http://localhost:3001";
const THREAT_UPDATE_CHANNEL = "threatUpdate";
const SYSTEM_UPDATE_CHANNEL = "systemUpdate";

/**
 * --- TYPES (JSDoc for TypeScript checking in .js files) ---
 *
 * @typedef {{ lat: number, lng: number }} IGeoPosition
 * @typedef {{
 *   trackId: number,
 *   position: IGeoPosition,
 *   bearing: number,
 *   distance: number,
 *   classification: string,
 *   confidence: number,
 *   lastUpdateTime: number
 * }} IThreatTrack
 * @typedef {{ systemPosition: IGeoPosition, threatTrack: IThreatTrack | null }} IThreatUpdatePayload
 */

export const useThreatSystem = () => {
    /** @type {[import("socket.io-client").Socket|null, Function]} */
    const [socket, setSocket] = useState(null);

    /** @type {[IThreatUpdatePayload|null, Function]} */
    const [threatData, setThreatData] = useState(null);

    /** @type {[IGeoPosition, Function]} */
    const [systemPos, setSystemPos] = useState({ lat: 52.52, lng: 13.4 });

    const [connectionStatus, setConnectionStatus] = useState("Connecting...");

    // --- Report system position to backend if socket available
    const reportSystemPosition = useCallback(() => {
        if (socket?.connected) {
            socket.emit(SYSTEM_UPDATE_CHANNEL, systemPos);
        }
    }, [socket, systemPos]);

    // periodically report system position
    useEffect(() => {
        if (socket?.connected) {
            reportSystemPosition();
            const interval = setInterval(reportSystemPosition, 5000);
            return () => clearInterval(interval);
        }
    }, [socket, reportSystemPosition]);

    // --- Socket initialization ---
    useEffect(() => {
        console.log(`Attempting to connect to WebSocket at ${BACKEND_URL}`);
        const newSocket = io(BACKEND_URL, {
            transports: ["websocket"],
            reconnection: true,
        });

        newSocket.on("connect", () => {
            setConnectionStatus("Connected");
            console.log("Socket Connected:", newSocket.id);
        });

        newSocket.on("disconnect", () => {
            setConnectionStatus("Disconnected");
            console.warn("Socket Disconnected");
        });

        newSocket.on("connect_error", (err) => {
            setConnectionStatus("Error");
            console.error("Socket connection error:", err);
        });

        newSocket.on(THREAT_UPDATE_CHANNEL, /** @param {IThreatUpdatePayload} payload */(payload) => {
            setThreatData(payload);
        });

        setSocket(newSocket);

        return () => {
            try {
                newSocket.close();
            } catch (e) {
                console.warn("Error closing socket:", e);
            }
        };
    }, []);

    return {
        socket,
        threatData,
        systemPos,
        setSystemPos,
        connectionStatus,
        isConnected: socket?.connected ?? false
    };
};
