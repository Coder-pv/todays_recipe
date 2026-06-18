import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Auth from "./screens/Auth.jsx";
import Home from "./screens/Home.jsx";
import Pantry from "./screens/Pantry.jsx";
import Profile from "./screens/Profile.jsx";
import TodayPlan from "./screens/TodayPlan.jsx";
import { bootstrapAuth } from "./store/authSlice.js";
import { useDispatch } from "./store/redux.js";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          <Route path="pantry" element={<Pantry />} />
          <Route path="today" element={<TodayPlan />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
