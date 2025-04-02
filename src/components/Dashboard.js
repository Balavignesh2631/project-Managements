import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { FaUsers, FaProjectDiagram, FaHourglassHalf, FaClipboardList } from 'react-icons/fa';
import { MdAttachMoney } from 'react-icons/md';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    totalTeamMembers: 0,
    totalProjects: 0,
    totalAmount: 0,
    pendingAmount: 0,
    totalPayments: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:5000/api/dashboard-data');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (data.status === 'success') {
          setDashboardData(data.dashboard);
        } else {
          throw new Error(data.error || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row h-screen w-full bg-gray-100 p-4">
        <div className="w-full">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-500 mb-6">Welcome to your dashboard</p>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading dashboard data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Clients */}
                <div className="bg-blue-500 shadow-md rounded-lg p-6 flex items-center transform hover:scale-105 transition-transform duration-300">
                <div className="p-4 bg-blue-100 rounded-full">
                  <FaUsers className="text-blue-600 text-3xl" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-white">Total Clients</h2>
                  <p className="text-2xl font-bold text-white">{dashboardData.totalClients}</p>
                </div>
              </div>

              {/* Total Team Members */}
              <div className="bg-green-500 shadow-md rounded-lg p-6 flex items-center transform hover:scale-105 transition-transform duration-300">
                <div className="p-4 bg-green-100 rounded-full">
                  <FaUsers className="text-green-600 text-3xl" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-white">Team Members</h2>
                  <p className="text-2xl font-bold text-white">{dashboardData.totalTeamMembers}</p>
                </div>
              </div>

              {/* Total Projects */}
              <div className="bg-purple-500 shadow-md rounded-lg p-6 flex items-center transform hover:scale-105 transition-transform duration-300">
                <div className="p-4 bg-purple-100 rounded-full">
                  <FaProjectDiagram className="text-purple-600 text-3xl" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-white">Total Projects</h2>
                  <p className="text-2xl font-bold text-white">{dashboardData.totalProjects}</p>
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-yellow-500 shadow-md rounded-lg p-6 flex items-center transform hover:scale-105 transition-transform duration-300">
                <div className="p-4 bg-yellow-100 rounded-full">
                  <MdAttachMoney className="text-yellow-600 text-3xl" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-white">Total Amount</h2>
                  <p className="text-2xl font-bold text-white">₹{dashboardData.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* Pending Amount */}
              <div className="bg-red-500 shadow-md rounded-lg p-6 flex items-center transform hover:scale-105 transition-transform duration-300">
                <div className="p-4 bg-red-100 rounded-full">
                  <FaHourglassHalf className="text-red-600 text-3xl" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-white">Pending Amount</h2>
                  <p className="text-2xl font-bold text-white">₹{dashboardData.pendingAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* Total Payments */}
              <div className="bg-indigo-500 shadow-md rounded-lg p-6 flex items-center transform hover:scale-105 transition-transform duration-300">
                <div className="p-4 bg-indigo-100 rounded-full">
                  <FaClipboardList className="text-indigo-600 text-3xl" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-white">Total Payments</h2>
                  <p className="text-2xl font-bold text-white">{dashboardData.totalPayments}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;