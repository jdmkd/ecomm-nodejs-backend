// Helper function to validate if the input is a valid positive number (strict validation)
const isValidNumber = (value) => {
  // Only accepts a valid number (positive integer or up to 2 decimal places)
  return /^(\d+(\.\d{1,2})?)$/.test(value);
};

// Function to validate input and reject malformed ones
const validateNumberInput = (value, min = 1, max = 1000000) => {
  if (typeof value === 'undefined' || value === null || value.trim() === '') {
    return { isValid: false, message: 'Value is required.' };
  }

  // Check if the value is a valid number using the helper function
  if (!isValidNumber(value)) {
    return { isValid: false, message: 'Invalid format. Must be a valid number (positive integer or up to 2 decimal places).' };
  }

  const parsedValue = parseFloat(value);
  
  // Check if the value is within the acceptable range (price and quantity limits)
  if (parsedValue < min || parsedValue > max) {
    return { isValid: false, message: `Value must be between ₹${min} and ₹${max}.` };
  }

  return { isValid: true, value: parsedValue };
};

module.exports = {
  validateNumberInput
};
