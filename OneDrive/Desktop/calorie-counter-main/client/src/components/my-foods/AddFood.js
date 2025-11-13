import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import ActionModal from 'src/components/modals/ActionModal';
import TextInput from 'src/components/forms/TextInput';
import FileInput from 'src/components/forms/FileInput';
import AsyncButton from 'src/components/buttons/AsyncButton';
import Groq from 'groq-sdk';

const AddFood = ({ modalRef, handleClose, handleGetFoods }) => {
  const [mode, setMode] = useState('manual'); // 'manual' or 'ai'
  // We use the ref so we can reset the value of the file input since it is not a controlled component
  const imageInputRef = useRef();

  // We use this ref so we can clear the success message's timeout on component unmounting
  const messageTimerRef = useRef(null);

      const [state, setState] = useState({
    quantity: '',
    utensil: '',
    name: '',
    caloriesPerPortion: '',
    image: null,
    loading: false,
    errors: [],
    successMessage: '',
  });

  useEffect(() => {
    // Clearning the timeout
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  const handleOnChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleSetImage = (image) => {
    setState({ ...state, image });
  };

  const handleEmptyImage = () => {
    imageInputRef.current.value = '';
    setState({ ...state, image: null });
  };

    const handleAddFood = async (e) => {
    e.preventDefault();
    if (mode === 'manual') {
      handleManualSubmit();
    } else {
      handleAiSubmit();
    }
  };

    const handleManualSubmit = async () => {
    setState({ ...state, loading: true, errors: [] });
    const { name, quantity, utensil } = state;

    const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_API_KEY || 'your-api-key-here', dangerouslyAllowBrowser: true });

    const prompt = `Provide the calorie count and nutrient breakdown (protein, carbs, fats) for ${quantity} ${utensil} of ${name}. Return the data in JSON format with keys: calories, protein, carbs, fats.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gemma-7b-it',
      });

      const response = JSON.parse(completion.choices[0]?.message?.content || '{}');

      const foodData = {
        name,
        caloriesPerPortion: response.calories,
        protein: response.protein,
        carbs: response.carbs,
        fats: response.fats,
      };

      const res = await axios.post('foods', foodData);

      setState((prevState) => ({
        ...prevState,
        loading: false,
        name: '',
        quantity: '',
        utensil: '',
        successMessage: res.data,
      }));

      handleGetFoods();

      messageTimerRef.current = setTimeout(() => {
        setState((prevState) => ({ ...prevState, successMessage: '' }));
      }, 6000);
    } catch (error) {
      console.error('Error with Grok API:', error);
      const { response: { data: { errors } } } = error;
      setState((prevState) => ({ ...prevState, errors, loading: false }));
    }
  };


  const handleAiSubmit = async () => {
    setState({ ...state, loading: true, errors: [] });
    const { image } = state;

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

    try {
      const base64Image = await toBase64(image);

      const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_API_KEY || 'your-api-key-here', dangerouslyAllowBrowser: true });

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Detect the food in the image, estimate the portion size, and return the calories and nutrient breakdown (protein, carbs, fats). Return the data in JSON format with keys: foodName, portionSize, calories, protein, carbs, fats.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
        model: 'llava-llama-3-8b-beta',
      });

      const response = JSON.parse(completion.choices[0]?.message?.content || '{}');

      const foodData = {
        name: response.foodName,
        caloriesPerPortion: response.calories,
        protein: response.protein,
        carbs: response.carbs,
        fats: response.fats,
      };

      const res = await axios.post('foods', foodData);

      setState((prevState) => ({
        ...prevState,
        loading: false,
        image: null,
        successMessage: res.data,
      }));
      imageInputRef.current.value = '';

      handleGetFoods();

      messageTimerRef.current = setTimeout(() => {
        setState((prevState) => ({ ...prevState, successMessage: '' }));
      }, 6000);
    } catch (error) {
      console.error('Error with Grok API:', error);
      setState((prevState) => ({ ...prevState, errors: [{ msg: 'Failed to process image with AI.' }], loading: false }));
    }
  };


  const {
    name,
    caloriesPerPortion,
    image,
    loading,
    successMessage,
    errors,
  } = state;

  return (
    <ActionModal
      modalRef={modalRef}
      title="Add Food"
      handleClose={handleClose}
      actions={
        <>
          <button
            className="primary-button btn-lg rounded-pill ms-0 ms-sm-4"
            type="button"
            disabled={!image}
            onClick={handleEmptyImage}
          >
            Empty Image
          </button>
          <AsyncButton
            type="submit"
                        text="Add Meal"
            className="primary-button btn-lg rounded-pill ms-0 ms-sm-4"
            loading={loading}
                        disabled={
              (mode === 'manual' && (!name || !state.quantity || !state.utensil)) ||
              (mode === 'ai' && !image)
            }
            form="add-food-form"
          />
        </>
      }
    >
            <div className="px-5">
        <div className="btn-group w-100">
          <button
            type="button"
            className={`btn ${mode === 'manual' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setMode('manual')}
          >
            Manual Mode
          </button>
          <button
            type="button"
            className={`btn ${mode === 'ai' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setMode('ai')}
          >
            AI Mode
          </button>
        </div>
      </div>

      <form className="px-5 mt-3" id="add-food-form" onSubmit={handleAddFood}>
                {mode === 'manual' ? (
          <>
            <TextInput
              name="name"
              value={name}
              label="Food Name*"
              type="text"
              required
              errors={errors}
              onChange={handleOnChange}
            />
            <TextInput
              name="quantity"
              value={state.quantity}
              label="Quantity/Amount*"
              type="number"
              required
              min={1}
              errors={errors}
              onChange={handleOnChange}
            />
            <div className="mb-3">
              <label htmlFor="utensil" className="form-label">Utensil*</label>
              <select
                id="utensil"
                name="utensil"
                className="form-select"
                value={state.utensil}
                onChange={handleOnChange}
                required
              >
                <option value="" disabled>Select a utensil</option>
                <option value="Katori">Katori</option>
                <option value="Cup">Cup</option>
                <option value="Bowl">Bowl</option>
                <option value="Glass">Glass</option>
                <option value="Mug">Mug</option>
                <option value="Plate">Plate</option>
                <option value="Tablespoon">Tablespoon</option>
                <option value="Teaspoon">Teaspoon</option>
                <option value="Slice">Slice</option>
                <option value="Handful">Handful</option>
                <option value="Ounce">Ounce</option>
              </select>
            </div>
          </>
        ) : (
          <FileInput
            name="image"
            label="Upload a food image"
            handleChange={handleSetImage}
            reference={imageInputRef}
            errors={errors}
            accept="image/png, image/jpg, image/jpeg"
          />
        )}

        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}
      </form>
    </ActionModal>
  );
};

AddFood.propTypes = {
  modalRef: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleGetFoods: PropTypes.func.isRequired,
};

export default AddFood;
