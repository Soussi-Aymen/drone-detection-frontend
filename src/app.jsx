import React, { useState } from "react";
import { useThreatSystem } from "./hooks/useThreatSystem";
import { ControlPanel } from "./components/ControlPanel";
import { TacticalMap } from "./components/TacticalMap";

// Default radius if not set
const DEFAULT_RADIUS = 5000;

const App = () => {
  const {
    threatData,
    systemPos,
    setSystemPos,
    connectionStatus,
  } = useThreatSystem();

  const [radius, setRadius] = useState(DEFAULT_RADIUS);

  return (
    <div className="w-full bg-gray-900 text-white p-4 font-sans flex flex-col gap-4 min-h-screen md:h-screen md:overflow-hidden">
      {/* Header / Top Bar (Optional, can be inside the control panel) */}

      <div className="flex flex-col md:flex-row gap-4 h-full flex-grow md:overflow-hidden">

        <ControlPanel
          connectionStatus={connectionStatus}
          systemPos={systemPos}
          radius={radius}
          setRadius={setRadius}
          threatData={threatData}
        />

        <TacticalMap
          systemPos={systemPos}
          setSystemPos={setSystemPos}
          radius={radius}
          threatData={threatData}
        />

      </div>
    </div>
  );
};

export default App;
