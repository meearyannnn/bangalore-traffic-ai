# 🚦 Bangalore Traffic AI

An AI-powered real-time traffic intelligence system for Bangalore, featuring congestion prediction, hotspot detection, multi-modal route planning, and live vehicle detection using YOLOv8.

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Object%20Detection-red)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [ML Models](#-ml-models)
- [Data Sources](#-data-sources)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔬 Research Focus — Unsupervised Clustering for Traffic Analysis

This project is built on a **research-driven approach** using unsupervised clustering algorithms to extract actionable insights from raw traffic data:

- **DBSCAN (Density-Based Spatial Clustering of Applications with Noise)** — Used to identify traffic congestion **hotspots** by detecting dense clusters of high-traffic GPS points without requiring a predefined number of clusters. DBSCAN naturally handles noise and discovers arbitrarily shaped congestion zones across Bangalore's road network.

- **K-Means Clustering** — Used to segment Bangalore into distinct **traffic zones** based on traffic volume, average speed, and geographic proximity. This enables zone-level congestion monitoring and region-wise traffic pattern analysis.

Together, these two complementary clustering techniques form the analytical backbone of the system — DBSCAN for **fine-grained hotspot detection** and K-Means for **macro-level zone segmentation** — enabling a multi-scale understanding of urban traffic dynamics.

> 📓 See [`models/02_dbscan_hotspot_detection.ipynb`](models/02_dbscan_hotspot_detection.ipynb) and [`models/03_kmeans_zone_clustering.ipynb`](models/03_kmeans_zone_clustering.ipynb) for the full implementation.

---

## ✨ Features

### 🔮 Traffic Prediction
- ML-based congestion level prediction using hour, weekday, traffic volume, and average speed
- Real-time anomaly detection for unusual traffic patterns

### 🗺️ Interactive Map Dashboard
- Leaflet-based interactive map centered on Bangalore
- Traffic congestion heatmap visualization
- DBSCAN-detected traffic hotspot markers
- K-Means clustered traffic zone panels

### 🚗 Multi-Modal Route Planning
- **Car Routes** — Fastest, least-congested, and eco-friendly route options using OSMnx road graphs
- **Metro Planner** — Namma Metro route finder with fare and time estimates (Purple & Green lines)
- **Bus Planner** — BMTC bus route search with stop-level information
- **Railway Planner** — Train search from Bangalore to other cities
- **Smart Mode Recommendation** — ML-powered mode recommendation (car/metro/bus) based on distance, congestion, cost, and time

### 📷 Computer Vision
- **Image Upload Detection** — Upload traffic images for YOLOv8-based vehicle counting and congestion scoring
- **Live Webcam Detection** — Real-time vehicle detection from webcam feed

### 📍 Location Intelligence
- GPS-based congestion scoring using road importance and time-of-day factors
- Nearest bus stop finder
- Explore nearby places (restaurants, hospitals, etc.) via OpenStreetMap Overpass API
- Geocoding support for place name → coordinates

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  (Vite + TypeScript + Tailwind + Leaflet + React-Leaflet)│
├──────────────────────────────────────────────────────────┤
│                         ▼ Axios                          │
├──────────────────────────────────────────────────────────┤
│                   FastAPI Backend                         │
│  ┌─────────────┬──────────────┬────────────────────┐     │
│  │ ML Models   │ YOLOv8       │ Utility Modules    │     │
│  │ (sklearn)   │ (Ultralytics)│ (OSMnx, Overpass)  │     │
│  └─────────────┴──────────────┴────────────────────┘     │
├──────────────────────────────────────────────────────────┤
│              Data Layer (CSV + PKL + JSON)                │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 7 | Build tool & dev server |
| Tailwind CSS 3.4 | Styling |
| Leaflet + React-Leaflet | Interactive maps |
| leaflet.heat | Heatmap visualization |
| Axios | HTTP client |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| scikit-learn | ML model training & inference |
| YOLOv8 (Ultralytics) | Vehicle detection |
| OSMnx | Road network graph & routing |
| Pandas / NumPy | Data processing |
| Joblib | Model serialization |

---

## 📁 Project Structure

```
bangalore-traffic-ai/
├── backend/
│   ├── main.py                     # FastAPI app with all endpoints
│   ├── requirements.txt            # Python dependencies
│   ├── train_anomaly.py            # Anomaly detection model training
│   ├── train_smart_mode_model.py   # Smart mode recommender training
│   ├── model/
│   │   ├── traffic_model.pkl       # Traffic congestion prediction model
│   │   ├── anomaly_model.pkl       # Anomaly detection model
│   │   ├── anomaly_scaler.pkl      # Feature scaler for anomaly detection
│   │   └── smart_mode_model.pkl    # Transport mode recommendation model
│   ├── data/
│   │   ├── hotspots.csv            # Detected traffic hotspots
│   │   └── zones.csv               # Clustered traffic zones
│   ├── utils/
│   │   ├── preprocess.py           # Input preprocessing
│   │   ├── anomaly.py              # Anomaly detection logic
│   │   ├── yolo_detector.py        # YOLOv8 vehicle detection
│   │   ├── camera.py               # Webcam frame capture
│   │   ├── congestion.py           # Congestion scoring & fusion
│   │   ├── road_graph.py           # OSMnx road network loader
│   │   ├── edge_weights.py         # Route weight assignment
│   │   ├── routing.py              # Shortest path routing
│   │   ├── geocode.py              # Reverse geocoding
│   │   ├── road_score.py           # Road importance scoring
│   │   ├── time_score.py           # Time-based traffic scoring
│   │   ├── metro_route.py          # Namma Metro route finder
│   │   ├── bus_simple.py           # Bus number finder
│   │   ├── bus_stops.py            # Nearest bus stop finder
│   │   ├── bus_search.py           # Bus stop search
│   │   ├── bus_zones.py            # Bus zone information
│   │   ├── bmtc_scraper.py         # BMTC route scraper
│   │   ├── railway_service.py      # Railway route search
│   │   ├── smart_mode.py           # ML-based mode prediction
│   │   └── fusion.py               # Multi-source data fusion
│   └── uploads/                    # Uploaded traffic images
│
├── traffic-frontend/
│   ├── src/
│   │   ├── App.tsx                 # Root app component
│   │   ├── main.tsx                # Entry point
│   │   ├── pages/
│   │   │   └── Dashboard.tsx       # Main dashboard page
│   │   ├── components/
│   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   ├── MapView.tsx         # Leaflet map container
│   │   │   ├── HeatmapLayer.tsx    # Traffic heatmap overlay
│   │   │   ├── Hotspots.tsx        # Hotspot markers
│   │   │   ├── HotspotMap.tsx      # Hotspot map view
│   │   │   ├── ZonePanel.tsx       # Traffic zone display
│   │   │   ├── PredictForm.tsx     # Congestion prediction form
│   │   │   ├── TrafficResult.tsx   # Prediction results display
│   │   │   ├── ImageUpload.tsx     # Traffic image upload
│   │   │   ├── WebcamCapture.tsx   # Live webcam detection
│   │   │   ├── LiveTraffic.tsx     # Live traffic view
│   │   │   ├── LocationTraffic.tsx # GPS-based traffic
│   │   │   ├── RouteMap.tsx        # Multi-route map display
│   │   │   ├── MetroPlanner.tsx    # Metro route planner
│   │   │   ├── BusPlanner.tsx      # Bus route planner
│   │   │   ├── BusAvailability.tsx # Bus availability checker
│   │   │   ├── NearestBusStop.tsx  # Nearest bus stop finder
│   │   │   ├── RailwayPlanner.tsx  # Railway route planner
│   │   │   ├── SmartModeCard.tsx   # Smart mode recommendation
│   │   │   ├── ExploreNearby.tsx   # Nearby places explorer
│   │   │   ├── TimeSlider.tsx      # Time selection slider
│   │   │   └── ResultCard.tsx      # Reusable result card
│   │   ├── api/                    # API client functions
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # Service layer
│   │   └── types/                  # TypeScript type definitions
│   ├── package.json
│   ├── tailwind.config.cjs
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── data/
│   ├── Banglore_traffic_Dataset.csv  # Primary traffic dataset
│   ├── routes.csv                    # BMTC route data
│   ├── stops.csv                     # Bus stop data
│   ├── stop_times.csv                # Bus stop timing data
│   ├── trips.csv                     # Trip data
│   └── schedules.json                # Schedule data
│
├── models/                           # Jupyter notebooks
│   ├── 01_data_exploration.ipynb     # EDA & data analysis
│   ├── 02_dbscan_hotspot_detection.ipynb  # Hotspot detection
│   ├── 03_heatmap_visualization.ipynb     # Heatmap generation
│   ├── 03_kmeans_zone_clustering.ipynb    # Zone clustering
│   └── 03_traffic_prediction_model.ipynb  # Prediction model training
│
├── yolov8n.pt                        # YOLOv8 nano model weights
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/meearyannnn/bangalore-traffic-ai.git
cd bangalore-traffic-ai
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
pip install ultralytics osmnx requests beautifulsoup4

# Start the backend server
cd backend
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Visit `http://localhost:8000/docs` for the interactive Swagger documentation.

### 3. Frontend Setup

```bash
cd traffic-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/predict` | Predict congestion level |
| `GET` | `/hotspots` | Get traffic hotspot data |
| `GET` | `/zones` | Get traffic zone clusters |
| `POST` | `/detect-anomaly` | Detect traffic anomalies |
| `POST` | `/detect-traffic-image` | Upload image for vehicle detection |
| `GET` | `/detect-live` | Live webcam vehicle detection |
| `POST` | `/predict-route` | Get multi-mode route options |
| `POST` | `/location-traffic` | GPS-based congestion score |
| `POST` | `/metro-route` | Find Namma Metro route |
| `POST` | `/nearest-bus-stop` | Find nearest bus stop |
| `POST` | `/bmtc-route` | Search BMTC bus routes |
| `GET` | `/bus-zone` | Get bus zone information |
| `GET` | `/bus-search` | Search bus stops by name |
| `POST` | `/smart-mode` | AI-powered mode recommendation |
| `GET` | `/explore-nearby` | Explore nearby places |
| `GET` | `/geocode` | Convert place name to coordinates |
| `GET` | `/train-search` | Search trains from Bangalore |

---

## 🤖 ML Models

| Model | Algorithm | Purpose |
|-------|-----------|---------|
| `traffic_model.pkl` | Random Forest / Regression | Predicts congestion level from traffic features |
| `anomaly_model.pkl` | Isolation Forest | Detects anomalous traffic patterns |
| `smart_mode_model.pkl` | Classifier | Recommends optimal transport mode (car/metro/bus) |
| `yolov8n.pt` | YOLOv8 Nano | Real-time vehicle detection and counting |

### Training Notebooks

1. **`01_data_exploration.ipynb`** — Exploratory data analysis on Bangalore traffic dataset
2. **`02_dbscan_hotspot_detection.ipynb`** — DBSCAN clustering to identify traffic congestion hotspots
3. **`03_kmeans_zone_clustering.ipynb`** — K-Means clustering for traffic zone segmentation
4. **`03_heatmap_visualization.ipynb`** — Traffic density heatmap generation
5. **`03_traffic_prediction_model.ipynb`** — Training the traffic congestion prediction model

---

## 📊 Data Sources

- **Bangalore Traffic Dataset** — Historical traffic volume, speed, and congestion data
- **BMTC Data** — Bus routes, stops, stop times, and trip schedules
- **OpenStreetMap** — Road network (via OSMnx), geocoding (via Nominatim), and nearby places (via Overpass API)
- **Namma Metro** — Purple and Green line station data with interchange information

---

## 🖼️ Screenshots

> _Add screenshots of your dashboard, heatmap, route planner, and smart mode recommendation here._

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for Bangalore's traffic 🚦
</p>
