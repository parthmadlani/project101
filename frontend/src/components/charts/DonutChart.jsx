import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = ({
    activeLearning = 45,
    practiceSessions = 35,
    idleTime = 20
}) => {
    const totalActive = activeLearning + practiceSessions;

    const data = {
        labels: ['Active Learning', 'Practice Sessions', 'Idle Time'],
        datasets: [{
            data: [activeLearning, practiceSessions, idleTime],
            backgroundColor: [
                'rgba(59, 130, 246, 0.9)',   // Blue
                'rgba(34, 197, 94, 0.9)',    // Green
                'rgba(239, 68, 68, 0.9)',    // Red
            ],
            borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(34, 197, 94, 1)',
                'rgba(239, 68, 68, 1)',
            ],
            borderWidth: 2,
            hoverBorderWidth: 3,
            hoverOffset: 8,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '70%',
        plugins: {
            legend: {
                display: false // Hide default legend, we'll make our own
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#fff',
                bodyColor: '#d1d5db',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 12,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: (context) => ` ${context.label}: ${context.parsed}%`
                }
            }
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
            easing: 'easeOutQuart'
        }
    };

    // Legend items for custom rendering
    const legendItems = [
        { label: 'Active Learning', color: '#3B82F6', value: activeLearning },
        { label: 'Practice Sessions', color: '#22C55E', value: practiceSessions },
        { label: 'Idle Time', color: '#EF4444', value: idleTime },
    ];

    return (
        <div className="flex flex-col items-center">
            {/* Chart Container with Center Text */}
            <div className="relative w-48 h-48">
                <Doughnut data={data} options={options} />
                {/* Centered Percentage */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-white">{totalActive}%</span>
                    <span className="text-xs text-gray-400 mt-0.5">Active Time</span>
                </div>
            </div>

            {/* Professional Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
                {legendItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-gray-300 font-medium">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonutChart;
