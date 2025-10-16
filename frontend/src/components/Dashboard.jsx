import React, { useState, useEffect } from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';
import MetricsPanel from './MetricsPanel';
import AgentMonitor from './AgentMonitor';
import SwarmVisualizer from './SwarmVisualizer';
import ForecastChart from './ForecastChart';
import ScenarioSimulator from './ScenarioSimulator';
import { 
  getSimulationStatus, 
  startSimulation, 
  stopSimulation,
  getAllAgents,
  getCommunityMetrics 
} from '../utils/api';

export default function Dashboard({ darkMode }) {
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [agents, setAgents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [metrics, setMetrics] = useState({
    solarUsage: 0,
    solarTrend: 0,
    batteryLevel: 0,
    costSavings: '$0',
    monthlySavings: '$0',
    co2Saved: 0
  });
  const [loading, setLoading] = useState(false);

  // Fetch simulation status
  const fetchStatus = async () => {
    try {
      const response = await getSimulationStatus();
      setSimulationRunning(response.data.status === 'running');
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  // Fetch agents data
  const fetchAgents = async () => {
    try {
      const response = await getAllAgents();
      setAgents(response.data.map(agent => ({
        id: agent.id,
        active: agent.status !== 'offline',
        battery: agent.battery_level,
        production: agent.production,
        consumption: agent.consumption,
        status: agent.status,
        x: Math.random() * 10,
        y: Math.random() * 10
      })));
      
      // Generate mock messages
      const newMessages = response.data.slice(0, 5).map(agent => ({
        time: new Date().toLocaleTimeString(),
        agentId: agent.id,
        action: agent.production > agent.consumption ? 'Sharing surplus' : 'Requesting energy',
        amount: Math.abs(agent.production - agent.consumption).toFixed(2)
      }));
      setMessages(prev => [...newMessages, ...prev].slice(0, 10));
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  // Fetch community metrics
  const fetchMetrics = async () => {
    try {
      const response = await getCommunityMetrics();
      setMetrics({
        solarUsage: response.data.solar_utilization_pct.toFixed(1),
        solarTrend: 5.2,
        batteryLevel: 75,
        costSavings: `$${response.data.cost_savings_daily.toFixed(2)}`,
        monthlySavings: `$${response.data.cost_savings_monthly.toFixed(2)}`,
        co2Saved: response.data.co2_avoided_kg.toFixed(1)
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  // Start simulation
  const handleStart = async () => {
    setLoading(true);
    try {
      await startSimulation(50, 24);
      setSimulationRunning(true);
      // Start polling for updates
      const interval = setInterval(() => {
        fetchAgents();
        fetchMetrics();
      }, 2000);
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error starting simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stop simulation
  const handleStop = async () => {
    try {
      await stopSimulation();
      setSimulationRunning(false);
    } catch (error) {
      console.error('Error stopping simulation:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Simulation Control</h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Status: <span className={simulationRunning ? 'text-green-400' : 'text-gray-400'}>
                {simulationRunning ? 'Running' : 'Idle'}
              </span>
            </p>
          </div>
          
          <div className="flex space-x-3">
            {!simulationRunning ? (
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                <span>{loading ? 'Starting...' : 'Start Simulation'}</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition"
              >
                <Square className="w-5 h-5" />
                <span>Stop Simulation</span>
              </button>
            )}
            <button
              onClick={() => { fetchAgents(); fetchMetrics(); }}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Panel */}
      <MetricsPanel metrics={metrics} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Swarm Visualizer */}
        <SwarmVisualizer 
          houses={agents} 
          energyFlows={[]} 
          darkMode={darkMode}
        />
        
        {/* Agent Monitor */}
        <AgentMonitor agents={agents} messages={messages} />
      </div>

      {/* Forecast Chart */}
      <ForecastChart darkMode={darkMode} />

      {/* Scenario Simulator */}
      <ScenarioSimulator darkMode={darkMode} />
    </div>
  );
}