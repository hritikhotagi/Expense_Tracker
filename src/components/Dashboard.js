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
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' })); // Default to current month

  const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

  // Calculate total income as sum of incomes and expenses, and total expenses
  const calculateTotals = (incomeData, expenseData) => {
    const totalIncome = incomeData.reduce((acc, income) => acc + income.amount, 0) + expenseData.reduce((acc, expense) => acc + expense.amount, 0);
    const totalExpenses = expenseData.reduce((acc, expense) => acc + expense.amount, 0);
    const remainingSavings = totalIncome - totalExpenses;

    setTotalIncome(totalIncome);
    setTotalExpenses(totalExpenses);
    setRemainingSavings(remainingSavings);
  };

  // Get filtered data for the selected month
  const getFilteredIncomesAndExpenses = (selectedMonth) => {
    const filteredIncomes = incomes.filter(income => income.month === selectedMonth);
    const filteredExpenses = expenses.filter(expense => new Date(expense.date).toLocaleString('default', { month: 'long' }) === selectedMonth);

    const totalIncomeForMonth = filteredIncomes.reduce((acc, income) => acc + income.amount, 0);
    const totalExpensesForMonth = filteredExpenses.reduce((acc, expense) => acc + expense.amount, 0);

    return { totalIncomeForMonth, totalExpensesForMonth };
  };

  // Pie Chart Data
  const pieChartData = ({ totalIncomeForMonth, totalExpensesForMonth }) => {
    const expensePercentage = totalIncomeForMonth ? ((totalExpensesForMonth / totalIncomeForMonth) * 100).toFixed(2) : 0;
    const incomePercentage = 100 - expensePercentage;

    return {
      labels: ['Income', 'Expenses'],
      datasets: [
        {
          label: 'Income vs Expenses',
          data: [totalIncomeForMonth, totalExpensesForMonth],
          backgroundColor: ['#4CAF50', '#FF6384'], // Green for income, Red for expenses
          hoverBackgroundColor: ['#45a049', '#FF6B81'],
        },
      ],
      percentageLabels: [incomePercentage, expensePercentage], // Percentage labels
    };
  };

  const getCategoryNameById = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const getExpensesByCategory = (month) => {
    const filteredExpenses = month === 'All'
      ? expenses
      : expenses.filter(exp => new Date(exp.date).toLocaleString('default', { month: 'long' }) === month);

    const categoriesMap = filteredExpenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleString('default', { month: 'long' });
      const categoryName = getCategoryNameById(expense.category); // Use category name instead of ID

      acc[month] = acc[month] || { total: 0 };
      acc[month][categoryName] = (acc[month][categoryName] || 0) + expense.amount;
      acc[month].total += expense.amount;
      return acc;
    }, {});

    const categoryLabels = [...new Set(filteredExpenses.map(exp => getCategoryNameById(exp.category)))]; // Unique category names

    return { categoriesMap, categoryLabels };
  };

  const { categoriesMap, categoryLabels } = getExpensesByCategory(selectedMonth);

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

  const { totalIncomeForMonth, totalExpensesForMonth } = getFilteredIncomesAndExpenses(selectedMonth);

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
          <div className="month-filter">
            <label htmlFor="month-select">Filter by Month:</label>
            <select id="month-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <Pie data={pieChartData({ totalIncomeForMonth, totalExpensesForMonth })} />
          <p>{`Expense: ${((totalExpensesForMonth / totalIncomeForMonth) * 100).toFixed(2)}% of Income`}</p>
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
