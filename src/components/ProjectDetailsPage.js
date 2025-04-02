import React, { useState, useEffect } from 'react';
import { Table, Button, Label, TextInput, Select, Tooltip } from 'flowbite-react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUserPlus, FaUserMinus,FaFilePdf } from 'react-icons/fa';
import Swal from 'sweetalert2';

import Layout from '../components/Layout';

import {jsPDF} from 'jspdf';
import 'jspdf-autotable';


function ProjectDetailsPage() {
  // State variables
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'Ongoing',
    team_members: []
  });

  // Status options
  const statusOptions = [
    { value: 'Ongoing', label: 'Ongoing' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  // Team member selection state
  const [selectedTeamMember, setSelectedTeamMember] = useState('');

 
  useEffect(() => {
    // First fetch clients, then fetch projects
    fetchClients().then(() => {
      fetchProjects();
    });
    fetchTeamMembers();
  }, []);

  // Fetch projects from API
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/projects');

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
        setProjects(data.projects);
      } else {
        throw new Error(data.error || 'Failed to fetch projects');
      }
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to load projects: ${err.message}`,
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

  // Fetch team members for dropdown
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/team-members');

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
        setTeamMembers(data.team_members);
      } else {
        throw new Error(data.error || 'Failed to fetch team members');
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to load team members: ${err.message}`,
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      client_id: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'Ongoing',
      team_members: []
    });
    setSelectedTeamMembers([]);
    setIsEditing(false);
    setEditingId(null);
    setValidationError(null);
  };

  // Open modal for adding new project
  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Open modal for editing project
  const handleEditProject = (project) => {
    setFormData({
      name: project.name,
      client_id: project.client_id,
      description: project.description || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      status: project.status || 'Ongoing'
    });

    // Set selected team members
    const teamMembers = project.team_members || [];
    setSelectedTeamMembers(teamMembers);

    setIsEditing(true);
    setEditingId(project.id);
    setShowModal(true);
  };

  // Open team management modal
  const handleOpenTeamModal = (project) => {
    setCurrentProject(project);
    setSelectedTeamMembers(project.team_members || []);
    setShowTeamModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Close team modal
  const handleCloseTeamModal = () => {
    setShowTeamModal(false);
    setCurrentProject(null);
    setSelectedTeamMember('');
  };

  // Add team member to selected list
  const handleAddTeamMember = () => {
    if (!selectedTeamMember) {
      return;
    }

    // Check if team member is already selected
    if (selectedTeamMembers.some(member => member.team_member_id === parseInt(selectedTeamMember))) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'This team member is already assigned to the project',
      });
      return;
    }

    // Find the team member details
    const teamMember = teamMembers.find(member => member.id === parseInt(selectedTeamMember));

    if (teamMember) {
      const newTeamMember = {
        team_member_id: teamMember.id,
        team_member_name: teamMember.name
      };

      setSelectedTeamMembers([...selectedTeamMembers, newTeamMember]);
      setSelectedTeamMember('');
    }
  };

  // Remove team member from selected list
  const handleRemoveTeamMember = (teamMemberId) => {
    setSelectedTeamMembers(selectedTeamMembers.filter(
      member => member.team_member_id !== teamMemberId
    ));
  };

  // Save team members to project
  const handleSaveTeamMembers = async () => {
    try {
      // First, remove all existing team members
      for (const member of currentProject.team_members || []) {
        await fetch(`http://127.0.0.1:5000/api/projects/${currentProject.id}/team/${member.team_member_id}`, {
          method: 'DELETE',
        });
      }

      // Then add all selected team members
      for (const member of selectedTeamMembers) {
        const response=await fetch(`http://127.0.0.1:5000/api/projects/${currentProject.id}/team`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            team_member_id: member.team_member_id,
            role: 'Member'
          }),
        });
        
      const data = await response.json();

      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to assign team member');
      }
      }


      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Team members updated successfully',
      });

      fetchProjects();
      handleCloseTeamModal();
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to update team members: ${err.message}`,
      });
    }
  };

  // Submit form (add or update project)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name || !formData.client_id) {
      setValidationError('Project name and client are required');
      return;
    }

    try {
      const projectData = {
        ...formData,
        team_members: selectedTeamMembers.map(member => ({
          team_member_id: member.team_member_id
        })),
        created_by: 1 // Default admin ID
      };

      const url = isEditing
        ? `http://127.0.0.1:5000/api/projects/${editingId}`
        : `http://127.0.0.1:5000/api/projects`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

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
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: isEditing ? 'Project updated successfully' : 'Project added successfully',
        });
        fetchProjects();
        handleCloseModal();
      } else {
        throw new Error(data.error || 'Operation failed');
      }
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Operation failed: ${err.message}`,
      });
    }
  };

  // Delete project with confirmation
  const handleDeleteProject = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are You Sure?',
        text: 'You will not be able to recover this project!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const response = await fetch(`http://127.0.0.1:5000/api/projects/${id}`, {
          method: 'DELETE',
        });

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
          Swal.fire(
            'Deleted!',
            'Project has been deleted',
            'success'
          );
          fetchProjects();
        } else {
          throw new Error(data.error || 'Delete operation failed');
        }
      }
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to delete project: ${err.message}`,
      });
    }
  };

// Add this function to fetch project details for PDF export - FIXED VERSION
const fetchProjectDetailsForPDF = async (projectId) => {
  try {
    console.log(`Fetching project details for PDF export, project ID: ${projectId}`);
    
    // Instead of using problematic endpoints, get the project directly from our state
    const projectFromState = projects.find(p => p.id === projectId);
    
    if (!projectFromState) {
      throw new Error(`Project with ID ${projectId} not found in local state`);
    }
    
    console.log("Using project from state:", projectFromState);
    
    // Get payment information for this project
    let paymentInfo = {
      total_amount: 0,
      paid_amount: 0,
      pending_amount: 0,
      first_payment_date: null
    };
    
    try {
      // Use GET method explicitly
      const paymentResponse = await fetch(`http://127.0.0.1:5000/api/payments`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        
        if (paymentData.status === 'success' && paymentData.payments) {
          // Filter payments for this project
          const projectPayments = paymentData.payments.filter(payment => 
            // Match by project_id if available, otherwise try to match by project_name
            (payment.project_id && payment.project_id === projectId) || 
            (payment.project_name && projectFromState.name && 
             payment.project_name.toLowerCase() === projectFromState.name.toLowerCase())
          );
          
          if (projectPayments.length > 0) {
            console.log(`Found ${projectPayments.length} payments for this project`);
            
            // Calculate totals
            paymentInfo.total_amount = projectPayments.reduce(
              (sum, p) => sum + parseFloat(p.total_amount || 0), 0
            );
            
            paymentInfo.paid_amount = projectPayments.reduce(
              (sum, p) => sum + parseFloat(p.paid_amount || 0), 0
            );
            
            paymentInfo.pending_amount = paymentInfo.total_amount - paymentInfo.paid_amount;
            
            // Find earliest payment date
            const dates = projectPayments
              .filter(p => p.payment_date)
              .map(p => new Date(p.payment_date));
              
            if (dates.length > 0) {
              paymentInfo.first_payment_date = new Date(Math.min(...dates))
                .toISOString().split('T')[0];
            }
          } else {
            console.log("No payments found for this project");
          }
        }
      } else {
        console.warn(`Failed to fetch payments: ${paymentResponse.status}`);
      }
    } catch (paymentErr) {
      console.warn("Error fetching payment info:", paymentErr);
      // Continue with default payment values
    }
    
    // Combine project and payment data
    const projectDetails = {
      ...projectFromState,
      ...paymentInfo
    };
    
    console.log("Combined project data for PDF:", projectDetails);
    return projectDetails;
    
  } catch (err) {
    console.error('Error fetching project details for PDF:', err);
    throw err; // Re-throw to be handled by the calling function
  }
};


// Format date for display in YYYY-MM-DD format
const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Extracts the date in YYYY-MM-DD format
  } catch (e) {
    console.error('Date formatting error:', e);
    return 'Invalid date';
  }
};

// Function to export project details to PDF - FIXED VERSION
const generateProjectPDF = async (project) => {
  try {
    Swal.fire({
      title: 'Generating PDF',
      text: 'Please wait...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Fetch complete project details
    const projectDetails = await fetchProjectDetailsForPDF(project.id);
    
    if (!projectDetails) {
      throw new Error("Could not retrieve project details");
    }
    
    const doc = new jsPDF();
    
    // Add header with company name
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text('SSR Infinity', 105, 20, { align: 'center' });
    
    // Add project title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Project Details', 105, 35, { align: 'center' });
    
    // Add date of generation
    const today = new Date();
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${today.toLocaleDateString()}`, 195, 10, { align: 'right' });
    
    // Project and Client Information Section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Project & Client Information', 14, 50);
    
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.line(14, 52, 196, 52);
    
    // Create project info table
    doc.autoTable({
      startY: 55,
      head: [['Field', 'Value']],
      body: [
        ['Project Name', projectDetails.name || 'N/A'],
        ['Client Name', projectDetails.client_name || 'N/A'],
        ['Project Status', projectDetails.status || 'N/A'],
        ['Start Date', formatDate(projectDetails.start_date)],
        ['End Date', formatDate(projectDetails.end_date)]
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { left: 14, right: 14 }
    });
    
    // Payment Information Section
    const paymentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text('Payment Information', 14, paymentY);
    
    doc.setDrawColor(0, 51, 102);
    doc.line(14, paymentY + 2, 196, paymentY + 2);
    
    // Ensure payment values exist and are numbers
    const totalAmount = parseFloat(projectDetails.total_amount || 0);
    const paidAmount = parseFloat(projectDetails.paid_amount || 0);
    const pendingAmount = parseFloat(projectDetails.pending_amount || 0);
    
    // Create payment info table
    doc.autoTable({
      startY: paymentY + 5,
      head: [['Field', 'Amount (₹)']],
      body: [
        ['Total Amount', `₹${totalAmount.toFixed(2)}`],
        ['Paid Amount', `₹${paidAmount.toFixed(2)}`],
        ['Pending Amount', `₹${pendingAmount.toFixed(2)}`],
        ['First Payment Date', projectDetails.first_payment_date || 'No payments recorded']
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { left: 14, right: 14 }
    });
    
    // Team Members Section
    if (projectDetails.team_members && projectDetails.team_members.length > 0) {
      const teamY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.text('Team Members', 14, teamY);
      
      doc.setDrawColor(0, 51, 102);
      doc.line(14, teamY + 2, 196, teamY + 2);
      
      const teamMembers = projectDetails.team_members.map(member => [
        member.name || member.team_member_name || 'Unknown'
      ]);
      
      doc.autoTable({
        startY: teamY + 5,
        head: [['Team Member']],
        body: teamMembers,
        theme: 'grid',
        headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { left: 14, right: 14 }
      });
    }
    
    // Save the PDF
    const filename = `${projectDetails.name || 'Project'}_Report.pdf`;
    doc.save(filename);
    
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'PDF generated successfully!',
      timer: 2000,
      showConfirmButton: false
    });
    
  } catch (err) {
    console.error('Error generating PDF:', err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `Failed to generate PDF: ${err.message}`,
    });
  }
};


 


  return (
    <>
      <Layout>
        <div className="flex flex-col w-full h-screen bg-gray-100 p-2 sm:p-4 relative z-10">
          <div className="w-full">
            <div className='flex flex-col md:flex-row justify-between items-center mb-4'>
              <h1 className="text-2xl font-bold">Project Management</h1>
              <button
                onClick={handleOpenAddModal}
                className='mt-3 md:mt-0 flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
              >
                <FaPlus className='mr-2' />
                Add Project
              </button>
            </div>

            {/* Loading and Error States */}
            {isLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading projects...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            {/* Project Table */}
            {!isLoading && !error && (
              <div className="w-full rounded-lg shadow bg-white overflow-hidden">
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No projects found. Add a new project to get started.</p>
                  </div>
                ) : (
                  <div className=" overflow-x-auto">
                    <div className="h-[400px] overflow-y-auto">
                      <Table hoverable={true} className='w-full table-fixed'>
                        <Table.Head className='bg-gray-100 sticky top-0 z-10'>
                          <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-[150px]'>
                            Project Name
                          </Table.HeadCell>
                          <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-[120px]'>
                            Client
                          </Table.HeadCell>
                          <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-[100px]'>
                            Start Date
                          </Table.HeadCell>
                          <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-[100px]'>
                            End Date
                          </Table.HeadCell>
                          <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider  w-[100px]'>
                            Status
                          </Table.HeadCell>
                          <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-[200px]'>
                            Team Members
                          </Table.HeadCell>
                          <Table.HeadCell className='py-2 px-2 sm:py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-[150px]'>
                            Actions
                          </Table.HeadCell>
                        </Table.Head>

                        <Table.Body className='bg-white divide-y divide-gray-200'>
                          {projects.map((project) => (
                            <Table.Row key={project.id}
                              className='hover:bg-gray-50 transition-colors duration-200'
                            >
                              <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 truncate'>
                                <div className='text-xs sm:text-sm font-medium text-gray-900'>{project.name}</div>
                              </Table.Cell>

                              <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 truncate'>
                                <div className='text-xs sm:text-sm font-medium text-gray-900'>{project.client_name}</div>
                              </Table.Cell>

                              <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 truncate'>
                                <div className='text-xs sm:text-sm font-medium text-gray-900'>{formatDate(project.start_date)}</div>
                              </Table.Cell>

                              <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 truncate'>
                                <div className='text-xs sm:text-sm font-medium text-gray-900'>{formatDate(project.end_date)}</div>
                              </Table.Cell>

                              <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 truncate'>
                                <div className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full inline-block
                                      ${project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                      project.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                                      project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                                      project.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                          'bg-gray-100 text-gray-800'}`}>
                                  {project.status}
                                </div>
                              </Table.Cell>

                              <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 '>
                                <div className="text-xs sm:text-sm font-medium text-gray-900 flex flex-wrap justify-center">
                                  {project.team_members.map((member, index) => (
                                    <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1 truncate max-w-[100px]" 
                                    title={member.name}>
                                      {member.name}
                                    </span>
                                  ))}
                                </div>
                              </Table.Cell>

                              <Table.Cell className='px-2 py-2 sm:px-4 text-center sm:py-3 whitespace-nowrap'>
                                <div className='flex items-center justify-center space-x-3'>
                                 <Tooltip content="Edit Projects" placement="top">
                                  <button
                                    onClick={() => handleEditProject(project)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                                  >
                                    <FaEdit  size={18}  />
                                    
                                  </button>
                                  </Tooltip>
                                   <Tooltip content="Add team members" placement="top">
                                  <button
                                    onClick={() => handleOpenTeamModal(project)}
                                   className="text-green-600 hover:text-green-800 transition-colors duration-150"
                                  >
                                    <FaUserPlus  size={18}  />
                                    
                                  </button>
                                  </Tooltip>
                                  <Tooltip content="Delete Projects" placement="top">
                                  <button
                                    onClick={() => handleDeleteProject(project.id)}
                                    className="text-red-600 hover:text-red-800 transition-colors duration-150"
                                  >
                                    <FaTrash size={18} />
                                   
                                  </button>
                                  </Tooltip>

                                  <Tooltip content="Download PDF" placement="top">
                                    <button
                                      onClick={() => generateProjectPDF(project)}
                                      className="text-gray-600 hover:text-gray-800 transition-colors duration-150"
                                    >
                                      <FaFilePdf size={18} />
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

        {/* Add/Edit Project Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {isEditing ? 'Edit Project' : 'Add New Project'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                {validationError && (
                  <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                    <p>{validationError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 mb-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name" value="Project Name" className="block mb-2" />
                      <TextInput
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="client_id" value="Client" className="block mb-2" />
                      <Select
                        id="client_id"
                        name="client_id"
                        value={formData.client_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a client</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* <div className="sm:col-span-2">
                      <Label htmlFor="description" value="Description" className="block mb-2" />
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div> */}

                    <div>
                      <Label htmlFor="start_date" value="Start Date" className="block mb-2" />
                      <TextInput
                        id="start_date"
                        name="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="end_date" value="End Date" className="block mb-2" />
                      <TextInput
                        id="end_date"
                        name="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="status" value="Status" className="block mb-2" />
                      <Select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <Label value="Team Members" className="block mb-2" />
                      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg min-h-[42px]">
                        {selectedTeamMembers.map((member) => (
                          <span key={member.team_member_id} className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {member.team_member_name}
                            <button
                              type="button"
                              onClick={() => handleRemoveTeamMember(member.team_member_id)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Team members can be added after creating the project
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button type="submit" color="success">
                      <FaSave className="mr-2" />
                      {isEditing ? 'Update Project' : 'Add Project'}
                    </Button>
                    <Button color="gray" onClick={handleCloseModal} type="button">
                      <FaTimes className="mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Team Members Modal */}
        {showTeamModal && currentProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Manage Team for {currentProject.name}
                  </h3>
                  <button
                    onClick={handleCloseTeamModal}
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-grow">
                      <Select
                        id="team_member"
                        value={selectedTeamMember}
                        onChange={(e) => setSelectedTeamMember(e.target.value)}
                      >
                        <option value="">Select team member</option>
                        {teamMembers.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <Button color="success" onClick={handleAddTeamMember} type="button">
                      <FaUserPlus className="mr-2" />
                      Add Member
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-lg font-medium mb-2">Team Members</h4>
                  {selectedTeamMembers.length === 0 ? (
                    <p className="text-gray-500">No team members assigned to this project.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedTeamMembers.map((member) => (
                        <div
                          key={member.team_member_id}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                        >
                          <span className="font-medium">{member.team_member_name}</span>
                          <button
                            onClick={() => handleRemoveTeamMember(member.team_member_id)}
                            className="text-red-600 hover:text-red-800"
                            type="button"
                          >
                            <FaUserMinus />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <Button color="success" onClick={handleSaveTeamMembers} type="button">
                    <FaSave className="mr-2" />
                    Save Team
                  </Button>
                  <Button color="gray" onClick={handleCloseTeamModal} type="button">
                    <FaTimes className="mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>

        )}
      </Layout>
    </>
  );
}



export default ProjectDetailsPage