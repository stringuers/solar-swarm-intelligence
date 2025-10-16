import React from 'react';

export default function AgentMonitor({ agents, messages }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">AI Agent Activity</h2>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span>Active Agents: {agents.filter(a => a.active).length}/{agents.length}</span>
          <span>Messages/min: {messages.length}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(agents.filter(a => a.active).length / agents.length) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Recent Decisions:</h3>
        {messages.slice(0, 10).map((msg, idx) => (
          <div key={idx} className="text-sm text-gray-700 border-l-2 border-blue-400 pl-2">
            [{msg.time}]{' '}
            <span className="font-medium">Agent #{msg.agentId}:</span>{' '}
            {msg.action}
            {msg.amount && <span className="text-blue-600"> ({msg.amount} kWh)</span>}
          </div>
        ))}
      </div>
    </div>
  );
}