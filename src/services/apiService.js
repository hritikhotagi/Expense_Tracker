import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';
// process.env.REACT_APP_BACKEND_URL;

export const registerOrLoginUser = async (userData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/user/register-or-login`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error registering user');
  }
};

// Category-related API calls
export const createCategory = async (name, userId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/category/add`, {
      name,
      createdBy: userId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCategories = async (userId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/category`, { createdBy: userId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/category/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Income-related API calls
export const getIncomes = async (createdBy) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/income`, { createdBy });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  

export const addIncome = async (incomeData) => {
    console.log(incomeData)
  try {
    const response = await axios.post(`${API_BASE_URL}/api/income/add`, incomeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editIncome = async (incomeId, updatedData) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/income/${incomeId}/edit`, updatedData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  

export const lockIncome = async (incomeId, createdBy) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/api/income/${incomeId}/lock`, {
      createdBy
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const unlockIncome = async (incomeId, createdBy) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/api/income/${incomeId}/unlock`, {
      createdBy
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteIncome = async (incomeId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/income/${incomeId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getExpenses = async (createdBy) => {
  console.log("aaaa\n",createdBy)
    try {
      const response = await axios.post(`${API_BASE_URL}/api/expenses`, { createdBy });
      return response.data;

    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching expenses');
    }
  };
  
  // Create a new expense
  export const addExpense = async (expenseData) => {
 
    try {
      const response = await axios.post(`${API_BASE_URL}/api/expenses/add`, expenseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error adding expense');
    }
  };
  
  // Edit an existing expense by ID
  export const editExpense = async (expenseId, updatedData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/expenses/${expenseId}`, updatedData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error updating expense');
    }
  };
  
  // Delete an expense by ID
  export const deleteExpense = async (expenseId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/expenses/${expenseId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error deleting expense');
    }
  };
  
  // Deduct the amount from linked income when an expense is created
  export const deductIncome = async (incomeId, amount) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/income/${incomeId}/deduct`, { amount });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error deducting income');
    }
  };