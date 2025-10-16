import React, { useState } from 'react';
import { Cloud, AlertTriangle, Zap, Settings } from 'lucide-react';
import { runScenario } from '../utils/api';

export default function ScenarioSimulator({ darkMode }) {
  const [selectedScenario, setSelectedScenario] = useState('cloudy_day');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customParams, setCustomParams] = useState({
    production_factor: 1.0,
    consumption_factor: 1.0
  });

  const scenarios = [
    {
      id: 'cloudy_day',
      name: 'Cloudy Day',
      description: 'Reduced solar production by 70%',
      icon: <Cloud className="w-5 h-5" />,
      color: 'bg-gray-600'
    },
    {
      id: 'panel_failure',
      name: 'Panel Failure',
      description: '5 random panels fail completely',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'bg-red-600'
    },
    {
      id: 'peak_demand',
      name: 'Peak Demand',
      description: 'Consumption increased by 100%',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-orange-600'
    },
    {
      id: 'custom',
      name: 'Custom Scenario',
      description: 'Define your own parameters',
      icon: <Settings className="w-5 h-5" />,
      color: 'bg-purple-600'
    }
  ];

  const handleRunScenario = async () => {
    setLoading(true);
    try {
      const params = selectedScenario === 'custom' ? customParams : null;
      const response = await runScenario(selectedScenario, params);
      setResults(response.data.results);
    } catch (error) {
      console.error('Error running scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <h2 className="text-xl font-bold mb-4">Scenario Simulator</h2>
      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
        Test how the swarm responds to different conditions
      </p>

      {/* Scenario Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {scenarios.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => setSelectedScenario(scenario.id)}
            className={`p-4 rounded-lg border-2 transition ${
              selectedScenario === scenario.id
                ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                : darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className={`${scenario.color} w-10 h-10 rounded-lg flex items-center justify-center mb-2`}>
              {scenario.icon}
            </div>
            <div className="text-left">
              <div className="font-semibold mb-1">{scenario.name}</div>
              <div className="text-sm text-gray-400">{scenario.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Custom Parameters */}
      {selectedScenario === 'custom' && (
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 mb-6`}>
          <h3 className="font-semibold mb-4">Custom Parameters</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Production Factor</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={customParams.production_factor}
                onChange={(e) => setCustomParams({ ...customParams, production_factor: parseFloat(e.target.value) })}
                className={`w-full px-3 py-2 rounded ${
                  darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
                } border border-gray-500`}
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Consumption Factor</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={customParams.consumption_factor}
                onChange={(e) => setCustomParams({ ...customParams, consumption_factor: parseFloat(e.target.value) })}
                className={`w-full px-3 py-2 rounded ${
                  darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
                } border border-gray-500`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Run Button */}
      <button
        onClick={handleRunScenario}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 mb-6"
      >
        {loading ? 'Running Simulation...' : 'Run Scenario'}
      </button>

      {/* Results */}
      {results && (
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-6`}>
          <h3 className="font-bold text-lg mb-4">Simulation Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Solar Utilization</div>
              <div className="text-2xl font-bold text-green-400">{results.solar_utilization?.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Grid Dependency</div>
              <div className="text-2xl font-bold text-red-400">{results.grid_dependency?.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Energy Shared</div>
              <div className="text-2xl font-bold text-blue-400">{results.energy_shared?.toFixed(2)} kWh</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Total Solar Used</div>
              <div className="text-2xl font-bold text-yellow-400">{results.total_solar_used?.toFixed(2)} kWh</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Grid Import</div>
              <div className="text-2xl font-bold text-orange-400">{results.total_grid_import?.toFixed(2)} kWh</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}