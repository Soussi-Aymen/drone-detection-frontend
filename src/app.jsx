import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import {
  MapPin,
  Target,
  Shield,
  Radar,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

/**
 * --- CONFIGURATION ---
 */
const BACKEND_URL = "http://localhost:3001";
const THREAT_UPDATE_CHANNEL = "threatUpdate";
const SYSTEM_UPDATE_CHANNEL = "systemUpdate";
const GEOSPATIAL_GEO_URL =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";
const MAX_DETECTION_RANGE_M = 5000;

/**
 * --- TYPES (JSDoc for TypeScript checking in .jsx files) ---
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

/**
 * Moves a point given a starting position, bearing, and distance (meters).
 * @param {number} lat
 * @param {number} lng
 * @param {number} bearing degrees
 * @param {number} distanceM meters
 * @returns {IGeoPosition}
 */
const movePoint = (lat, lng, bearing, distanceM) => {
  const R = 6371e3; // Earth's radius in meters
  const angularDistance = distanceM / R;
  const bearingRad = (bearing * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lng * Math.PI) / 180;

  const newLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
      Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearingRad),
  );

  let newLonRad =
    lonRad +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(newLatRad),
    );

  newLonRad = ((newLonRad + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

  return {
    lat: (newLatRad * 180) / Math.PI,
    lng: (newLonRad * 180) / Math.PI,
  };
};

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

const App = () => {
  // typed socket state for JS files using JSDoc type import
  /** @type {[import("socket.io-client").Socket|null, Function]} */
  const [socket, setSocket] = useState(
    /** @type {import("socket.io-client").Socket|null} */ (null),
  );

  /** @type {[IThreatUpdatePayload|null, Function]} */
  const [threatData, setThreatData] = useState(
    /** @type {IThreatUpdatePayload|null} */ (null),
  );

  /** @type {[IGeoPosition, Function]} */
  const [systemPos, setSystemPos] = useState(
    /** @type {IGeoPosition} */ ({ lat: 52.52, lng: 13.4 }),
  );

  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  // --- Report system position to backend if socket available
  const reportSystemPosition = useCallback(() => {
    if (socket?.connected) {
      if (navigator && navigator.geolocation && navigator.geolocation.getCurrentPosition) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setSystemPos(newPos);
            socket?.emit(SYSTEM_UPDATE_CHANNEL, newPos);
          },
          (error) => {
            console.warn("Geolocation failed, using last-known/default position:", error);
            // Send last-known systemPos (state) if available
            socket?.emit(SYSTEM_UPDATE_CHANNEL, systemPos);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
        );
      } else {
        // Fallback: emit existing systemPos if geolocation not available
        socket?.emit(SYSTEM_UPDATE_CHANNEL, systemPos);
      }
    }
  }, [socket, systemPos]);

  // periodically report system position
  useEffect(() => {
    if (socket?.connected) {
      reportSystemPosition();
      const interval = setInterval(reportSystemPosition, 5000);
      return () => clearInterval(interval);
    }
    // if socket becomes available later, effect will rerun
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

    newSocket.on(THREAT_UPDATE_CHANNEL, /** @param {IThreatUpdatePayload} payload */ (payload) => {
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
    // empty deps: we only want to create socket once on mount
  }, []);

  // --- Render helpers ---
  const threatTrack = threatData?.threatTrack ?? null;
  const threatPos = threatTrack?.position ?? null;
  const isThreatActive = !!threatTrack;

  /**
  * @param {number | undefined} bearing
  * @returns {string}
  */

  const getRotationStyle = (bearing) => {
    // defend against undefined bearing
    const b = typeof bearing === "number" ? bearing : 0;
    return `rotate(${b}deg)`;
  };

const calculateRangeCirclePoints = useCallback(
  /**
   * @param {IGeoPosition} center
   * @returns {Array<[number, number]>}
   */
  (center) => {
    /** @type {Array<[number, number]>} */
    const points = [];
    const numSegments = 36;

    for (let i = 0; i < 360; i += 360 / numSegments) {
      const { lat, lng } = movePoint(
        center.lat,
        center.lng,
        i,
        MAX_DETECTION_RANGE_M
      );
      points.push([lng, lat]);
    }

    return points;
  },
  []
);

  const rangeCirclePoints = calculateRangeCirclePoints(systemPos);

  return (
    <>
      <style>
        {`
          @keyframes ping-slow {
            0%,100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.6); opacity: 0.08; }
          }
          .animate-ping-slow-manual {
            animation: ping-slow 2s cubic-bezier(0,0,0.2,1) infinite;
          }
        `}
      </style>

      <div className="min-h-screen bg-gray-900 text-white p-4 font-sans flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3 flex flex-col gap-4">
          <div className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-2">
              <h2 className="text-xl font-bold text-indigo-400 flex items-center">
                <Radar className="mr-2 h-5 w-5" /> C2 System Status
              </h2>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  connectionStatus === "Connected"
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
              WebSocket connection status with the threat simulation engine.
            </p>
          </div>

          <div className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-sky-400 border-b border-gray-700 pb-2 mb-3 flex items-center">
              <Shield className="mr-2 h-5 w-5" /> C-UAS System Position
            </h3>
            <div className="space-y-1 text-sm">
              <p className="flex justify-between">
                <span className="text-gray-400">Latitude:</span>
                <span className="font-mono text-gray-200">
                  {systemPos.lat.toFixed(4)}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Longitude:</span>
                <span className="font-mono text-gray-200">
                  {systemPos.lng.toFixed(4)}
                </span>
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-800 rounded-lg shadow-xl flex-grow border border-gray-700">
            <h3
              className={`text-lg font-semibold border-b border-gray-700 pb-2 mb-3 flex items-center ${
                isThreatActive ? "text-red-500" : "text-gray-500"
              }`}
            >
              <AlertTriangle
                className={`mr-2 h-5 w-5 ${isThreatActive ? "animate-pulse" : ""}`}
              />{" "}
              Threat Track Data
            </h3>

            {isThreatActive && threatTrack ? (
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-400">Track ID:</span>
                  <span className="font-mono text-red-300">{threatTrack.trackId}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Classification:</span>
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
                <p className="flex justify-between">
                  <span className="text-gray-400">Distance (Rel.):</span>
                  <span className="font-mono text-red-300">{formatDistance(threatTrack.distance)}</span>
                </p>
                <p className="flex justify-between items-center">
                  <span className="text-gray-400">Bearing (Rel.):</span>
                  <span className="font-mono text-red-300 flex items-center">
                    {Number.isFinite(threatTrack.bearing)
                      ? threatTrack.bearing.toFixed(2)
                      : "0"}
                    °
                    <ArrowUpRight
                      className="ml-2 w-4 h-4 text-red-500"
                      style={{
                        transform: getRotationStyle(threatTrack.bearing),
                      }}
                    />
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Last Update:</span>
                  <span className="font-mono text-gray-400">
                    {threatTrack.lastUpdateTime
                      ? new Date(threatTrack.lastUpdateTime).toLocaleTimeString()
                      : "N/A"}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No Active Threat Detected (Radar Warm-up or Clear).
              </p>
            )}
          </div>
        </div>

        <div className="md:w-2/3 bg-gray-800 rounded-lg shadow-xl p-2 relative min-h-[500px] md:min-h-full">
          <h2 className="text-xl font-bold text-indigo-400 p-2 border-b border-gray-700 mb-2">
            Tactical Map View
          </h2>

          <ComposableMap
            projection="geoMercator"
            height={600}
            className="w-full h-full"
            style={{ width: "100%", height: "90%" }}
          >
            <ZoomableGroup center={[systemPos.lng, systemPos.lat]} zoom={40} minZoom={5} maxZoom={50}>
              <Geographies geography={GEOSPATIAL_GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#2d2d30"
                      stroke="#4a4b50"
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#3f4045", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {rangeCirclePoints.length > 0 && (
                <g>
                  <path
                    d={`M ${rangeCirclePoints[0].join(" ")} L ${rangeCirclePoints
                      .map((p) => p.join(" "))
                      .join(" ")} Z`}
                    fill="none"
                    stroke="#5D9CEC"
                    strokeWidth="2"
                    strokeOpacity="0.8"
                    strokeDasharray="8, 8"
                  >
                    <title>5 KM Maximum Detection Range</title>
                  </path>
                </g>
              )}

              <Marker coordinates={[systemPos.lng, systemPos.lat]}>
                <g className="cursor-pointer">
                  <MapPin className="text-sky-400" size={32} />
                  <text x="0" y="-18" className="text-xs font-semibold fill-sky-400 text-shadow-md" textAnchor="middle">
                    C-UAS
                  </text>
                </g>
              </Marker>

              {isThreatActive && threatPos && threatTrack && (
                <Marker coordinates={[threatPos.lng, threatPos.lat]}>
                  <g>
                    {/* SVG-based ping circle (valid inside SVG) */}
                    <circle r={18} cx={0} cy={0} className="animate-ping-slow-manual" fill="rgba(239,68,68,0.18)" />

                    {/* Main threat marker triangle */}
                    <polygon
                      points="0,-15 15,15 -15,15"
                      fill="#ff0000"
                      stroke="#ffcccc"
                      strokeWidth="2"
                      style={{
                        transform: getRotationStyle(threatTrack.bearing),
                        transformOrigin: "center",
                        transition: "transform 0.2s",
                      }}
                      className="shadow-2xl"
                    />

                    {/* optional icon centered */}
                    <g transform="translate(-16,-16)">
                      <Target size={32} />
                    </g>

                    <text x="0" y="30" className="text-xs font-semibold fill-red-400 text-shadow-md" textAnchor="middle">
                      Track {threatTrack.trackId}
                    </text>
                  </g>
                </Marker>
              )}
            </ZoomableGroup>
          </ComposableMap>

          <p className="text-xs text-gray-500 text-center pt-2">
            Map is centered on the C-UAS System Position. Zoom in/out or drag to explore.
          </p>
        </div>
      </div>
    </>
  );
};

export default App;
