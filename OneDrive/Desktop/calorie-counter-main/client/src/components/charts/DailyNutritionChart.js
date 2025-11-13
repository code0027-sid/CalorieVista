import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const DailyNutritionChart = ({ dailyData }) => {
  // Calculate totals from daily data
  const totals = dailyData.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fats: acc.fats + (meal.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  // Doughnut chart data for macronutrients
  const macroData = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [
      {
        data: [totals.protein, totals.carbs, totals.fats],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart data for detailed breakdown
  const barData = {
    labels: ['Protein (g)', 'Carbs (g)', 'Fats (g)'],
    datasets: [
      {
        label: 'Macronutrients',
        data: [totals.protein, totals.carbs, totals.fats],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}g (${percentage}%)`;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Grams',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="daily-nutrition-chart">
      <div className="chart-container">
        <h3>Total Calories: {totals.calories.toFixed(0)} kcal</h3>
        <div className="charts-grid">
          <div className="chart-item">
            <h4>Macronutrient Distribution</h4>
            <div style={{ height: '250px', width: '250px', margin: '0 auto' }}>
              <Doughnut data={macroData} options={chartOptions} />
            </div>
          </div>
          <div className="chart-item">
            <h4>Nutrient Breakdown (grams)</h4>
            <div style={{ height: '250px' }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
        <div className="nutrition-summary">
          <div className="summary-item">
            <span className="label">Protein:</span>
            <span className="value">{totals.protein.toFixed(1)}g</span>
          </div>
          <div className="summary-item">
            <span className="label">Carbs:</span>
            <span className="value">{totals.carbs.toFixed(1)}g</span>
          </div>
          <div className="summary-item">
            <span className="label">Fats:</span>
            <span className="value">{totals.fats.toFixed(1)}g</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyNutritionChart;
