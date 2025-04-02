import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Ensure these imports match the export type in their respective files
import AdminLogin from './components/AdminLogin';
import Dashboard from './components/Dashboard';
import ClientPage from './components/ClientPage';
import TeamMemberPage from './components/TeamMemberPage';
import ProjectDetailsPage from './components/ProjectDetailsPage';
import PaymentDetailsPage from './components/PaymentDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<AdminLogin/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/clients' element={<ClientPage/>}/>
        <Route path='/team' element={<TeamMemberPage/>}/>
        <Route path='/projects' element={<ProjectDetailsPage/>}/>
        <Route path='/payments' element={<PaymentDetailsPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;
