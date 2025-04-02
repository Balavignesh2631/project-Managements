import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { Table, Tooltip } from 'flowbite-react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import Swal from 'sweetalert2';

function TeamMemberPage() {
    const [teamMembers, setTeamMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        job_role: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const fetchTeamMembers = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/teams');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setTeamMembers(data.team_members || []);
            } else {
                // Handle the specific error case we're seeing
                const errorMessage = data.error === '0' ? 
                    'Database connection error. Please check if MySQL is running.' : 
                    (data.error || 'Unknown error occurred');
                    
                setError(errorMessage);
                setTeamMembers([]);
                
                // Don't log as unexpected if we're handling it
                if (data.error === '0' && data.status === 'error') {
                    console.warn("Database connection error detected");
                } else {
                    console.error("API returned error:", data);
                }
            }
        } catch (err) {
            console.error("Error fetching team members:", err);
            setError(err.message);
            setTeamMembers([]);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to load team members: ${err.message}`,
            });
        } finally {
            setIsLoading(false);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            contact: '',
            job_role: '',
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleOpenForm = () => {
        resetForm();
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        resetForm();
    };

    const handleEditTeamMember = (teamMember) => {
        setFormData({
            name: teamMember.name,
            email: teamMember.email,
            contact: teamMember.contact,
            job_role: teamMember.job_role,
        });
        setIsEditing(true);
        setEditingId(teamMember.id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.contact || !formData.job_role) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please fill in all the fields',
            });
            return;
        }

        try {
            const url = isEditing
                ? `http://127.0.0.1:5000/api/teams/${editingId}`
                : 'http://127.0.0.1:5000/api/teams';

            const method = isEditing ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: isEditing ? 'Team member updated successfully' : 'Team member added successfully',
                });
                fetchTeamMembers();
                handleCloseForm();
            } else {
                throw new Error(data.error || 'Operation failed');
            }
        } catch (err) {
            setError(err.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to add/update team member: ${err.message}`,
            });
        }
    };

    const handleDeleteTeamMember = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'You will not be able to recover this team member!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, keep it',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
            });

            if (result.isConfirmed) {
                const response = await fetch(`http://127.0.0.1:5000/api/teams/${id}`, {
                    method: 'DELETE',
                });
                const data = await response.json();

                if (data.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Team member deleted successfully',
                    });
                    fetchTeamMembers();
                } else {
                    throw new Error(data.error || 'Delete operation failed');
                }
            }
        } catch (err) {
            setError(err.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to delete team member: ${err.message}`,
            });
        }
    };


    return (
        <Layout>
            <div className="flex flex-col w-full h-screen bg-gray-200 p-2 sm:p-4 relative z-10">
                <div className="w-full">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Team Members</h1>
                        <button
                            onClick={handleOpenForm}
                            className="mt-3 md:mt-0 flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            <FaPlus className="mr-2" />
                            Add Team Member
                        </button>
                    </div>

                    {isLoading && (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading team members...</p>
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline"> {error}</span>
                        </div>
                    )}

                    {!isLoading && !error && (
                        <div className="w-full rounded-lg shadow bg-white">
                             {!teamMembers || teamMembers.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No team members found. Add a new team member to get started.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <div className="h-[400px] overflow-y-auto">
                                        <Table hoverable={true} className="min-w-full divide-y divide-gray-200">
                                            <Table.Head className="bg-gray-100 sticky top-0 z-10">
                                                <Table.HeadCell className="py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Name
                                                </Table.HeadCell>
                                                <Table.HeadCell className="py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Email
                                                </Table.HeadCell>
                                                <Table.HeadCell className="py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Contact
                                                </Table.HeadCell>
                                                <Table.HeadCell className="py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Job Role
                                                </Table.HeadCell>
                                             
                                                <Table.HeadCell className="py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Actions
                                                </Table.HeadCell>
                                            </Table.Head>

                                            <Table.Body className="bg-white divide-y divide-gray-200">
                                                {teamMembers.map((member) => (
                                                    <Table.Row key={member.id} className="hover:bg-gray-50 transition-colors duration-200">
                                                        <Table.Cell className="px-2 py-2 sm:px-4 text-center sm:py-3 whitespace-nowrap">
                                                            <div className="text-xs sm:text-sm font-medium text-gray-900">{member.name}</div>
                                                        </Table.Cell>
                                                        <Table.Cell className="px-2 py-2 sm:px-4 text-center sm:py-3 whitespace-nowrap">
                                                            <div className="text-xs sm:text-sm font-medium text-gray-900">{member.email}</div>
                                                        </Table.Cell>
                                                        <Table.Cell className="px-2 py-2 sm:px-4 text-center sm:py-3 whitespace-nowrap">
                                                            <div className="text-xs sm:text-sm font-medium text-gray-900">{member.contact}</div>
                                                        </Table.Cell>
                                                        <Table.Cell className="px-2 py-2 sm:px-4 text-center sm:py-3 whitespace-nowrap">
                                                            <div className="text-xs sm:text-sm font-medium text-gray-900">{member.job_role}</div>
                                                        </Table.Cell>
                                                    
                                                        <Table.Cell className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-center text-sm font-medium">
                                                            <div className="flex items-center justify-center space-x-3">
                                                                <Tooltip content="Edit TeamMembers" placement="top">
                                                                <button
                                                                    className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                                                                    onClick={() => handleEditTeamMember(member)}
                                                                >
                                                                    <FaEdit size={16}  />
                                                                </button>
                                                                </Tooltip>

                                                                <Tooltip content="Delete TeamMember" placement="top">
                                                                <button
                                                                    className="text-red-600 hover:text-red-800 transition-colors duration-150"
                                                                    onClick={() => handleDeleteTeamMember(member.id)}
                                                                >
                                                                    <FaTrash size={16}  />
                                                                </button>
                                                                </Tooltip>
                                                            </div>
                                                        </Table.Cell>
                                                    </Table.Row>
                                                ))}
                                            </Table.Body>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={showForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
                <DialogTitle className="bg-gray-100 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {isEditing ? 'Edit Team Member' : 'Add New Team Member'}
                        </h2>
                        <button onClick={handleCloseForm} className="text-gray-500 hover:text-gray-700">
                            <FaTimes />
                        </button>
                    </div>
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit} className="py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter team member name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter email address"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Number
                                    </label>
                                    <input
                                        type="number"
                                        id="contact"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter contact number"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="job_role" className="block text-sm font-medium text-gray-700 mb-1">
                                        Job Role
                                    </label>
                                    <input
                                        type="text"
                                        id="job_role"
                                        name="job_role"
                                        value={formData.job_role}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter job role"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={handleCloseForm}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <FaTimes className="mr-2 -ml-1" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <FaSave className="mr-2 -ml-1" />
                                {isEditing ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}

export default TeamMemberPage;