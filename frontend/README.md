# Solar Swarm Intelligence - Frontend

Modern React dashboard for visualizing and controlling the Solar Swarm Intelligence system.

## Features

- **Real-time Simulation Control**: Start/stop simulations and monitor status
- **Community Metrics Dashboard**: Track solar utilization, cost savings, and CO2 reduction
- **Agent Network Visualization**: 2D grid view of all agents and energy flows
- **24-Hour Solar Forecast**: LSTM-powered predictions with confidence intervals
- **Scenario Simulator**: Test different conditions (cloudy days, panel failures, peak demand)
- **Dark Mode Support**: Toggle between light and dark themes

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - API communication
- **React Router** - Navigation

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
VITE_API_URL=http://localhost:8000
```

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AgentMonitor.jsx       # Agent activity feed
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── ForecastChart.jsx      # Solar forecast chart
│   │   ├── Map3D.jsx              # 3D visualization (Three.js)
│   │   ├── MetricsPanel.jsx       # Performance metrics
│   │   ├── ScenarioSimulator.jsx  # Scenario testing
│   │   └── SwarmVisualizer.jsx    # 2D network visualization
│   ├── utils/
│   │   └── api.js                 # API client
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## API Integration

The frontend communicates with the FastAPI backend through the following endpoints:

- `GET /simulation/status` - Get simulation status
- `POST /simulation/start` - Start simulation
- `POST /simulation/stop` - Stop simulation
- `GET /agents` - Get all agents
- `GET /metrics/community` - Get community metrics
- `GET /forecast/24h` - Get 24-hour forecast
- `POST /scenario/run` - Run scenario simulation

## Components

### Dashboard
Main control panel with simulation controls and real-time updates.

### MetricsPanel
Displays key performance indicators:
- Solar usage rate
- Community battery level
- Cost savings
- CO2 avoided

### SwarmVisualizer
2D grid visualization showing:
- Agent positions
- Energy surplus/deficit status
- Energy flows between agents

### ForecastChart
24-hour solar production forecast with confidence intervals using Recharts.

### ScenarioSimulator
Test different scenarios:
- Cloudy Day (70% production reduction)
- Panel Failure (5 random failures)
- Peak Demand (100% consumption increase)
- Custom (user-defined parameters)

### AgentMonitor
Real-time feed of agent decisions and actions.

## Docker Deployment

The frontend is containerized and can be deployed with Docker Compose:

```bash
docker-compose up frontend
```

## License

MIT
