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

  // Helper function to get the total before and after an expense was deducted
  const getLinkedIncomeDetails = (incomeId, expenseId) => {
    const income = incomes.find(inc => inc._id === incomeId);
    if (!income) return { remainingBalance: 'Unknown Income', totalBeforeExpense: 'Unknown' };

    // Get all expenses linked to the income
    const linkedExpenses = expenses.filter(exp => exp.linkedIncome === incomeId);

    // Initialize running balance with the income amount
    let runningBalance = income.amount;
    let totalBeforeExpense = runningBalance;

    for (const exp of linkedExpenses) {
      if (exp._id === expenseId) break; // Stop when we reach the current expense
      runningBalance -= exp.amount; // Subtract each prior expense
    }

    totalBeforeExpense = runningBalance;
    runningBalance -= linkedExpenses.find(exp => exp._id === expenseId).amount; // Subtract current expense for the remaining balance

    return { remainingBalance: runningBalance, totalBeforeExpense };
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
          expenses
            .slice() // Clone the array
            .reverse() // Reverse the array to display latest expenses first
            .map((exp) => {
              const { remainingBalance, totalBeforeExpense } = getLinkedIncomeDetails(exp.linkedIncome, exp._id);

              return (
                <div key={exp._id} className="expense-card">
                  <div className="expense-details">
                    <div className="expense-title">
                      <h2>{exp.title}</h2>
                      <p>{formatDate(exp.date)}</p>
                      <p className="total-before-expense">Total before expense: Rs. {totalBeforeExpense}</p> {/* Display total before expense */}
                      <span className="remaining-balance">Balance: Rs. {remainingBalance}</span>
                      <p className='amttran'>
                        Rs.{exp.amount}
                      </p>
                    </div>
                    <p><strong>Category:</strong> {getCategoryNameById(exp.category)}</p>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default ExpenseOverview;
