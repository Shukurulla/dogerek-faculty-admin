import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clubs from "./pages/Clubs";
import Teachers from "./pages/Teachers";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";

function App() {
  const { token } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />

      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/students" element={<Students />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
