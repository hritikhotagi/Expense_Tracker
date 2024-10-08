import React, { useEffect, useState } from 'react';
import './ExpenseOverview.css'; // Create a separate CSS file for styling
import { useAuth0 } from '@auth0/auth0-react';
import { getExpenses, getCategories, getIncomes } from '../services/apiService'; // Fetch expenses, categories, and incomes from the API
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faCar, faHome, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const ExpenseOverview = () => {
  const { user } = useAuth0();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    if (user) {
      fetchExpensesData(user.sub);
      fetchCategoryData(user.sub);
      fetchIncomeData(user.sub);
    }
  }, [user]);

  const fetchExpensesData = async (userId) => {
    try {
      const response = await getExpenses(userId);
      setExpenses(response);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchCategoryData = async (userId) => {
    try {
      const response = await getCategories(userId);
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchIncomeData = async (userId) => {
    try {
      const response = await getIncomes(userId);
      setIncomes(response);

      // Calculate total income
      const total = response.reduce((acc, income) => acc + income.amount, 0);
      setTotalIncome(total);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }
  };

  // Format date to "day month year"
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Get category icon based on the category name
  const getCategoryIcon = (categoryName) => {
    switch (categoryName.toLowerCase()) {
      case 'food':
        return faUtensils;
      case 'transport':
        return faCar;
      case 'housing':
        return faHome;
      case 'shopping':
        return faShoppingCart;
      default:
        return faShoppingCart; // Default icon for unspecified categories
    }
  };

  // Helper function to get category name by ID
  const getCategoryNameById = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  // Helper function to get income amount by ID
  const getIncomeAmountById = (incomeId) => {
    const income = incomes.find(inc => inc._id === incomeId);
    return income ? `Rs. ${income.amount}` : 'Unknown Income';
  };

  return (
    <div className="page-content">
      <div className="header-section">
        <h2>Expense Overview</h2>
        <div className="total-income">
          <p><strong>Total Remaining: Rs. {totalIncome}</strong></p>
        </div>
      </div>

      <div className="expense-overview-list">
        {expenses.length === 0 ? (
          <p>No expenses available for this month.</p>
        ) : (
          expenses.map((exp) => (
            <div key={exp._id} className="expense-card">
              <div className="expense-details">
                <div className="expense-title">
                  <h4>{exp.title}</h4>
                </div>
                <p><strong>Amount:</strong> Rs. {exp.amount}</p>
                <p><strong>Category:</strong> {getCategoryNameById(exp.category)}</p>
                <p><strong>Date:</strong> {formatDate(exp.date)}</p>
                <p><strong>Source Income:</strong> {getIncomeAmountById(exp.linkedIncome)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseOverview;
