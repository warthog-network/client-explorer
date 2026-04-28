import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const hashUnits = ['', 'K', 'M', 'G', 'T', 'P'];

function getHashrateUnit(hashrate) {
  let unitIndex = 0;
  let value = hashrate;
  while (value >= 1000 && unitIndex < hashUnits.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  return { unit: hashUnits[unitIndex], divisor: Math.pow(1000, unitIndex), label: `${hashUnits[unitIndex]}H/s` };
}

export default function HashrateChart({ data, isLoading }) {
  const { divisor, label } = useMemo(() => {
    if (!data || data.length === 0) return { divisor: 1, label: 'H/s' };
    const maxHashrate = Math.max(...data.map(d => d.hashrate));
    return getHashrateUnit(maxHashrate);
  }, [data]);

  const chartData = {
    labels: data?.map((d) => {
      const date = new Date(d.timestamp * 1000);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }) || [],
    datasets: [
      {
        label: 'Hashrate',
        data: data?.map((d) => d.hashrate / divisor) || [],
        borderColor: '#FDB913',
        backgroundColor: 'rgba(253, 185, 19, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#FDB913',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#FDB913',
        bodyColor: '#ffffff',
        borderColor: '#FDB913',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `Hashrate: ${context.parsed.y.toFixed(2)} ${label}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          maxTicksLimit: 6,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          callback: (value) => `${value} ${label}`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="text-white/50">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="text-white/50">No hashrate data available</div>
      </div>
    );
  }

  return (
    <div className="h-48">
      <Line data={chartData} options={options} />
    </div>
  );
}