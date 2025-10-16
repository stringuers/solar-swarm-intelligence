import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simulation endpoints
export const getSimulationStatus = () => api.get('/simulation/status');
export const startSimulation = (numAgents = 50, hours = 24) => 
  api.post('/simulation/start', { num_agents: numAgents, hours });
export const stopSimulation = () => api.post('/simulation/stop');

// Agent endpoints
export const getAllAgents = () => api.get('/agents');
export const getAgent = (agentId) => api.get(`/agents/${agentId}`);

// Metrics endpoints
export const getCommunityMetrics = () => api.get('/metrics/community');
export const getMetricsHistory = (hours = 24) => api.get(`/metrics/history?hours=${hours}`);

// Forecast endpoints
export const get24HourForecast = () => api.get('/forecast/24h');

// Scenario endpoints
export const runScenario = (scenarioType, parameters = null) => 
  api.post('/scenario/run', { scenario_type: scenarioType, parameters });

export default api;