import React from 'react';
import { Routes, Route } from 'react-router-dom';

import {
  ProfilePage,
  SettingsPage,
  TodayCaloriesPage,
  MyFoodsPage,
  ActivitiesPage,
  TipsPage,
  FoodInputPage,
  NotFoundPage,
} from 'src/pages/pageListAsync';
import PrivateRoute from 'src/components/routing/PrivateRoute';
import 'src/styles/Auth.scss';

const Application = () => {
  return (
    <div className="main-layout text-center p-5 m-5 mx-auto bg-light">
      <Routes>
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/tips" element={<TipsPage />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/today"
          element={
            <PrivateRoute>
              <TodayCaloriesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-foods"
          element={
            <PrivateRoute>
              <MyFoodsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/food-input"
          element={
            <PrivateRoute>
              <FoodInputPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default Application;
