import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import { TextField, Button, InputAdornment } from '@mui/material';

import { FaUser, FaLock } from 'react-icons/fa';
import logo from '../icons/login1.png';

function AdminLogin() {
    const DEFAULT_USERNAME = 'admin';
    const DEFAULT_PASSWORD = 'Edu@123';
    const navigate = useNavigate();

    const [username, setusername] = useState(DEFAULT_USERNAME);
    const [password, setPassword] = useState(DEFAULT_PASSWORD);
    const [error, setError] = useState('');


    const handleSubmit = (event) => {
        event.preventDefault();
        if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
            Swal.fire({
                title: 'Login Successful',
                icon: 'success',
                showConfirmButton: true,
                text: 'Redirecting to Dashboard...',
            });
            navigate('/dashboard');
        } else {
            setError('Invalid Credentials');
        }
    };
    return (


        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="container mx-auto bg-indigo-100  rounded-lg shadow-xl overflow-hidden max-w-6xl">
                <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="md:w-1/2 bg-white">
                        <div className="h-full relative">
                            <img
                                src={logo}
                                alt="Login"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-blue-500 opacity-10"></div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className='md:w-1/2 md:p-12 p-6 relative mt-12  items-center justify-center'>
                        <div className='max-w-md  mx-auto space-y-8'>
                            
                            
                                <h2 className='mb-6 text-center text-3xl font-extrabold text-gray-900'>
                                    Admin Login
                                </h2>
                                {error && <div className='text-red-500 text-center mb-4'>{error}</div>}
                           
                            <form className='mt-8 space-y-6' onSubmit={handleSubmit}>

                                <TextField
                                    fullWidth
                                    label="UserName"
                                    name='username'
                                    variant="outlined"
                                    type='text'
                                    onChange={(e) => setusername(e.target.value)}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position='start'>
                                                <FaUser />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Password"
                                    variant="outlined"
                                    name='password'
                                    type='password'
                                    
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position='start'>
                                                <FaLock />
                                            </InputAdornment>
                                        ),
                                    }}
                                />



                                <Button
                                    type='submit'
                                    fullWidth
                                    variant='contained'
                                    className='mt-4 mb-2 bg-blue-500 hover:bg-blue-600 rounded text-white'
                                >
                                    Sign In
                                </Button>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default AdminLogin;