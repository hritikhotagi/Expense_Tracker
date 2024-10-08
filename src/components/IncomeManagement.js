import React, { useState, useEffect } from 'react';
import './IncomeManagement.css'; // CSS for styling
import { useAuth0 } from '@auth0/auth0-react'; // Auth0 for user info
import {
  getIncomes,
  addIncome,
  editIncome,
  lockIncome,
  unlockIncome,
  deleteIncome
} from '../services/apiService'; // Import API service functions
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faLockOpen, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'; // Import icons

const IncomeManagement = () => {
  const { user } = useAuth0(); // Get user info from Auth0
  const [month, setMonth] = useState('');
  const [income, setIncome] = useState('');
  const [incomes, setIncomes] = useState([]);
  const [editIncomeId, setEditIncomeId] = useState(null); // State to track income to edit
  const [message, setMessage] = useState('');
  
  // List of months for dropdown
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch income data on component mount
  useEffect(() => {
    if (user) {
      fetchIncomes(user.sub); // Use Auth0 ID as user ID
    }
  }, [user]);

  const fetchIncomes = async (userId) => {
    try {
      const response = await getIncomes(userId);
      setIncomes(response);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!month || !income) {
      setMessage('Please select a month and enter income amount.');
      return;
    }

    try {
      const newIncome = { month, amount: Number(income), createdBy: user.sub };
      await addIncome(newIncome);
      setMessage(`Income added for ${month}`);
      fetchIncomes(user.sub); // Refresh the list of incomes
    } catch (error) {
      if (error.response && error.response.data.message === "This month's income is locked and cannot be updated.") {
        setMessage("This month's income is locked and cannot be updated.");
      } else {
        console.error('Error adding income:', error);
        setMessage('Error adding income');
      }
    }

    // Reset the form fields
    setMonth('');
    setIncome('');
  };

  const handleLockIncome = async (incomeId) => {
    try {
      await lockIncome(incomeId, user.sub);
      setMessage('Income locked successfully');
      fetchIncomes(user.sub); // Refresh incomes after locking
    } catch (error) {
      console.error('Error locking income:', error);
    }
  };

  const handleUnlockIncome = async (incomeId) => {
    try {
      await unlockIncome(incomeId, user.sub);
      setMessage('Income unlocked successfully');
      fetchIncomes(user.sub); // Refresh incomes after unlocking
    } catch (error) {
      console.error('Error unlocking income:', error);
    }
  };

  const handleDeleteIncome = async (incomeId) => {
    try {
      await deleteIncome(incomeId);
      setMessage('Income deleted successfully');
      fetchIncomes(user.sub); // Refresh the list of incomes
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const handleEditIncome = (incomeId) => {
    const incomeToEdit = incomes.find((inc) => inc._id === incomeId);
    setMonth(incomeToEdit.month);
    setIncome(incomeToEdit.amount);
    setEditIncomeId(incomeId);
  };

  const handleUpdateIncome = async (e) => {
    e.preventDefault();
    if (!month || !income) {
      setMessage('Please select a month and enter income amount.');
      return;
    }

    try {
      const updatedIncome = { month, amount: Number(income), createdBy: user.sub };
      await editIncome(editIncomeId, updatedIncome); // Call the API to update the income
      setMessage('Income updated successfully');
      setEditIncomeId(null); // Reset editing state
      fetchIncomes(user.sub); // Refresh incomes after update
    } catch (error) {
      console.error('Error updating income:', error);
      setMessage('Error updating income');
    }

    // Reset the form fields
    setMonth('');
    setIncome('');
  };

  return (
    <div className="page-content">
      <h2>Income Management</h2>
      
      {/* Form for adding/editing income */}
      <form onSubmit={editIncomeId ? handleUpdateIncome : handleAddIncome}>
        <div className='form'>
          <label htmlFor="month">Month:</label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">Select Month</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="income">Income:</label>
          <input
            type="number"
            id="income"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Enter income amount"
          />
        </div>

        <button type="submit">
          {editIncomeId ? 'Update Income' : 'Add Income'}
        </button>
      </form>

      {message && <p className='errorMsg'>{message}</p>}


      {/* Display incomes in cards */}
      <h3>Your Incomes</h3>
      <div className="income-cards">
        {incomes.map((inc) => (
          <div key={inc._id} className="income-card">
            

            {/* Lock/Unlock icon in top-right corner */}
            <div className="lock-icon">
              {inc.isLocked ? (
                <FontAwesomeIcon
                  icon={faLock}
                  onClick={() => handleUnlockIncome(inc._id)}
                  className="lock-button"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faLockOpen}
                  onClick={() => handleLockIncome(inc._id)}
                  className="lock-button"
                />
              )}
            </div>
            <div className='side'>
              <h3>{inc.month}</h3>
              <p>Rs. {inc.amount}</p>
            </div>
            <h5>{inc.isLocked ? 'Locked' : 'Editable'}</h5>

            {!inc.isLocked && (
              <div className='buttons'>
                <button onClick={() => handleEditIncome(inc._id)}>
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button onClick={() => handleDeleteIncome(inc._id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncomeManagement;
