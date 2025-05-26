'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ScoreboardChart({ teams }: { teams: any[] }) {
  // Generate cyberpunk-inspired colors for teams
  const generateTeamColor = (index: number) => {
    const colors = [
      '#64ffda', '#ff5370', '#c792ea', '#ffcb6b', '#89ddff', '#c3e88d',
    ];
    return colors[index % colors.length];
  };

  const teamColors = teams.reduce((acc, team, index) => {
    acc[team.id] = generateTeamColor(index);
    return acc;
  }, {} as Record<string, string>);

  const chartData = {
    labels: teams.map(team => team.name),
    datasets: [
      {
        label: 'Team Points',
        data: teams.map(team => team.points),
        backgroundColor: teams.map(team => teamColors[team.id]),
        borderColor: teams.map(team => teamColors[team.id]),
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ccd6f6',
          font: { family: 'monospace' },
        },
      },
      title: {
        display: true,
        text: 'Team Progress',
        color: '#ccd6f6',
        font: { family: 'monospace', size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#1d2d50' },
        ticks: { color: '#8892b0', font: { family: 'monospace' } },
        title: {
          display: true,
          text: 'Points',
          color: '#ccd6f6',
          font: { family: 'monospace' },
        },
      },
      x: {
        grid: { color: '#1d2d50' },
        ticks: { color: '#8892b0', font: { family: 'monospace' } },
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
} 