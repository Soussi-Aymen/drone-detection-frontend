import React from "react";
import {
    Shield,
    Radar,
    AlertTriangle,
    ArrowUpRight,
    Settings
} from "lucide-react";

/**
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

/**
 * Converts meters to kilometers and formats to two decimal places.
 * @param {number | null | undefined} meters
 * @returns {string}
 */
const formatDistance = (meters) => {
    if (meters === undefined || meters === null || Number.isNaN(meters))
        return "N/A";
    return `${(meters / 1000).toFixed(2)} km`;
};

/**
 * @param {number | undefined} bearing
 * @returns {string}
 */
const getRotationStyle = (bearing) => {
    const b = typeof bearing === "number" ? bearing : 0;
    return `rotate(${b}deg)`;
};

/**
 * @param {Object} props
 * @param {string} props.connectionStatus
 * @param {IGeoPosition} props.systemPos
 * @param {number} props.radius
 * @param {Function} props.setRadius
 * @param {IThreatUpdatePayload | null} props.threatData
 */
export const ControlPanel = ({
    connectionStatus,
    systemPos,
    radius,
    setRadius,
    threatData
}) => {
    const threatTrack = threatData?.threatTrack ?? null;
    const isThreatActive = !!threatTrack;

    return (
        <div className="w-full order-2 md:order-1 md:w-1/3 lg:w-1/4 flex flex-col gap-4 md:overflow-y-auto md:pr-2">

            {/* Status Box */}
            <div className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 shrink-0">
                <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-2">
                    <h2 className="text-xl font-bold text-indigo-400 flex items-center">
                        <Radar className="mr-2 h-5 w-5" /> C2 System
                    </h2>
                    <span
                        className={`text-sm font-medium px-3 py-1 rounded-full ${connectionStatus === "Connected"
                            ? "bg-green-600"
                            : connectionStatus === "Connecting..."
                                ? "bg-yellow-600"
                                : "bg-red-600"
                            }`}
                    >
                        {connectionStatus}
                    </span>
                </div>
                <p className="text-sm text-gray-400">
                    WebSocket Status: {connectionStatus}
                </p>
            </div>

            {/* System Position Box */}
            <div className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 shrink-0">
                <h3 className="text-lg font-semibold text-sky-400 border-b border-gray-700 pb-2 mb-3 flex items-center">
                    <Shield className="mr-2 h-5 w-5" /> System Position
                </h3>
                <div className="space-y-1 text-sm bg-gray-900 p-2 rounded border border-gray-700 font-mono text-gray-300">
                    <div>Lat: {systemPos.lat.toFixed(5)}</div>
                    <div>Lng: {systemPos.lng.toFixed(5)}</div>
                </div>
            </div>

            {/* Radius Control Box */}
            <div className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700 shrink-0">
                <h3 className="text-lg font-semibold text-green-400 border-b border-gray-700 pb-2 mb-3 flex items-center">
                    <Settings className="mr-2 h-5 w-5" /> Radius Control
                </h3>
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-300 flex justify-between">
                        <span>Detection Range</span>
                        <span className="font-mono">{radius} m</span>
                    </label>
                    <input
                        type="range"
                        min="1000"
                        max="100000"
                        step="100"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => setRadius(5000)}
                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded border border-gray-600"
                        >
                            5km
                        </button>
                        <button
                            onClick={() => setRadius(10000)}
                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded border border-gray-600"
                        >
                            10km
                        </button>
                        <button
                            onClick={() => setRadius(50000)}
                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded border border-gray-600"
                        >
                            50km
                        </button>
                    </div>
                </div>
            </div>

            {/* Threat Data Box */}
            <div className="p-4 bg-gray-800 rounded-lg shadow-xl flex-grow border border-gray-700 overflow-y-auto min-h-[200px]">
                <h3
                    className={`text-lg font-semibold border-b border-gray-700 pb-2 mb-3 flex items-center ${isThreatActive ? "text-red-500" : "text-gray-500"
                        }`}
                >
                    <AlertTriangle
                        className={`mr-2 h-5 w-5 ${isThreatActive ? "animate-pulse" : ""}`}
                    />{" "}
                    Active Threat
                </h3>

                {isThreatActive && threatTrack ? (
                    <div className="space-y-3 text-sm">
                        <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
                            <p className="flex justify-between border-b border-red-500/30 pb-1 mb-1">
                                <span className="text-gray-400">ID:</span>
                                <span className="font-mono text-red-300 font-bold">{threatTrack.trackId}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-400">Type:</span>
                                <span className="font-mono text-red-300">{threatTrack.classification}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-400">Confidence:</span>
                                <span className="font-mono text-red-300">
                                    {Number.isFinite(threatTrack.confidence)
                                        ? `${threatTrack.confidence.toFixed(0)}%`
                                        : "N/A"}
                                </span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-900 p-2 rounded border border-gray-700">
                                <div className="text-xs text-gray-500">Distance</div>
                                <div className="text-red-400 font-mono font-bold text-lg">{formatDistance(threatTrack.distance)}</div>
                            </div>
                            <div className="bg-gray-900 p-2 rounded border border-gray-700">
                                <div className="text-xs text-gray-500">Bearing</div>
                                <div className="text-red-400 font-mono font-bold text-lg flex items-center gap-1">
                                    {Number.isFinite(threatTrack.bearing) ? threatTrack.bearing.toFixed(1) : "0"}°
                                    <ArrowUpRight
                                        className="w-4 h-4"
                                        style={{ transform: getRotationStyle(threatTrack.bearing) }}
                                    />
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 text-right">
                            Updated: {threatTrack.lastUpdateTime
                                ? new Date(threatTrack.lastUpdateTime).toLocaleTimeString()
                                : "N/A"}
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-10 opacity-50">
                        NO ACTIVE THREATS
                    </p>
                )}
            </div>
        </div>
    );
};
