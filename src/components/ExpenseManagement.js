import React, { useState, useEffect } from 'react';
import './ExpenseManagement.css'; // Add CSS for the custom dropdown and menu
import { useAuth0 } from '@auth0/auth0-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faUtensils, faCar, faHome, faShoppingCart } from '@fortawesome/free-solid-svg-icons'; // Add icons
import {
  getCategories,
  createCategory,
  deleteCategory,
  getIncomes,
  getExpenses,
  addExpense,
  editExpense,
  deleteExpense,
} from '../services/apiService';

const ExpenseManagement = () => {
  const { user } = useAuth0(); // Auth0 to get user details
  const [categories, setCategories] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState(''); // Track selected category name for display
  const [expenseData, setExpenseData] = useState({
    title: '',
    amount: '',
    category: '', // Stores the categoryId for submission
    date: '',
    linkedIncome: '',
  });
  const [editExpenseId, setEditExpenseId] = useState(null);
  const [message, setMessage] = useState('');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false); // Track menu state

  useEffect(() => {
    if (user) {
      console.log("Current user ID:", user.sub);
      fetchCategories(user.sub);
      fetchIncomes(user.sub);
      fetchExpenses(user.sub);
    }
  }, [user]);

  // Fetch categories
  const fetchCategories = async (userId) => {
    try {
      const response = await getCategories(userId);
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch incomes
  const fetchIncomes = async (userId) => {
    try {
      const response = await getIncomes(userId);
      setIncomes(response);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }
  };

  // Fetch expenses
  const fetchExpenses = async (userId) => {
    try {
      const response = await getExpenses(userId);
      setExpenses(response);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  // Add a new category
  const handleAddCategory = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (newCategory === '') {
      setMessage('Category name cannot be empty');
      return;
    }
    try {
      await createCategory(newCategory, user.sub);
      setNewCategory('');
      setMessage('Category added successfully');
      fetchCategories(user.sub);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  // Delete a category
  const handleDeleteCategory = async (categoryId, e) => {
    e.stopPropagation(); // Prevent the event from propagating to the category selection handler
    try {
      if (expenseData.category === categoryId) {
        // If the deleted category was selected, unselect it
        setExpenseData({ ...expenseData, category: '' });
        setSelectedCategoryName(''); // Reset displayed category name
      }
      await deleteCategory(categoryId);
      setMessage('Category deleted successfully');
      fetchCategories(user.sub);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Add or update expense
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    const { title, amount, category, date, linkedIncome } = expenseData;

    // Ensure amount is passed as a number, not as a string
    const expenseDataToSend = {
      title,
      amount: Number(amount), // Convert amount to number
      category, // categoryId passed as category (ID)
      date,
      linkedIncome,
      createdBy: user.sub, // Add createdBy field with the user ID
    };

    if (!title || !amount || !category || !date || !linkedIncome) {
      setMessage('All fields are required');
      return;
    }
    try {
      if (editExpenseId) {
        await editExpense(editExpenseId, expenseDataToSend);
        setMessage('Expense updated successfully');
      } else {
        await addExpense(expenseDataToSend);
        setMessage('Expense added and income deducted');
      }
      setExpenseData({ title: '', amount: '', category: '', date: '', linkedIncome: '' });
      setSelectedCategoryName(''); // Reset category name display after submission
      fetchExpenses(user.sub);
      fetchIncomes(user.sub); // Refresh incomes after deduction
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  // Delete an expense and refetch incomes/expenses
  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteExpense(expenseId);
      setMessage('Expense deleted successfully');
      // Refetch both expenses and incomes after deletion
      await fetchExpenses(user.sub);
      await fetchIncomes(user.sub); // Ensure incomes are updated after an expense is deleted
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Edit an expense
  const handleEditExpense = (expense) => {
    setExpenseData(expense);
    setEditExpenseId(expense._id);
    setSelectedCategoryName(categories.find((cat) => cat._id === expense.category)?.name || ''); // Update selected category name for display
  };

  // Toggle category dropdown menu
  const toggleCategoryMenu = () => {
    setIsCategoryMenuOpen(!isCategoryMenuOpen);
  };

  // Handle category selection and close the dropdown
  const handleSelectCategory = (categoryId, categoryName) => {
    setExpenseData({ ...expenseData, category: categoryId }); // Store category ID for submission
    setSelectedCategoryName(categoryName); // Display the selected category name
    setIsCategoryMenuOpen(false); // Close the dropdown when a category is selected
  };

  // Helper function to find category name by ID
  const getCategoryNameById = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  // Helper function to find linked income amount by ID
  const getIncomeAmountById = (incomeId) => {
    const income = incomes.find(inc => inc._id === incomeId);
    return income ? `Rs. ${income.amount}` : 'Unknown Income';
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
        return faPlus;
    }
  };

  return (
    <div className="page-content">
      <h2>Expense Management</h2>

      {/* Add or edit expense form */}
      <form onSubmit={handleSaveExpense}>
        <div className='form-group'>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={expenseData.title}
            onChange={(e) => setExpenseData({ ...expenseData, title: e.target.value })}
          />
        </div>

        <div className='form-group'>
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            value={expenseData.amount}
            onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
          />
        </div>

        <div className='form-group'>
          <label htmlFor="category">Category</label>
          <div className="category-dropdown">
            <button type="button" onClick={toggleCategoryMenu}>
              {selectedCategoryName ? selectedCategoryName : 'Select Category'}
            </button>
            {isCategoryMenuOpen && (
              <div className="category-menu">
                <div className="menu-items">
                  {categories.map((cat) => (
                    <div key={cat._id} onClick={() => handleSelectCategory(cat._id, cat.name)} className="menu-item">
                      <span>{cat.name}</span>
                      <FontAwesomeIcon className='deleteIcon' icon={faTrash} onClick={(e) => handleDeleteCategory(cat._id, e)} />
                    </div>
                  ))}
                </div>

                {/* Add Category inside the menu */}
                <div className="menu-header">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                  />
                  <button onClick={handleAddCategory}>
                    <FontAwesomeIcon icon={faPlus} /> Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='form-group'>
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={expenseData.date}
            onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
          />
        </div>

        <div className='form-group'>
          <label htmlFor="linkedIncome">Linked Income</label>
          <select
            id="linkedIncome"
            value={expenseData.linkedIncome}
            onChange={(e) => setExpenseData({ ...expenseData, linkedIncome: e.target.value })}
          >
            <option value="">Select Income</option>
            {incomes.map((inc) => (
              <option key={inc._id} value={inc._id}>{inc.month} - Rs. {inc.amount}</option>
            ))}
          </select>
        </div>

        <button type="submit">{editExpenseId ? 'Update Expense' : 'Add Expense'}</button>
      </form>

      {message && <p>{message}</p>}

      {/* Display expenses in card format */}
      <h3>Your Expenses</h3>
      <div className="expense-list" style={{ display: 'flex', flexWrap: 'wrap' }}>
        {expenses.map((exp) => (
          <div key={exp._id} className="expense-card" style={{ border: '1px solid #ccc', padding: '20px', margin: '10px', width: '200px', borderRadius: '8px' }}>
            <h4>{exp.title}</h4>
            <p className='amt'>Rs. {exp.amount}</p>
            <p><strong>Category:</strong> {getCategoryNameById(exp.category)}</p>
            <p><strong> {formatDate(exp.date)}</strong></p>
            <p className='amtsrc'><strong>Source Income:</strong> {getIncomeAmountById(exp.linkedIncome)}</p>

            <button className='editbtm'onClick={() => handleEditExpense(exp)}>Edit</button>
            <button className='deletebtm' onClick={() => handleDeleteExpense(exp._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseManagement;
