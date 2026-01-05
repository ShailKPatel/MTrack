import React from 'react';
import { Pie } from 'react-chartjs-2';

interface DistributionChartProps {
    title: string;
    data: { category: string; amount: number }[];
    colors: string[];
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ title, data, colors }) => {
    const chartData = {
        labels: data.map(d => d.category),
        datasets: [{
            data: data.map(d => d.amount),
            backgroundColor: colors,
            borderWidth: 0,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#a0a0a0',
                    font: { size: 11 },
                    padding: 12,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
            }
        }
    };

    return (
        <div className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-4 text-center">{title}</h3>
            {data.length > 0 ? (
                <div className="max-w-xs mx-auto">
                    <Pie data={chartData} options={options} />
                </div>
            ) : (
                <p className="text-muted text-center py-8">No data available</p>
            )}
        </div>
    );
};
