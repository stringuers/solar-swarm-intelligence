import React from 'react';
import { Home, Zap, Battery } from 'lucide-react';

export default function SwarmVisualizer({ houses, energyFlows, darkMode }) {
  const gridSize = 10;
  const cellSize = 50;

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <h2 className="text-xl font-bold mb-4">Community Energy Network</h2>
      
      <div className="mb-4 flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Surplus</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Balanced</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Deficit</span>
        </div>
      </div>

      <div className="relative bg-gray-900 rounded-lg p-4 overflow-auto" style={{ height: '500px' }}>
        <svg width={gridSize * cellSize} height={gridSize * cellSize}>
          {/* Grid lines */}
          {Array.from({ length: gridSize + 1 }).map((_, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={0}
                y1={i * cellSize}
                x2={gridSize * cellSize}
                y2={i * cellSize}
                stroke="#374151"
                strokeWidth="1"
              />
              <line
                x1={i * cellSize}
                y1={0}
                x2={i * cellSize}
                y2={gridSize * cellSize}
                stroke="#374151"
                strokeWidth="1"
              />
            </g>
          ))}

          {/* Energy flows */}
          {energyFlows.map((flow, idx) => (
            <line
              key={`flow-${idx}`}
              x1={flow.from.x * cellSize + cellSize / 2}
              y1={flow.from.y * cellSize + cellSize / 2}
              x2={flow.to.x * cellSize + cellSize / 2}
              y2={flow.to.y * cellSize + cellSize / 2}
              stroke="#3b82f6"
              strokeWidth="2"
              opacity="0.6"
            />
          ))}

          {/* Houses */}
          {houses.map((house, idx) => {
            const color = 
              house.status === 'surplus' ? '#10b981' :
              house.status === 'deficit' ? '#ef4444' : '#f59e0b';
            
            return (
              <g key={`house-${idx}`}>
                <rect
                  x={house.x * cellSize + 10}
                  y={house.y * cellSize + 10}
                  width={cellSize - 20}
                  height={cellSize - 20}
                  fill={color}
                  rx="4"
                  opacity="0.8"
                />
                <text
                  x={house.x * cellSize + cellSize / 2}
                  y={house.y * cellSize + cellSize / 2}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {house.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded`}>
          <div className="flex items-center space-x-2 mb-1">
            <Home className="w-4 h-4 text-blue-400" />
            <span className="font-semibold">Total Homes</span>
          </div>
          <div className="text-2xl font-bold">{houses.length}</div>
        </div>
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded`}>
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold">Active Agents</span>
          </div>
          <div className="text-2xl font-bold">{houses.filter(h => h.active).length}</div>
        </div>
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded`}>
          <div className="flex items-center space-x-2 mb-1">
            <Battery className="w-4 h-4 text-green-400" />
            <span className="font-semibold">Energy Flows</span>
          </div>
          <div className="text-2xl font-bold">{energyFlows.length}</div>
        </div>
      </div>
    </div>
  );
}