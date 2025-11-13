import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { addMealFromAPI, getTodayMeals } from '../actions/foodInput';
import DailyNutritionChart from '../components/charts/DailyNutritionChart';
import '../styles/FoodInputPage.css';

const FoodInputPage = ({ addMealFromAPI }) => {
  const [mode, setMode] = useState('manual'); // 'manual' or 'ai'
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [utensil, setUtensil] = useState('Katori');
  const [foodImage, setFoodImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dailyData, setDailyData] = useState([]);

  // Fetch today's meals on component mount and after adding meal
  useEffect(() => {
    const fetchTodayMeals = async () => {
      try {
        const meals = await getTodayMeals();
        setDailyData(meals);
      } catch (err) {
        console.error('Failed to fetch today meals:', err);
      }
    };

    fetchTodayMeals();
  }, []);

  const handleAddMeal = async () => {
    setLoading(true);
    setError('');

    try {
      if (mode === 'manual') {
        // Manual Mode - Send food name and utensil details to Grok API
        const response = await axios.post('https://api.x.ai/v1/chat/completions', {
          model: 'grok-beta',
          messages: [
            {
              role: 'user',
              content: `Analyze this food item and provide nutritional information: ${foodName}, Quantity: ${quantity}, Utensil: ${utensil}. Please return JSON with calories, protein (g), carbs (g), fats (g), and portion size.`
            }
          ],
          temperature: 0.7,
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY || 'your-api-key-here'}`,
            'Content-Type': 'application/json'
          }
        });

        const nutritionData = JSON.parse(response.data.choices[0].message.content);
        console.log('Manual Mode Nutrition Data:', nutritionData);
        
        // Store in database using Redux action
        await addMealFromAPI({
          foodName,
          quantity,
          utensil,
          calories: nutritionData.calories,
          protein: nutritionData.protein,
          carbs: nutritionData.carbs,
          fats: nutritionData.fats,
          portionSize: nutritionData.portionSize,
          mode: 'manual'
        });
        
        // Refresh daily data
        const meals = await getTodayMeals();
        setDailyData(meals);
        
        // Clear form
        setFoodName('');
        setQuantity(1);
        setUtensil('Katori');
        
      } else {
        // TODO: Implement AI Mode API call
        console.log('AI Mode:', { foodImage });
      }
    } catch (err) {
      setError('Failed to analyze food. Please try again.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const utensilOptions = [
    'Katori', 'Cup', 'Bowl', 'Glass', 'Mug', 'Plate', 
    'Tablespoon', 'Teaspoon', 'Slice', 'Handful', 'Ounce'
  ];

  return (
    <div className="food-input-page">
      <h1>Food Input</h1>
      <div className="mode-toggle">
        <button 
          className={mode === 'manual' ? 'active' : ''} 
          onClick={() => setMode('manual')}
        >
          Manual Mode
        </button>
        <button 
          className={mode === 'ai' ? 'active' : ''} 
          onClick={() => setMode('ai')}
        >
          AI Mode
        </button>
      </div>

      {mode === 'manual' ? (
        <div className="manual-mode">
          <input 
            type="text" 
            placeholder="Enter food name" 
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            disabled={loading}
          />
          <input 
            type="number" 
            placeholder="Quantity" 
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={loading}
          />
          <select value={utensil} onChange={(e) => setUtensil(e.target.value)} disabled={loading}>
            {utensilOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button onClick={handleAddMeal} disabled={loading}>
            {loading ? 'Analyzing...' : 'Add Meal'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      ) : (
        <div className="ai-mode">
          <input 
            type="file" 
            onChange={(e) => setFoodImage(e.target.files[0])}
          />
          <button onClick={handleAddMeal}>Upload and Analyze</button>
        </div>
      )}

      <DailyNutritionChart dailyData={dailyData} />
    </div>
  );
};

const mapStateToProps = (state) => ({
  // Add any state mapping if needed
});

export default connect(mapStateToProps, { addMealFromAPI, getTodayMeals })(FoodInputPage);
