/**
 * Employee Form - JsonPowerDB Integration
 * Database: EMP-DB
 * Relation: EmpData
 * Fields: id, name, salary, hra, da, deduction
 */

// ============================================
// CONFIGURATION
// ============================================

var jpdbBaseURL = "http://api.login2explore.com:5577";
var jpdbIRL = "/irl";          
var jpdbIML = "/iml";          
var jpdbINL = "/inl";          

var DB_NAME = "EMP-DB";
var REL_NAME = "EmpData";
var TOKEN = "764066764|7385821544069761111|764066854";  

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize form on page load
 */
window.onload = function() {
    resetForm();
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Display alert message
 * @param {string} message - Message to display
 * @param {string} type - Alert type: 'success', 'danger', 'info'
 */
function showAlert(message, type) {
    var alertDiv = $('#alertMessage');
    alertDiv.removeClass('alert-success-custom alert-danger-custom alert-info-custom');
    alertDiv.addClass('alert-' + type + '-custom');
    alertDiv.html(message);
    alertDiv.show();
    
    // Auto-hide after 3 seconds
    setTimeout(function() {
        alertDiv.fadeOut();
    }, 3000);
}

/**
 * Validate form data
 * @returns {boolean} True if all fields are valid, false otherwise
 */
function validateFormData() {
    var empId = $('#empId').val().trim();
    var empName = $('#empName').val().trim();
    var empSalary = $('#empSalary').val().trim();
    var empHRA = $('#empHRA').val().trim();
    var empDA = $('#empDA').val().trim();
    var empDeduction = $('#empDeduction').val().trim();

    // Check if any field is empty
    if (!empId || !empName || !empSalary || !empHRA || !empDA || !empDeduction) {
        showAlert('❌ Error: All fields are required!', 'danger');
        return false;
    }

    // Validate numeric fields
    if (isNaN(empSalary) || isNaN(empHRA) || isNaN(empDA) || isNaN(empDeduction)) {
        showAlert('❌ Error: Salary, HRA, DA, and Deduction must be numbers!', 'danger');
        return false;
    }

    // Validate positive values
    if (parseFloat(empSalary) < 0 || parseFloat(empHRA) < 0 || parseFloat(empDA) < 0 || parseFloat(empDeduction) < 0) {
        showAlert('❌ Error: Numeric fields cannot be negative!', 'danger');
        return false;
    }

    return true;
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * Get employee data from database by ID
 * @param {string} empId - Employee ID to search for
 */
function getEmployeeData(empId) {
    var jsonStr = {
        "cmd": "getByKey",
        "dbName": DB_NAME,
        "rel": REL_NAME,
        "key": empId
    };

    var reqStr = JSON.stringify(jsonStr);

    $.ajax({
        url: jpdbBaseURL + jpdbIRL,
        type: "POST",
        dataType: "json",
        data: reqStr,
        headers: {
            "Content-Type": "application/json"
        },
        success: function(resultObj) {
            if (resultObj.status === 0) {
                // Employee exists - populate form with existing data
                var data = resultObj.data;
                
                $('#empName').val(data.name);
                $('#empSalary').val(data.salary);
                $('#empHRA').val(data.hra);
                $('#empDA').val(data.da);
                $('#empDeduction').val(data.deduction);

                // Enable Change and Reset buttons
                $('#changeBtn').prop('disabled', false);
                $('#resetBtn').prop('disabled', false);

                // Disable Save button and Employee ID field
                $('#saveBtn').prop('disabled', true);
                $('#empId').prop('disabled', true);

                // Enable other fields
                $('#empName').prop('disabled', false).focus();
                $('#empSalary').prop('disabled', false);
                $('#empHRA').prop('disabled', false);
                $('#empDA').prop('disabled', false);
                $('#empDeduction').prop('disabled', false);

                // Show status badge
                $('#statusBadge').removeClass('status-new').addClass('status-existing').text('EXISTING').show();
                
                showAlert('✓ Employee found! You can now update the data.', 'info');
            } else {
                // Employee does not exist - enable new employee mode
                enableNewEmployeeMode();
            }
        },
        error: function() {
            // On error, treat as new employee
            enableNewEmployeeMode();
        }
    });
}

/**
 * Enable mode for new employee entry
 */
function enableNewEmployeeMode() {
    $('#saveBtn').prop('disabled', false);
    $('#resetBtn').prop('disabled', false);
    $('#changeBtn').prop('disabled', true);
    $('#empId').prop('disabled', false);

    $('#empName').prop('disabled', false).focus();
    $('#empSalary').prop('disabled', false);
    $('#empHRA').prop('disabled', false);
    $('#empDA').prop('disabled', false);
    $('#empDeduction').prop('disabled', false);

    // Show status badge
    $('#statusBadge').removeClass('status-existing').addClass('status-new').text('NEW').show();
    
    showAlert('✓ Employee ID not found. Enter new employee data.', 'info');
}

/**
 * Save new employee data to database
 */
function saveData() {
    if (!validateFormData()) {
        return;
    }

    var empData = {
        id: $('#empId').val().trim(),
        name: $('#empName').val().trim(),
        salary: parseFloat($('#empSalary').val()),
        hra: parseFloat($('#empHRA').val()),
        da: parseFloat($('#empDA').val()),
        deduction: parseFloat($('#empDeduction').val())
    };

    var jsonStr = {
        "cmd": "put",
        "dbName": DB_NAME,
        "rel": REL_NAME,
        "jsonStr": empData
    };

    var reqStr = JSON.stringify(jsonStr);

    $.ajax({
        url: jpdbBaseURL + jpdbIML,
        type: "POST",
        dataType: "json",
        data: reqStr,
        headers: {
            "Content-Type": "application/json"
        },
        success: function(resultObj) {
            if (resultObj.status === 0) {
                showAlert('✅ Employee data saved successfully!', 'success');
                setTimeout(function() {
                    resetForm();
                }, 1500);
            } else {
                showAlert('❌ Error: Failed to save data. ' + (resultObj.message || ''), 'danger');
            }
        },
        error: function(xhr, status, error) {
            console.error('Save Error:', error);
            showAlert('❌ Error: Failed to connect to database!', 'danger');
        }
    });
}

/**
 * Update existing employee data in database
 */
function changeData() {
    if (!validateFormData()) {
        return;
    }

    var empData = {
        id: $('#empId').val().trim(),
        name: $('#empName').val().trim(),
        salary: parseFloat($('#empSalary').val()),
        hra: parseFloat($('#empHRA').val()),
        da: parseFloat($('#empDA').val()),
        deduction: parseFloat($('#empDeduction').val())
    };

    var jsonStr = {
        "cmd": "update",
        "dbName": DB_NAME,
        "rel": REL_NAME,
        "key": empData.id,
        "jsonStr": empData
    };

    var reqStr = JSON.stringify(jsonStr);

    $.ajax({
        url: jpdbBaseURL + jpdbIRL,
        type: "POST",
        dataType: "json",
        data: reqStr,
        headers: {
            "Content-Type": "application/json"
        },
        success: function(resultObj) {
            if (resultObj.status === 0) {
                showAlert('✅ Employee data updated successfully!', 'success');
                setTimeout(function() {
                    resetForm();
                }, 1500);
            } else {
                showAlert('❌ Error: Failed to update data. ' + (resultObj.message || ''), 'danger');
            }
        },
        error: function(xhr, status, error) {
            console.error('Update Error:', error);
            showAlert('❌ Error: Failed to connect to database!', 'danger');
        }
    });
}

// ============================================
// FORM MANAGEMENT
// ============================================

/**
 * Reset form to initial state
 * - Clear all fields
 * - Disable all except Employee ID field
 * - Disable all buttons
 * - Focus on Employee ID field
 */
function resetForm() {
    $('#empForm')[0].reset();
    $('#statusBadge').hide();
    $('#alertMessage').hide();

    // Disable all fields except Employee ID
    $('#empId').prop('disabled', false).focus();
    $('#empName').prop('disabled', true);
    $('#empSalary').prop('disabled', true);
    $('#empHRA').prop('disabled', true);
    $('#empDA').prop('disabled', true);
    $('#empDeduction').prop('disabled', true);

    // Disable all buttons
    $('#saveBtn').prop('disabled', true);
    $('#changeBtn').prop('disabled', true);
    $('#resetBtn').prop('disabled', true);
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Employee ID blur event
 * Check if employee exists when user leaves the field
 */
$('#empId').on('blur', function() {
    var empId = $(this).val().trim();
    
    if (empId === '') {
        // Reset if empty
        resetForm();
        return;
    }

    // Check if employee exists in database
    getEmployeeData(empId);
});

/**
 * Form input change event
 * Enable Reset button when user makes changes
 */
$('input').on('change', function() {
    if ($('#resetBtn').prop('disabled') === false) {
        $('#resetBtn').prop('disabled', false);
    }
});

/**
 * Prevent form submission
 */
$('#empForm').on('submit', function(e) {
    e.preventDefault();
    return false;
});
