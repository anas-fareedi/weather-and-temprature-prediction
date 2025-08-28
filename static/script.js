// Weather Temperature Predictor - Frontend JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const form = document.getElementById('prediction-form');
    const clearBtn = document.getElementById('clear-btn');
    const resultSection = document.getElementById('result-section');
    const loadingSection = document.getElementById('loading-section');
    const errorSection = document.getElementById('error-section');
    const predictedTempElement = document.getElementById('predicted-temp');
    const predictionTimeElement = document.getElementById('prediction-time');
    const errorMessageElement = document.getElementById('error-message');

    // Form input elements
    const inputs = {
        lag1: document.getElementById('lag1'),
        lag3: document.getElementById('lag3'),
        lag7: document.getElementById('lag7'),
        roll7: document.getElementById('roll7'),
        month: document.getElementById('month'),
        dayofyear: document.getElementById('dayofyear')
    };

    // Helper function to show/hide sections
    function showSection(section) {
        hideAllSections();
        section.classList.remove('hidden');
    }

    function hideAllSections() {
        resultSection.classList.add('hidden');
        loadingSection.classList.add('hidden');
        errorSection.classList.add('hidden');
    }

    // Helper function to validate form data
    function validateFormData(data) {
        const errors = [];

        // Validate temperature ranges (Basel climate)
        if (data.BASEL_temp_mean_lag1 < -30 || data.BASEL_temp_mean_lag1 > 50) {
            errors.push('Temperature 1 day ago seems unrealistic for Basel (-30°C to 50°C)');
        }
        if (data.BASEL_temp_mean_lag3 < -30 || data.BASEL_temp_mean_lag3 > 50) {
            errors.push('Temperature 3 days ago seems unrealistic for Basel (-30°C to 50°C)');
        }
        if (data.BASEL_temp_mean_lag7 < -30 || data.BASEL_temp_mean_lag7 > 50) {
            errors.push('Temperature 7 days ago seems unrealistic for Basel (-30°C to 50°C)');
        }
        if (data.BASEL_temp_mean_roll7 < -30 || data.BASEL_temp_mean_roll7 > 50) {
            errors.push('7-day average temperature seems unrealistic for Basel (-30°C to 50°C)');
        }

        // Validate month and day of year consistency
        const month = parseInt(data.month);
        const dayOfYear = parseInt(data.dayofyear);
        
        const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Including leap year
        const monthStarts = [1, 32, 61, 92, 122, 153, 183, 214, 245, 275, 306, 336];
        const monthEnds = [31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];

        if (dayOfYear < monthStarts[month - 1] || dayOfYear > monthEnds[month - 1]) {
            errors.push(`Day of year ${dayOfYear} doesn't match month ${month}`);
        }

        return errors;
    }

    // Helper function to auto-calculate day of year from month
    function updateDayOfYear() {
        const month = parseInt(inputs.month.value);
        if (month) {
            const today = new Date();
            const currentMonth = today.getMonth() + 1;
            const currentDay = today.getDate();
            
            // Rough estimate based on current day if same month selected
            if (month === currentMonth) {
                const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
                inputs.dayofyear.value = dayOfYear;
            } else {
                // Estimate middle of selected month
                const monthStarts = [1, 32, 61, 92, 122, 153, 183, 214, 245, 275, 306, 336];
                inputs.dayofyear.value = monthStarts[month - 1] + 15;
            }
        }
    }

    // Event listener for month change to auto-update day of year
    inputs.month.addEventListener('change', updateDayOfYear);

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Collect form data
        const formData = {
            BASEL_temp_mean_lag1: parseFloat(inputs.lag1.value),
            BASEL_temp_mean_lag3: parseFloat(inputs.lag3.value),
            BASEL_temp_mean_lag7: parseFloat(inputs.lag7.value),
            BASEL_temp_mean_roll7: parseFloat(inputs.roll7.value),
            month: parseInt(inputs.month.value),
            dayofyear: parseInt(inputs.dayofyear.value)
        };

        // Validate form data
        const validationErrors = validateFormData(formData);
        if (validationErrors.length > 0) {
            errorMessageElement.textContent = validationErrors.join('. ');
            showSection(errorSection);
            return;
        }

        // Show loading state
        showSection(loadingSection);
        
        // Disable form submission
        const submitBtn = form.querySelector('.predict-btn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        try {
            // Make API call
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Display the prediction result
            if (result.predicted_temperature !== undefined) {
                const temp = parseFloat(result.predicted_temperature);
                predictedTempElement.textContent = `${temp.toFixed(1)}°C`;
                
                // Add temperature color coding
                if (temp < 0) {
                    predictedTempElement.style.color = '#3182ce'; // Blue for freezing
                } else if (temp < 10) {
                    predictedTempElement.style.color = '#667eea'; // Light blue for cold
                } else if (temp < 20) {
                    predictedTempElement.style.color = '#48bb78'; // Green for mild
                } else if (temp < 30) {
                    predictedTempElement.style.color = '#f6ad55'; // Orange for warm
                } else {
                    predictedTempElement.style.color = '#e53e3e'; // Red for hot
                }
                
                predictionTimeElement.textContent = `Prediction made at: ${new Date().toLocaleString()}`;
                showSection(resultSection);
            } else {
                throw new Error('Invalid response format from server');
            }

        } catch (error) {
            console.error('Prediction error:', error);
            errorMessageElement.textContent = `Prediction failed: ${error.message}`;
            showSection(errorSection);
        } finally {
            // Re-enable form submission
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    // Clear form handler
    clearBtn.addEventListener('click', function() {
        // Clear all form inputs
        Object.values(inputs).forEach(input => {
            input.value = '';
        });
        
        // Hide all result sections
        hideAllSections();
        
        // Reset any styling
        predictedTempElement.style.color = '';
        
        // Focus on first input
        inputs.lag1.focus();
        
        // Show confirmation
        const originalBtnText = clearBtn.innerHTML;
        clearBtn.innerHTML = '<i class="fas fa-check"></i> Cleared!';
        setTimeout(() => {
            clearBtn.innerHTML = originalBtnText;
        }, 1000);
    });

    // Add some helpful features
    
    // Auto-focus first input on page load
    inputs.lag1.focus();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!form.querySelector('.predict-btn').disabled) {
                form.dispatchEvent(new Event('submit'));
            }
        }
        
        // Escape to clear form
        if (e.key === 'Escape') {
            clearBtn.click();
        }
    });

    // Add sample data button functionality (for testing)
    function fillSampleData() {
        const sampleData = {
            lag1: 15.5,
            lag3: 14.2,
            lag7: 12.8,
            roll7: 14.1,
            month: new Date().getMonth() + 1,
            dayofyear: Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
        };
        
        Object.keys(sampleData).forEach(key => {
            if (inputs[key]) {
                inputs[key].value = sampleData[key];
            }
        });
    }

    // Add sample data functionality via double-click on header
    document.querySelector('.header').addEventListener('dblclick', fillSampleData);

    // Smooth scrolling for better UX
    function scrollToResult() {
        setTimeout(() => {
            const activeSection = document.querySelector('.result-section:not(.hidden), .error-section:not(.hidden)');
            if (activeSection) {
                activeSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    }

    // Scroll to result after showing sections
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if ((target.id === 'result-section' || target.id === 'error-section') && 
                    !target.classList.contains('hidden')) {
                    scrollToResult();
                }
            }
        });
    });

    observer.observe(resultSection, { attributes: true });
    observer.observe(errorSection, { attributes: true });

    // Add input validation and formatting
    Object.keys(inputs).forEach(key => {
        const input = inputs[key];
        if (input.type === 'number') {
            // Format numbers on blur
            input.addEventListener('blur', function() {
                if (this.value && !isNaN(this.value)) {
                    this.value = parseFloat(this.value).toFixed(1);
                }
            });
            
            // Validate ranges on input
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                if (!isNaN(value)) {
                    if ((key.includes('temp') || key === 'roll7') && (value < -50 || value > 60)) {
                        this.style.borderColor = '#e53e3e';
                        this.title = 'Temperature seems unrealistic for Basel climate';
                    } else if (key === 'dayofyear' && (value < 1 || value > 366)) {
                        this.style.borderColor = '#e53e3e';
                        this.title = 'Day of year must be between 1 and 366';
                    } else {
                        this.style.borderColor = '';
                        this.title = '';
                    }
                }
            });
        }
    });

    console.log('Weather Temperature Predictor initialized successfully! 🌡️');
    console.log('Tip: Double-click the header to fill sample data for testing');
});
