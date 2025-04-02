import React, { useState, useEffect } from 'react';
import { Table, Modal, Button, Label, TextInput, Select, Tooltip } from 'flowbite-react';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import { MdPayment, MdAttachMoney } from 'react-icons/md';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';

function PaymentDetailsPage() {
    const [payments, setPayments] = useState([]);
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPayment, setCurrentPayment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
 

    const [formData, setFormData] = useState({
        client_id: '',
        project_id: '',
        total_amount: '',
        paid_amount: '0',
        pending_amount:'0',
        payment_date: new Date().toISOString().split('T')[0]
    });

    // Fetch payments, clients, and projects on component mount
    useEffect(() => {
        fetchClients()
        fetchPayments();

    }, []);

// Add this useEffect hook after your other useEffect hooks
useEffect(() => {
    // This effect runs when currentPayment changes or when projects are loaded
    if (currentPayment && projects.length > 0 && isModalOpen) {
        console.log("Current payment and projects available, updating project selection");
        
        // Try to find a matching project
        let projectId = null;
        
        if (currentPayment.project_name) {
            // Try exact match first
            let projectMatch = projects.find(p => 
                p.name.toLowerCase() === currentPayment.project_name.toLowerCase()
            );
            
            // If no exact match, try partial match
            if (!projectMatch) {
                projectMatch = projects.find(p => 
                    p.name.toLowerCase().includes(currentPayment.project_name.toLowerCase()) ||
                    currentPayment.project_name.toLowerCase().includes(p.name.toLowerCase())
                );
            }
            
            // If still no match and there's only one project, use that
            if (!projectMatch && projects.length === 1) {
                projectMatch = projects[0];
                console.log(`Using the only available project: ${projectMatch.name}`);
            }
            
            if (projectMatch) {
                projectId = projectMatch.id;
                console.log(`Found project ID ${projectId} for project name ${currentPayment.project_name} (matched with ${projectMatch.name})`);
            }
        }
        
        // Update the form data with the project ID
        setFormData(prev => ({
            ...prev,
            project_id: projectId ? projectId.toString() : ''
        }));
    }
}, [currentPayment, projects, isModalOpen]);

   

    // Fetch all payments
    const fetchPayments = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:5000/api/payments');
    
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            // Check content type to ensure it's JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }
    
            const paymentData = await response.json();
    
            if (paymentData.status === 'success') {
                // Add debugging to check payment structure
                console.log("Raw payment data from API:", paymentData.payments);
                
                // Check if client_id and project_id are present
                const firstPayment = paymentData.payments[0];
                if (firstPayment) {
                    console.log("First payment client_name:", firstPayment.client_name);
                    console.log("First payment project_name:", firstPayment.project_name);
                    
                    // We need to extract client_id and project_id from the data
                    console.log("First payment full data:", firstPayment);
                }
    
                // Process payments and extract IDs if needed
                const processedPayments = paymentData.payments.map(payment => {
                    // Extract client_id and project_id if they exist in the payment object
                    // If not, we'll need to handle this in the openModal function
                    return {
                        ...payment,
                        pending_amount: parseFloat(payment.total_amount) - parseFloat(payment.paid_amount),
                        payment_date: payment.payment_date || 'No Date Available'
                    };
                });
                
                console.log("Processed payments:", processedPayments);
                setPayments(processedPayments);
            } else {
                throw new Error(paymentData.error || 'Failed to fetch payments');
            }
        } catch (err) {
            console.error('Error fetching payments:', err.message);
            setError(err.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to load payments: ${err.message}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch clients for dropdown
    const fetchClients = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/clients-dropdown');

            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Check content type to ensure it's JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }

            const data = await response.json();

            if (data.status === 'success') {
                setClients(data.clients);
            } else {
                throw new Error(data.error || 'Failed to fetch clients');
            }
        } catch (err) {
            console.error('Error fetching clients:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to load clients: ${err.message}`,
            });
        }
    };


    // Fetch projects for a specific client
    const fetchProjectsByClient = async (clientId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/projects-by-client/${clientId}`);

            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Check content type to ensure it's JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }

            const data = await response.json();

           
            if (data.status === 'success') {
                console.log(`Loaded ${data.projects.length} projects for client ID ${clientId}: `, data.projects);
                  // Ensure projects have proper id and name properties
            const processedProjects = data.projects.map(project => ({
                id: project.id,
                name: project.name
            }));
            
            setProjects(processedProjects);
            return processedProjects;
            } else {
                throw new Error(data.error || 'Failed to fetch projects for this client');
            }
        } catch (err) {
            console.error('Error fetching client projects:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to load projects: ${err.message}`,
            });
            setProjects([]); 
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Handle client change to load related projects
    const handleClientChange = async (e) => {
        const { value } = e.target;
        console.log("Client changed to:", value);

        // Update form data with selected client
        setFormData({
            ...formData,
            client_id: value,
            project_id: '' // Reset project selection when client changes
        });

        // If a client is selected, fetch their projects
        if (value) {
            console.log(`Fetching projects for client ID: ${value}`);
            await fetchProjectsByClient(value);
        } else {
            // If no client selected, reset projects list
            setProjects([]);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate form data
            if (!formData.client_id || !formData.project_id || !formData.total_amount) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please fill in all required fields'
                });
                return;
            }

            // Convert string values to numbers for numeric fields
            const processedData = {
                client_id: parseInt(formData.client_id),
                project_id: parseInt(formData.project_id),
                total_amount: parseFloat(formData.total_amount),
                paid_amount: parseFloat(formData.paid_amount || 0),
                payment_date: formData.payment_date
            };

            const url = currentPayment
                ? `http://127.0.0.1:5000/api/payments/${currentPayment.id}`
                : 'http://127.0.0.1:5000/api/payments';

            const method = currentPayment ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(processedData)
            });

            const data = await response.json();

            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: currentPayment ? 'Payment updated successfully' : 'Payment created successfully',
                });
                setIsModalOpen(false);
                fetchPayments();
                resetForm();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Failed to process payment'
                });
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to connect to the server'
            });
        }
    };
    // Handle payment deletion
    const handleDeletePayment = async (id) => {
        Swal.fire({
            title: 'Are You Sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/api/payments/${id}`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();

                    if (data.status === 'success') {
                        Swal.fire(
                            'Deleted!',
                            'Payment has been deleted.',
                            'success'
                        );
                        fetchPayments();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message || 'Failed to delete payment'
                        });
                    }
                } catch (error) {
                    console.error('Error deleting payment:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to connect to the server'
                    });
                }
            }
        });
    };

  // Open modal for adding or editing payment - FIXED VERSION
const openModal = async (payment = null) => {
    if (payment) {
        console.log("Opening modal with payment:", payment);
        
        // Set current payment
        setCurrentPayment(payment);
        
        // Format the date
        const formattedDate = payment.payment_date
            ? payment.payment_date.split('T')[0]
            : new Date().toISOString().split('T')[0];
        
        // Calculate pending amount
        const totalAmount = parseFloat(payment.total_amount) || 0;
        const paidAmount = parseFloat(payment.paid_amount) || 0;
        const pendingAmount = totalAmount - paidAmount;
        
        try {
            // We need to find the client_id based on client_name
            let clientId = null;
            let projectId = null;
            
            // First, find the client ID by name
            if (payment.client_name) {
                const clientMatch = clients.find(c => 
                    c.name.toLowerCase() === payment.client_name.toLowerCase()
                );
                if (clientMatch) {
                    clientId = clientMatch.id;
                    console.log(`Found client ID ${clientId} for client name ${payment.client_name}`);
                } else {
                    console.warn(`Could not find client ID for name: ${payment.client_name}`);
                }
            }
            
            // If we found a client ID, fetch their projects
            if (clientId) {
                await fetchProjectsByClient(clientId);
                
                // Now find the project ID by name - using a more flexible matching approach
                if (payment.project_name && projects.length > 0) {
                    // Try exact match first
                    let projectMatch = projects.find(p => 
                        p.name.toLowerCase() === payment.project_name.toLowerCase()
                    );
                    
                    // If no exact match, try partial match
                    if (!projectMatch) {
                        projectMatch = projects.find(p => 
                            p.name.toLowerCase().includes(payment.project_name.toLowerCase()) ||
                            payment.project_name.toLowerCase().includes(p.name.toLowerCase())
                        );
                    }
                    
                    // If still no match and there's only one project, use that
                    if (!projectMatch && projects.length === 1) {
                        projectMatch = projects[0];
                        console.log(`Using the only available project: ${projectMatch.name}`);
                    }
                    
                    if (projectMatch) {
                        projectId = projectMatch.id;
                        console.log(`Found project ID ${projectId} for project name ${payment.project_name} (matched with ${projectMatch.name})`);
                    } else {
                        console.warn(`Could not find project ID for name: ${payment.project_name}`);
                        console.log("Available projects:", projects.map(p => p.name));
                    }
                }
            }
            
            // Now set the form data with the found IDs
            console.log("Setting form data with client_id:", clientId, "project_id:", projectId);
            
            setFormData({
                client_id: clientId ? clientId.toString() : '',
                project_id: projectId ? projectId.toString() : '',
                total_amount: totalAmount.toString(),
                paid_amount: paidAmount.toString(),
                pending_amount: pendingAmount.toString(),
                payment_date: formattedDate
            });
        } catch (err) {
            console.error("Error in openModal:", err);
            // Set basic form data even if there was an error
            setFormData({
                client_id: '',
                project_id: '',
                total_amount: totalAmount.toString(),
                paid_amount: paidAmount.toString(),
                pending_amount: pendingAmount.toString(),
                payment_date: formattedDate
            });
        }
    } else {
        // For new payment
        resetForm();
        setCurrentPayment(null);
    }
    
    setIsModalOpen(true);
};

    // Reset form to default values
    const resetForm = () => {
        setFormData({
            client_id: '',
            project_id: '',
            total_amount: '',
            paid_amount: '0',
            pending_amount: '0',
            payment_date: new Date().toISOString().split('T')[0]
        });
    };

    const handleAddPendingAmount = () => {
    const currentPaid = parseFloat(formData.paid_amount) || 0;
    const enteredPendingAmount = parseFloat(formData.pending_amount) || 0;
    const totalAmount = parseFloat(formData.total_amount) || 0;

    const actualPendingAmount = totalAmount - currentPaid;
    if (enteredPendingAmount > actualPendingAmount) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `The entered pending amount exceeds the actual pending amount (${actualPendingAmount}).`,
        });
        return;
    }
    
    // Calculate new paid amount
    const newPaidAmount = currentPaid + enteredPendingAmount;

    // Calculate new pending amount
    const newPendingAmount = totalAmount - newPaidAmount;
    
    setFormData({
        ...formData,
        paid_amount: newPaidAmount.toString(),
        pending_amount: newPendingAmount.toString()
    });
};


  

    return (
        <Layout>
            <div className="flex flex-col w-full h-screen bg-gray-100 p-2 sm:p-4 relative z-10">
                <div className="w-full">
                    <div className='flex flex-col md:flex-row justify-between items-center mb-4'>
                        <h1 className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0 flex items-center">
                            <MdPayment className="inline-block mr-2 text-blue-600" size={28} />
                            Payment Management
                        </h1>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaPlus className="mr-2" /> Add Payment
                        </button>
                    </div>

                    {/* Loading and Error States */}
            {isLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading payments...</p>
              </div>
            )}

                    {error && !isLoading && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            <strong className="font-bold">Error!</strong>
                            <span className="block sm:inline"> {error}</span>
                        </div>
                    )}

                    {/* Payments Table */}
                    {!isLoading && !error && (
                        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                            {payments.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No payments found. Add a new payment to get started.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <div className="h-[400px] overflow-y-auto">
                                        <Table hoverable={true} className='w-full table-fixed'>
                                            <Table.Head className='bg-gray-100 sticky top-0 z-10'>
                                                <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-[150px]'>
                                                    Client
                                                </Table.HeadCell>
                                                <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-[150px]'>
                                                    Project
                                                </Table.HeadCell>
                                                <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-[150px]'>
                                                    Total Amount
                                                </Table.HeadCell>
                                                <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-[150px]'>
                                                    Paid Amount
                                                </Table.HeadCell>
                                                <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-[150px]'>
                                                    Pending Amount
                                                </Table.HeadCell>
                                                <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-[150px]'>
                                                    Date
                                                </Table.HeadCell>
                                                <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-[150px]'>
                                                    Actions
                                                </Table.HeadCell>
                                            </Table.Head>
                                            <Table.Body className='bg-white divide-y divide-gray-200'>
                                                {payments.map((payment) => (
                                                    <Table.Row key={payment.id} className='hover:bg-gray-50 transition-colors duration-200'>
                                                        <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 truncate'>
                                                            <div className='text-xs sm:text-sm font-medium text-gray-900'>
                                                                
                                                                {payment.client_name}
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 truncate'>
                                                            <div className='text-xs sm:text-sm font-medium text-gray-900'>
                                                                
                                                                {payment.project_name}
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 truncate'>
                                                            <div className='text-xs sm:text-sm font-medium text-blue-600 bg-blue-100 py-1 px-2 rounded-md'>
                                                                ₹{parseFloat(payment.total_amount).toLocaleString()}
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 truncate'>
                                                            <div className='text-xs sm:text-sm font-medium text-green-600 bg-green-100 py-1 px-2 rounded-md'>
                                                                ₹{parseFloat(payment.paid_amount).toLocaleString()}
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 truncate'>
                                                            <div className='text-xs sm:text-sm font-medium text-red-600 bg-red-100 py-1 px-2 rounded-md'>
                                                                ₹{parseFloat(payment.pending_amount).toLocaleString()}
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 truncate'>
                                                            <div className='text-xs sm:text-sm font-medium text-gray-900'>
                                                                {payment.payment_date && payment.payment_date !== 'No Date Available'
                                                                    ? new Date(payment.payment_date).toISOString().split('T')[0] // Ensure proper date formatting
                                                                    : 'No Date Available'}
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 whitespace-nowrap'>
                                                            <div className='flex items-center justify-center space-x-3'>
                                                                <Tooltip content="Edit Payment" placement="top">
                                                                    <button
                                                                        onClick={() => openModal(payment)}
                                                                       className="text-blue-600 hover:text-blue-800 transition-colors duration-150"

                                                                    >
                                                                        <FaEdit size={18} />
                                                                    </button>
                                                                </Tooltip>
                                                                <Tooltip content="Delete Payment" placement="top">
                                                                    <button
                                                                        onClick={() => handleDeletePayment(payment.id)}
                                                                        className="text-red-600 hover:text-red-800 transition-colors duration-150"

                                                                    >
                                                                        <FaTrash size={18} />
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

            {/* Payment Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
                <Modal.Header>
                    {currentPayment ? 'Edit Payment' : 'Add New Payment'}
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <div className="mb-4">
                            <Label htmlFor="client_id" value="Client" />
                            <Select
                                id="client_id"
                                name="client_id"
                                value={formData.client_id}
                                onChange={handleClientChange}
                                required
                                className="mt-1"
                            >
                                <option value="">Select Client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={String(client.id)}>
                                        {client.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="project_id" value="Project" />
                            <Select
                                id="project_id"
                                name="project_id"
                                value={formData.project_id}
                                onChange={handleInputChange}
                                required
                                disabled={!formData.client_id}
                                className="mt-1"
                            >
                                <option value="">
                                    {formData.client_id ? "Select Project" : "Select a client first"}
                                </option>
                                {projects.map(project => (
                                    <option key={project.id} value={String(project.id)}>
                                        {project.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>
                            <div>
                                <div className="mb-4">
                                    <Label htmlFor="total_amount" value="Total Amount" />
                                    <div className="relative mt-1">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <FaMoneyBillWave className="text-gray-500" />
                                        </div>
                                        <TextInput
                                            id="total_amount"
                                            name="total_amount"
                                            type="number"
                                            value={formData.total_amount}
                                            onChange={handleInputChange}
                                            required
                                            className="pl-10"
                                            disabled={currentPayment}
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <Label htmlFor="paid_amount" value="Paid Amount" />
                                    <div className="relative mt-1">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <MdAttachMoney className="text-gray-500" />
                                        </div>
                                        <TextInput
                                            id="paid_amount"
                                            name="paid_amount"
                                            type="number"
                                            value={formData.paid_amount}
                                            onChange={handleInputChange}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Add Pending Amount field - only show when editing */}
                {currentPayment && (
                    <div className="mb-4">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="pending_amount" value="Pending Amount" />
                            <Button 
                                size="xs" 
                                color="success" 
                                onClick={handleAddPendingAmount}
                                disabled={parseFloat(formData.pending_amount) <= 0}
                            >
                                Add to Paid
                            </Button>
                        </div>
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FaMoneyBillWave className="text-red-500" />
                            </div>
                            <TextInput
                                id="pending_amount"
                                name="pending_amount"
                                type="number"
                                value={formData.pending_amount}
                                onChange={(e) => {
                    const newPendingAmount = parseFloat(e.target.value) || 0;
               

                    setFormData({
                        ...formData,
                        pending_amount: newPendingAmount.toString(),
                        
                    });
                }}
                                className="pl-10 bg-red-50"
                               
                            />
                        </div>
                    </div>
                )}

                                <div className="mb-4">
                                    <Label htmlFor="payment_date" value="Payment Date" />
                                    <div className="relative mt-1">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <FaCalendarAlt className="text-gray-500" />
                                        </div>
                                        <TextInput
                                            id="payment_date"
                                            name="payment_date"
                                            type="date"
                                            value={formData.payment_date}
                                            onChange={handleInputChange}
                                            required
                                            className="pl-10"
                                             
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <Button color="gray" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" color="blue">
                                {currentPayment ? 'Update Payment' : 'Add Payment'}
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
       
        </Layout >
    );
}

export default PaymentDetailsPage;
