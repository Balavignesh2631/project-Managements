import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'

import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { Table, Tooltip } from 'flowbite-react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import Swal from 'sweetalert2';


function ClientPage() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  //    form state for adding/editing clients
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    company: '',
    address: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // fetch clients from API
  useEffect(
    () => {
      fetchClients();
    }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/clients');
      const data = await response.json();

      if (data.status === 'success') {
        setClients(data.clients);
        console.log("Fetched clients:", data.clients); // Debug log
      } else {
        throw new Error(data.error || 'Failed to fetch clients')
      }
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to load clients: ${err.message}`,
      });
    } finally {
      setIsLoading(false)
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
      company: '',
      address: '',
    });
    setIsEditing(false)
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

  const handleEditClient = (client) => {
    setFormData({
      name: client.name,
      email: client.email,
      contact: client.contact,
      company: client.company,
      address: client.address,
    });
    setIsEditing(true)
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name || !formData.email || !formData.contact || !formData.company || !formData.address) {
      Swal.fire({
        icon: 'warning',
        title: ' Validation Error',
        text: 'Please fill in all fields',
      });
      return;
    }
    try {
      const url = isEditing ?
        `http://127.0.0.1:5000/api/clients/${editingId}` :
        `http://127.0.0.1:5000/api/clients`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(
        url, {
        method,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(formData),
      }
      );

      const data = await response.json();

      if (data.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: isEditing ? 'client updated successfully' : 'client added successfully',
        });
        fetchClients();
        handleCloseForm();
      } else {
        throw new Error(data.error || 'operation falied')
      }
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `operation failed: ${err.message}`,
      });
    }
  };

  const handleDeleteClient = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are You Sure?',
        text: 'You would not able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const response = await fetch(`http://127.0.0.1:5000/api/clients/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();

        if (data.status === 'success') {
          Swal.fire(
            'Deleted!',
            'client has been deleted',
            'success'
          );
          fetchClients();
        } else {
          throw new Error(data.error || 'Delete operation failed');
        }
      }
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to delete client: ${err.message}`,
      });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col w-full h-screen bg-gray-200 p-2 sm:p-4 relative z-10">
        <div className="w-full">
          <div className='flex flex-col md:flex-row justify-between items-center mb-4'>
            <h1 className="text-2xl font-bold">Clients</h1>
            <button
              onClick={handleOpenForm}
              className='mt-3 md:mt-0 flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
            >
              <FaPlus className='mr-2' />
              Add Client
            </button>
          </div>

          {/* Loading and Error States */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading clients...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {/* Client Table */}
          {!isLoading && !error && (
            <div className="w-full rounded-lg shadow bg-white">
              {clients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No clients found. Add a new client to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="h-[400px] overflow-y-auto">
                    <Table hoverable={true} className='min-w-full divide-y divide-gray-200'>
                      <Table.Head className='bg-gray-100 sticky top-0 z-10'>
                        <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider'>
                          Name
                        </Table.HeadCell>
                        <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider'>
                          Email
                        </Table.HeadCell>
                        <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider'>
                          Contact
                        </Table.HeadCell>
                        <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider'>
                          Address
                        </Table.HeadCell>
                        <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider'>
                         Company Name
                        </Table.HeadCell>
                        <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider'>
                          Actions
                        </Table.HeadCell>
                      </Table.Head>

                      <Table.Body className='bg-white divide-y divide-gray-200'>
                        {clients.map((client) => (
                          <Table.Row key={client.id}
                            className='hover:bg-gray-50 transition-colors duration-200'
                          >
                            <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 whitespace-nowrap'>
                              <div className='text-xs sm:text-sm font-medium text-gray-900'>{client.name}</div>
                            </Table.Cell>

                            <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 whitespace-nowrap'>
                              <div className='text-xs sm:text-sm font-medium text-gray-900'>{client.email}</div>
                            </Table.Cell>

                            <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 whitespace-nowrap'>
                              <div className='text-xs sm:text-sm font-medium text-gray-900'>{client.contact}</div>
                            </Table.Cell>

                            <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 whitespace-nowrap'>
                              <div className='text-xs sm:text-sm font-medium text-gray-900'>{client.address}</div>
                            </Table.Cell>

                            <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 whitespace-nowrap'>
                              <div className='text-xs sm:text-sm font-medium text-gray-900'>{client.company}</div>
                            </Table.Cell>


                            <Table.Cell className='px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-center text-sm font-medium'>
                              <div className='flex items-center justify-center space-x-3'>
                                <Tooltip content="Edit Clients" placement="top">
                                <button
                                  className='text-blue-600 hover:text-blue-800 transition-colors duration-150'
                                  onClick={() => handleEditClient(client)}
                                >
                                  <FaEdit size={16}  />
                                </button>
                                </Tooltip>

                                <Tooltip content="Delete Clients" placement="top">
                                <button
                                  className='text-red-600 hover:text-red-800 transition-colors duration-150'
                                  onClick={() => handleDeleteClient(client.id)}
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

      {/* Add/Edit Client Dialog */}
      <Dialog
        open={showForm}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="bg-gray-100 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {isEditing ? 'Edit Client' : 'Add New Client'}
            </h2>
            <button
              onClick={handleCloseForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter client name"
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

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter contact number"
                  />
                </div>

                <div>
                  <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter project name"
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
  )
}

export default ClientPage
