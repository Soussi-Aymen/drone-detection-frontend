import React, { useMemo, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Circle, Marker } from "@react-google-maps/api";
import { AlertTriangle } from "lucide-react";

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
 * @param {Object} props
 * @param {IGeoPosition} props.systemPos
 * @param {Function} props.setSystemPos
 * @param {number} props.radius
 * @param {IThreatUpdatePayload | null} props.threatData
 */
export const TacticalMap = ({
    systemPos,
    setSystemPos,
    radius,
    threatData
}) => {
    // Google Maps Loader
    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    });

    const threatTrack = threatData?.threatTrack ?? null;
    const threatPos = threatTrack?.position ?? null;
    const isThreatActive = !!threatTrack;

    /** @param {google.maps.Map} map */
    const onLoad = useCallback((map) => {
        // mapRef ref logic removed as it was unused and causing lint errors
    }, []);

    const onUnmount = useCallback(() => {
        // mapRef logic removed
    }, []);

    /** @param {google.maps.MapMouseEvent} e */
    const handleMapClick = useCallback((e) => {
        if (e.latLng) {
            const newPos = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            };
            setSystemPos(newPos);
        }
    }, [setSystemPos]);

    const circleOptions = useMemo(() => ({
        strokeColor: "#5D9CEC",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#5D9CEC",
        fillOpacity: 0.1,
        clickable: false,
        draggable: false,
        editable: false,
        visible: true,
        radius: radius,
        zIndex: 1
    }), [radius]);

    if (loadError) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-gray-900 text-white p-4">
                <div className="text-center p-6 bg-gray-800 rounded-lg border border-red-500">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-bold mb-2">Google Maps Error</h2>
                    <p className="text-gray-300">{loadError.message}</p>
                    <p className="text-sm text-gray-500 mt-4">
                        Check your VITE_GOOGLE_MAPS_API_KEY environment variable.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full order-1 md:order-2 h-[500px] md:h-full md:flex-1 flex flex-col bg-gray-800 rounded-lg p-1 border border-gray-700 relative shrink-0">
            {!isLoaded ? (
                <div className="flex-grow flex items-center justify-center text-gray-400 animate-pulse">
                    Loading Maps... (Verify API Key)
                </div>
            ) : (
                <GoogleMap
                    mapContainerClassName="full-size-map"
                    center={systemPos}
                    zoom={12}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={handleMapClick}
                    options={{
                        styles: [ // Dark mode style
                            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                            {
                                featureType: "administrative.locality",
                                elementType: "labels.text.fill",
                                stylers: [{ color: "#d59563" }],
                            },
                            {
                                featureType: "poi",
                                elementType: "labels.text.fill",
                                stylers: [{ color: "#d59563" }],
                            },
                            {
                                featureType: "poi.park",
                                elementType: "geometry",
                                stylers: [{ color: "#263c3f" }],
                            },
                            {
                                featureType: "poi.park",
                                elementType: "labels.text.fill",
                                stylers: [{ color: "#6b9a76" }],
                            },
                            {
                                featureType: "road",
                                elementType: "geometry",
                                stylers: [{ color: "#38414e" }],
                            },
                            {
                                featureType: "road",
                                elementType: "geometry.stroke",
                                stylers: [{ color: "#212a37" }],
                            },
                            {
                                featureType: "road",
                                elementType: "labels.text.fill",
                                stylers: [{ color: "#9ca5b3" }],
                            },
                            {
                                featureType: "road.highway",
                                elementType: "geometry",
                                stylers: [{ color: "#746855" }],
                            },
                            {
                                featureType: "road.highway",
                                elementType: "geometry.stroke",
                                stylers: [{ color: "#1f2835" }],
                            },
                            {
                                featureType: "road.highway",
                                elementType: "labels.text.fill",
                                stylers: [{ color: "#f3d19c" }],
                            },
                            {
                                featureType: "transit",
                                elementType: "geometry",
                                stylers: [{ color: "#2f3948" }],
                            },
                            {
                                featureType: "transit.station",
                                elementType: "labels.text.fill",
                                stylers: [{ color: "#d59563" }],
                            },
                            {
                                featureType: "water",
                                elementType: "geometry",
                                stylers: [{ color: "#17263c" }],
                            },
                            {
                                featureType: "water",
                                elementType: "labels.text.fill",
                                stylers: [{ color: "#515c6d" }],
                            },
                            {
                                featureType: "water",
                                elementType: "labels.text.stroke",
                                stylers: [{ color: "#17263c" }],
                            },
                        ],
                        disableDefaultUI: false,
                        streetViewControl: false,
                        mapTypeControl: true,
                    }}
                >
                    {/* System Position Marker (Center) */}
                    <Marker
                        position={systemPos}
                        label={{
                            text: "C-UAS",
                            color: "#00BFFF",
                            fontWeight: "bold"
                        }}
                    />

                    {/* Radius Circle */}
                    <Circle options={circleOptions} center={systemPos} />

                    {/* Threat Marker */}
                    {isThreatActive && threatPos && (
                        <Marker
                            position={threatPos}
                            icon={{
                                path: window.google?.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                scale: 6,
                                fillColor: "red",
                                fillOpacity: 1,
                                strokeColor: "white",
                                strokeWeight: 2,
                                rotation: threatTrack?.bearing ?? 0
                            }}
                            label={{
                                text: `T-${threatTrack.trackId}`,
                                color: "white",
                                fontWeight: "bold",
                                className: "bg-red-600 px-1 rounded"
                            }}
                        />
                    )}
                </GoogleMap>
            )}
        </div>
    );
};
