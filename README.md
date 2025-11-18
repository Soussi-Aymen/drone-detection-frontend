# drone-detection-frontend

🗺️ Tactical Human-Machine Interface (HMI): drone-detection-frontend

This repository contains the single-page application (SPA) frontend for the Counter-UAS (C-UAS) system. It serves as the primary operator interface for real-time situational awareness and threat visualization.

It is built using and React.js with TypeScript.

🎯 Key Responsibilities

Real-Time Visualization: Renders a tactical map displaying the system's location, the maximum detection range (5 KM), and current threat tracks.

Real-Time Communication: Establishes and maintains a WebSocket connection to the drone-detection-backend server to ingest live threat updates.

Responsive Design: Optimized for mobile and tablet screens, adhering to HMI best practices (low cognitive load, high contrast).

📊 Visualization Features

Tactical Map: Displays geolocation of the operator and active threats.

Threat Markers: Dynamically updated icons representing drone threats, showing real-time position and velocity.

Situational Awareness Dashboard: Presents critical metrics in an overlay:

Distance to Threat

Bearing/Direction

Threat Classification (e.g., FPV, Rotary)

📦 Tech Stack

⚛️ Framework: Next.js / React.js

💻 Language: TypeScript

📍 Map/Geo-Spatial: React-compatible Map Library (e.g., React-Leaflet or Mapbox GL)

📡 Real-time Client: WebSocket Client (socket.io-client or similar)

💡 Quick Start

To launch the HMI client:

Clone the repository:

git clone https://github.com/Soussi-Aymen/drone-detection-frontend.git


Install dependencies:

npm install


Start the development server:

npm start

Prerequisite: Ensure the drone-detection-backend server is running to populate the map with live threat data.