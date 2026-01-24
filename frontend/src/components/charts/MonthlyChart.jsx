import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyChart = ({
    weeklyData = [3, 5, 4, 6] // Activity count per week
}) => {
    const data = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
            label: 'Active Days',
            data: weeklyData,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 40,
            maxBarThickness: 50,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Monthly Activity',
                color: '#e5e7eb',
                font: {
                    size: 14,
                    weight: '600',
                    family: "'Inter', sans-serif"
                },
                padding: { bottom: 20 }
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#fff',
                bodyColor: '#d1d5db',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 10,
                displayColors: false,
                callbacks: {
                    label: (context) => `activeDays : ${context.parsed.y}`
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    color: '#9ca3af',
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                beginAtZero: true,
                max: 7,
                grid: {
                    color: 'rgba(75, 85, 99, 0.3)',
                    drawBorder: false
                },
                ticks: {
                    color: '#9ca3af',
                    stepSize: 1,
                    font: {
                        size: 11
                    }
                }
            }
        },
        animation: {
            duration: 800,
            easing: 'easeOutQuart'
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
            <div className="h-48">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

export default MonthlyChart;
