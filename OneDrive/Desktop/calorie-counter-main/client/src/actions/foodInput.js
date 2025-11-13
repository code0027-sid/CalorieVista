import axios from 'axios';

import {
  ADD_MEAL_FROM_API,
  SET_API_LOADING,
  SET_API_ERROR,
} from './types';

// Add meal from API response (Manual or AI mode)
export const addMealFromAPI = (mealData) => async (dispatch) => {
  dispatch({
    type: SET_API_LOADING,
  });

  try {
    // Save meal to database
    const res = await axios.post('meals/add', {
      foodName: mealData.foodName,
      quantity: mealData.quantity,
      utensil: mealData.utensil,
      calories: mealData.calories,
      protein: mealData.protein,
      carbs: mealData.carbs,
      fats: mealData.fats,
      portionSize: mealData.portionSize,
      mode: mealData.mode, // 'manual' or 'ai'
      timestamp: new Date().toISOString(),
    });

    dispatch({
      type: ADD_MEAL_FROM_API,
      payload: res.data,
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SET_API_ERROR,
      payload: err.response?.data?.msg || 'Failed to save meal',
    });
    throw err;
  }
};

// Get today's meals for chart
export const getTodayMeals = () => async (dispatch) => {
  try {
    const res = await axios.get('meals/today');
    return res.data;
  } catch (err) {
    console.error('Failed to get today meals:', err);
    return [];
  }
};
