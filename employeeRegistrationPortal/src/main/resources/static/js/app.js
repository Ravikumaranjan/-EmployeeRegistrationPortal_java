// Base URL for the API
const API_BASE_URL = '/api/employees';

// DOM Elements
const employeeForm = document.getElementById('employeeForm');
const employeeIdInput = document.getElementById('employeeId');
const nameInput = document.getElementById('name');
const departmentInput = document.getElementById('department');
const salaryInput = document.getElementById('salary');
const employeeTableBody = document.getElementById('employeeTableBody');
const formTitle = document.getElementById('formTitle');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const totalEmployees = document.getElementById('totalEmployees');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    fetchEmployees();
    
    // Form submit listener
    employeeForm.addEventListener('submit', handleFormSubmit);
    
    // Cancel update listener
    cancelBtn.addEventListener('click', resetForm);
});

// Fetch all employees from backend
async function fetchEmployees() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const employees = await response.json();
        renderEmployeeTable(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">Failed to load data. Is the backend running?</td>
            </tr>`;
    }
}

// Render the employee table
function renderEmployeeTable(employees) {
    totalEmployees.textContent = employees.length;
    employeeTableBody.innerHTML = '';
    
    if (employees.length === 0) {
        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">No employees found. Please register one!</td>
            </tr>`;
        return;
    }
    
    employees.forEach(employee => {
        // Format salary as currency
        const formattedSalary = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(employee.salary);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${employee.id}</td>
            <td class="fw-medium">${employee.name}</td>
            <td><span class="badge bg-secondary">${employee.department}</span></td>
            <td class="salary-val">${formattedSalary}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-primary btn-action" onclick="editEmployee(${employee.id})">
                    ✏️ Edit
                </button>
                <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteEmployee(${employee.id})">
                    🗑️ Delete
                </button>
            </td>
        `;
        employeeTableBody.appendChild(tr);
    });
}

// Handle form submission (Add or Update)
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Basic validation
    if (!employeeForm.checkValidity()) {
        e.stopPropagation();
        employeeForm.classList.add('was-validated');
        return;
    }
    
    const employeeData = {
        name: nameInput.value.trim(),
        department: departmentInput.value,
        salary: parseFloat(salaryInput.value)
    };
    
    const id = employeeIdInput.value;
    
    try {
        if (id) {
            // Update existing employee
            await updateEmployeeRequest(id, employeeData);
        } else {
            // Create new employee
            await createEmployeeRequest(employeeData);
        }
        
        // Refresh table and reset form
        resetForm();
        fetchEmployees();
    } catch (error) {
        console.error('Error saving employee:', error);
        alert('Failed to save employee. Check console for details.');
    }
}

// Create new employee API call
async function createEmployeeRequest(employeeData) {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(employeeData)
    });
    
    if (!response.ok) throw new Error('Failed to create employee');
    return await response.json();
}

// Update employee API call
async function updateEmployeeRequest(id, employeeData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(employeeData)
    });
    
    if (!response.ok) throw new Error('Failed to update employee');
    return await response.json();
}

// Delete employee
async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete employee');
        
        fetchEmployees();
    } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee.');
    }
}

// Populate form for editing
async function editEmployee(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch employee details');
        
        const employee = await response.json();
        
        // Fill form
        employeeIdInput.value = employee.id;
        nameInput.value = employee.name;
        departmentInput.value = employee.department;
        salaryInput.value = employee.salary;
        
        // Change UI to edit mode
        formTitle.textContent = 'Update Employee';
        saveBtn.textContent = 'Update Employee';
        saveBtn.classList.replace('btn-primary', 'btn-success');
        cancelBtn.classList.remove('d-none');
        
        // Scroll to form smoothly
        employeeForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error fetching employee for edit:', error);
    }
}

// Reset form to default Add mode
function resetForm() {
    employeeForm.reset();
    employeeForm.classList.remove('was-validated');
    employeeIdInput.value = '';
    
    formTitle.textContent = 'Register Employee';
    saveBtn.textContent = 'Save Employee';
    saveBtn.classList.replace('btn-success', 'btn-primary');
    cancelBtn.classList.add('d-none');
}
