import React from 'react';
import { TrendingUp, Battery, Zap, Leaf } from 'lucide-react';

export default function MetricsPanel({ metrics }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Community Performance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Zap className="w-6 h-6" />}
          label="Solar Usage Rate"
          value={`${metrics.solarUsage}%`}
          trend={`+${metrics.solarTrend}%`}
          color="text-yellow-400"
        />
        
        <MetricCard
          icon={<Battery className="w-6 h-6" />}
          label="Community Battery"
          value={`${metrics.batteryLevel}%`}
          trend={null}
          color="text-blue-400"
        />
        
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Cost Savings Today"
          value={`${metrics.costSavings}`}
          trend={`${metrics.monthlySavings}/mo projected`}
          color="text-green-400"
        />
        
        <MetricCard
          icon={<Leaf className="w-6 h-6" />}
          label="CO₂ Avoided Today"
          value={`${metrics.co2Saved} kg`}
          trend={`${(metrics.co2Saved * 30).toFixed(1)} tons/mo`}
          color="text-emerald-400"
        />
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, trend, color }) {
  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className={`flex items-center justify-between mb-2 ${color}`}>
        {icon}
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <div className="text-gray-400 text-sm">{label}</div>
      {trend && <div className="text-green-400 text-xs mt-1">↑ {trend}</div>}
    </div>
  );
}