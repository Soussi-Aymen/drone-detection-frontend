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

⚛️ Framework: React.js (Vite)

💻 Language: TypeScript / JavaScript

📍 Map/Geo-Spatial: Google Maps API (@react-google-maps/api)

🪝 State Management: Custom React Hooks (e.g., useThreatSystem)

📡 Real-time Client: WebSocket Client (socket.io-client or similar)

💡 Quick Start

To launch the HMI client:

Clone the repository:

```bash
git clone https://github.com/Soussi-Aymen/drone-detection-frontend.git
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Prerequisite: Ensure the drone-detection-backend server is running to populate the map with live threat data.

## 🐳 Docker Support

To run the application in a production-ready container:

1.  **Build the image**:
    ```bash
    docker build -t drone-detection-frontend .
    ```

2.  **Run the container**:
    ```bash
    docker run -p 5173:5173 drone-detection-frontend
    ```

3.  **Access**: Open [http://localhost:5173](http://localhost:5173)