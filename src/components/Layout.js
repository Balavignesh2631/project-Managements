import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import {
    FaUser,
    FaSignOutAlt,
    FaTachometerAlt,
    FaUsers,
    FaUserFriends,
    FaProjectDiagram,
    FaMoneyBillWave,
    FaBars
} from 'react-icons/fa';

function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [activePath, setActivePath] = useState('');

    // Update active path when location changes
    useEffect(() => {
        setActivePath(location.pathname);
    }, [location]);

    const handleLogout = () => {
        navigate('/');
    };

    const handleNavigation = (path) => {
        navigate(path);
        setSidebarOpen(false); // Close sidebar when navigating
    };

    const menuItems = [
        {
            title: 'Dashboard',
            icon: <FaTachometerAlt />,
            link: '/dashboard',
        },
        {
            title: 'Clients',
            icon: <FaUsers />,
            link: '/clients',
        },
        {
            title: 'Team Members',
            icon: <FaUserFriends />,
            link: '/team',
        },
        {
            title: 'Project Details',
            icon: <FaProjectDiagram />,
            link: '/projects',
        },
        {
            title: 'Payments Details',
            icon: <FaMoneyBillWave />,
            link: '/payments',
        },
    ];

    return (
        <div className='min-h-screen flex flex-col'>
            {/* Header Section */}
            <header className="bg-blue-600 shadow-md px-4 py-3 flex justify-between items-center z-30 relative">
                <div className='flex items-center'>
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className='hover:text-gray-300 focus:outline-none lg:hidden'
                        aria-label="Toggle sidebar"
                    >
                        <FaBars size={24} className='text-white' />
                    </button>
                    <h1 className='text-xl text-white font-semibold ml-2'>
                       SSR Infinity
                    </h1>
                </div>

                <div className='relative mr-8'>
                    <button
                        onClick={() => setDropdownOpen(!isDropdownOpen)}
                        className='flex items-center text-white space-x-2 hover:text-gray-300'
                    >
                        <FaUser size={28} />
                        <span className='text-md font-italic text-white'>Admin</span>
                    </button>

                    {isDropdownOpen && (
                        <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50'>
                            <button
                                onClick={handleLogout}
                                className='flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full'
                            >
                                <FaSignOutAlt className='mr-2' />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Sidebar and Main Content */}
            <div className='flex flex-1 relative'>
                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}
                
                {/* Sidebar */}
                <aside
                    className={`
                        bg-gray-800 text-white w-64 fixed h-screen transition-transform duration-300 ease-in-out z-40
                        lg:relative lg:translate-x-0 overflow-y-auto
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    <nav className='p-4'>
                        <ul className='space-y-4'>
                            {menuItems.map((item, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => handleNavigation(item.link)}
                                        className={`
                                            flex items-center p-3 rounded-lg w-full text-left
                                            transition-colors duration-200 ease-in-out
                                            ${activePath === item.link 
                                                ? 'bg-blue-600 text-white' 
                                                : 'text-white hover:bg-gray-700 active:bg-gray-600'}
                                        `}
                                    >
                                        <span className="text-xl mr-3">{item.icon}</span>
                                        <span>{item.title}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
                
                {/* Main Content */}
                <main className={`
                    flex-1 transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}
                    w-full
                `}>
                    {children}
                </main>
            </div>
        </div>
    )
}

export default Layout
