import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AttendanceForm from './pages/AttendanceForm';
import LeaveApplicationForm from './pages/LeaveApplicationForm';
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/attendanceForm' element={<AttendanceForm/>}/>
        <Route path='/leaveApplicationForm' element={<LeaveApplicationForm/>}/>
      </Routes>
    </Router>
  );
}

export default App;