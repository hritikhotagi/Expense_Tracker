import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useAuth0 } from '@auth0/auth0-react';
import { getIncomes, getExpenses, getCategories } from '../services/apiService';
import './Dashboard.css';

// Register the required components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const { user } = useAuth0(); // Get user info from Auth0
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [remainingSavings, setRemainingSavings] = useState(0);

  useEffect(() => {
    if (user) {
      fetchData(user.sub); // Fetch data for the logged-in user
    }
  }, [user]);

  const fetchData = async (userId) => {
    try {
      const incomeResponse = await getIncomes(userId);
      const expenseResponse = await getExpenses(userId);
      const categoryResponse = await getCategories(userId); // Fetch categories

      setIncomes(incomeResponse);
      setExpenses(expenseResponse);
      setCategories(categoryResponse); // Set categories

      calculateTotals(incomeResponse, expenseResponse);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const calculateTotals = (incomeData, expenseData) => {
    const totalIncome = incomeData.reduce((acc, income) => acc + income.amount, 0) + expenseData.reduce((acc, expense) => acc + expense.amount, 0);
    const totalExpenses = expenseData.reduce((acc, expense) => acc + expense.amount, 0);
    const remainingSavings = totalIncome - totalExpenses;

    setTotalIncome(totalIncome);
    setTotalExpenses(totalExpenses);
    setRemainingSavings(remainingSavings);
  };

  const pieChartData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Income vs Expenses',
        data: [totalIncome, totalExpenses],
        backgroundColor: ['#4CAF50', '#FF6384'], // Green for income, Red for expenses
        hoverBackgroundColor: ['#45a049', '#FF6B81'],
      },
    ],
  };

  const getCategoryNameById = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const getExpensesByCategory = () => {
    const categoriesMap = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleString('default', { month: 'long' });
      const categoryName = getCategoryNameById(expense.category); // Use category name instead of ID

      acc[month] = acc[month] || { total: 0 };
      acc[month][categoryName] = (acc[month][categoryName] || 0) + expense.amount;
      acc[month].total += expense.amount;
      return acc;
    }, {});

    const categoryLabels = [...new Set(expenses.map(exp => getCategoryNameById(exp.category)))]; // Unique category names

    return { categoriesMap, categoryLabels };
  };

  const { categoriesMap, categoryLabels } = getExpensesByCategory();

  const barChartData = {
    labels: Object.keys(categoriesMap), // Months
    datasets: categoryLabels.map((label, i) => ({
      label,
      backgroundColor: `hsl(${i * 40}, 70%, 50%)`, // Unique color for each category
      data: Object.keys(categoriesMap).map((month) => categoriesMap[month][label] || 0),
    })),
  };

  const barChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="page-content">
      <h2>Financial Dashboard</h2>
      
      {/* Card section for totals */}
      <div className="dashboard-card-container">
        <div className="dashboard-card">
          <h3>Total Income</h3>
          <p>Rs. {totalIncome}</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Expenses</h3>
          <p>Rs. {totalExpenses}</p>
        </div>
        <div className="dashboard-card">
          <h3>Remaining Savings</h3>
          <p>Rs. {remainingSavings}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart1">
          <h4>Income vs Expenses</h4>
          <Pie data={pieChartData} />
        </div>

        <div className="chart2">
          <h4>Monthly Expenses by Category</h4>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
