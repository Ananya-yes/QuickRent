// Add this at the beginning of your script.js file

// Utility functions
const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

const validatePhone = (phone) => {
    return phone.match(/^\+?[\d\s-]{10,}$/);
};

const validateCard = (card) => {
    return card.replace(/\s/g, '').match(/^\d{16}$/);
};

const validateCVV = (cvv) => {
    return cvv.match(/^\d{3,4}$/);
};

const formatCardNumber = (input) => {
    let value = input.value.replace(/\s/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    input.value = value;
};

// Enhanced Rent Now Button Functionality
document.querySelectorAll('.gadget-card button').forEach(button => {
    button.addEventListener('click', async function() {
        // ... (previous modal HTML and style code remains the same)

        // Form Data Storage
        let rentalData = {
            personal: {},
            dates: {},
            delivery: {},
            verification: {},
            payment: {}
        };

        // Step 1: Form Validation
        const validateStep1 = () => {
            const name = document.getElementById('renter-name').value;
            const email = document.getElementById('renter-email').value;
            const phone = document.getElementById('renter-phone').value;
            const pickupDate = document.getElementById('pickup-date').value;
            const returnDate = document.getElementById('return-date').value;
            const address = document.getElementById('delivery-address').value;

            let errors = [];

            if (name.length < 3) errors.push('Please enter a valid name');
            if (!validateEmail(email)) errors.push('Please enter a valid email');
            if (!validatePhone(phone)) errors.push('Please enter a valid phone number');
            if (!pickupDate || !returnDate) errors.push('Please select valid dates');
            if (new Date(returnDate) <= new Date(pickupDate)) errors.push('Return date must be after pickup date');
            if (address.length < 10) errors.push('Please enter a complete address');

            if (errors.length > 0) {
                showErrors(errors);
                return false;
            }

            rentalData.personal = { name, email, phone };
            rentalData.dates = { pickupDate, returnDate };
            rentalData.delivery = { address };
            return true;
        };

        // Step 2: ID Verification
        const validateStep2 = () => {
            const idType = document.getElementById('id-type').value;
            const idNumber = document.getElementById('id-number').value;
            const idUpload = document.getElementById('id-upload').files[0];

            let errors = [];

            if (!idType) errors.push('Please select an ID type');
            if (!idNumber || idNumber.length < 5) errors.push('Please enter a valid ID number');
            if (!idUpload) errors.push('Please upload your ID document');

            if (errors.length > 0) {
                showErrors(errors);
                return false;
            }

            rentalData.verification = { idType, idNumber, idUpload };
            return true;
        };

        // Step 3: Payment Validation
        const validateStep3 = async () => {
            const cardNumber = document.getElementById('card-number').value;
            const expiryDate = document.getElementById('expiry-date').value;
            const cvv = document.getElementById('cvv').value;

            let errors = [];

            if (!validateCard(cardNumber)) errors.push('Please enter a valid card number');
            if (!expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) errors.push('Please enter a valid expiry date (MM/YY)');
            if (!validateCVV(cvv)) errors.push('Please enter a valid CVV');

            if (errors.length > 0) {
                showErrors(errors);
                return false;
            }

            try {
                // Simulate payment processing
                await processPayment({
                    cardNumber,
                    expiryDate,
                    cvv,
                    amount: calculateTotal()
                });
                rentalData.payment = { status: 'completed', reference: generateReference() };
                return true;
            } catch (error) {
                showErrors(['Payment failed: ' + error.message]);
                return false;
            }
        };

        // Payment Processing Simulation
        const processPayment = async (paymentDetails) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (Math.random() > 0.1) { // 90% success rate
                        resolve({ status: 'success', reference: generateReference() });
                    } else {
                        reject(new Error('Transaction declined'));
                    }
                }, 2000);
            });
        };

        // Error Display
        const showErrors = (errors) => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-messages';
            errorDiv.innerHTML = `
                <div class="error-content">
                    <h3>Please correct the following:</h3>
                    <ul>
                        ${errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                    <button class="close-error">OK</button>
                </div>
            `;
            document.body.appendChild(errorDiv);

            errorDiv.querySelector('.close-error').onclick = () => errorDiv.remove();
        };

        // Loading Indicator
        const showLoading = (message) => {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading-overlay';
            loadingDiv.innerHTML = `
                <div class="loading-spinner"></div>
                <p>${message}</p>
            `;
            document.body.appendChild(loadingDiv);
            return loadingDiv;
        };

        // Step Navigation
        const handleNextStep = async (currentStep) => {
            const loading = showLoading('Processing...');
            try {
                let isValid = false;
                switch(currentStep) {
                    case 1:
                        isValid = validateStep1();
                        break;
                    case 2:
                        isValid = validateStep2();
                        break;
                    case 3:
                        isValid = await validateStep3();
                        break;
                }
                loading.remove();
                if (isValid) showStep(currentStep + 1);
            } catch (error) {
                loading.remove();
                showErrors([error.message]);
            }
        };

        // Event Listeners
        modal.querySelectorAll('.next-step').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                await handleNextStep(currentStep);
            });
        });

        // Card Input Formatting
        const cardInput = modal.querySelector('#card-number');
        cardInput.addEventListener('input', () => formatCardNumber(cardInput));

        // Expiry Date Formatting
        const expiryInput = modal.querySelector('#expiry-date');
        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0,2) + '/' + value.slice(2,4);
            }
            e.target.value = value;
        });

        // Final Confirmation
        const handleConfirmation = async () => {
            const loading = showLoading('Finalizing your booking...');
            try {
                // Simulate API call to save booking
                await saveBooking(rentalData);
                loading.remove();
                
                // Show success message
                const confirmation = modal.querySelector('.confirmation-message');
                confirmation.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <h2>Booking Confirmed!</h2>
                    <p>Your booking reference: ${rentalData.payment.reference}</p>
                    <div class="booking-details">
                        <h3>Rental Summary</h3>
                        <p><strong>Gadget:</strong> ${gadgetName}</p>
                        <p><strong>Pickup:</strong> ${rentalData.dates.pickupDate}</p>
                        <p><strong>Return:</strong> ${rentalData.dates.returnDate}</p>
                        <p><strong>Total Paid:</strong> $${calculateTotal()}</p>
                    </div>
                    <button class="close-modal">Done</button>
                `;

                // Send confirmation email
                await sendConfirmationEmail(rentalData);

            } catch (error) {
                loading.remove();
                showErrors(['Booking failed: ' + error.message]);
            }
        };

        // Add necessary styles
        const additionalStyles = `
            .error-messages {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
            }

            .error-content {
                background: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 400px;
                width: 90%;
            }

            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                color: white;
            }

            .loading-spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = additionalStyles;
        document.head.appendChild(styleSheet);

        // Initialize the form
        showStep(1);
        updatePriceBreakdown();
    });
});

// Utility Functions
function generateReference() {
    return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function calculateTotal() {
    // Implementation of total calculation
    // This should match your price breakdown logic
    return 0; // Replace with actual calculation
}

async function saveBooking(data) {
    // Simulate API call to save booking
    return new Promise((resolve) => {
        setTimeout(() => resolve({ status: 'success' }), 1500);
    });
}

async function sendConfirmationEmail(data) {
    // Simulate sending confirmation email
    return new Promise((resolve) => {
        setTimeout(() => resolve({ status: 'sent' }), 1000);
    });
}
// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Sign Up Button
document.querySelector('.signup-btn').addEventListener('click', function() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Sign Up</h2>
            <form id="signup-form" style="margin-top: 20px;">
                <input type="text" placeholder="Full Name" required style="width: 100%; margin-bottom: 10px; padding: 8px;">
                <input type="email" placeholder="Email" required style="width: 100%; margin-bottom: 10px; padding: 8px;">
                <input type="password" placeholder="Password" required style="width: 100%; margin-bottom: 10px; padding: 8px;">
                <button type="submit" style="background: #007bff; color: white; border: none; padding: 10px; width: 100%; border-radius: 5px; cursor: pointer;">Sign Up</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Close modal functionality
    const close = modal.querySelector('.close');
    close.onclick = function() {
        modal.remove();
    }

    // Close when clicking outside
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.remove();
        }
    }

    // Form submission
    const form = modal.querySelector('#signup-form');
    form.onsubmit = function(e) {
        e.preventDefault();
        alert('Thank you for signing up!');
        modal.remove();
    }
});

// List Your Gadget Button
document.querySelector('.list-gadget-btn').addEventListener('click', function() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>List Your Gadget</h2>
            <form id="list-gadget-form" style="margin-top: 20px;">
                <input type="text" placeholder="Gadget Name" required style="width: 100%; margin-bottom: 10px; padding: 8px;">
                <select required style="width: 100%; margin-bottom: 10px; padding: 8px;">
                    <option value="">Select Category</option>
                    <option value="laptop">Laptop</option>
                    <option value="camera">Camera</option>
                    <option value="gaming">Gaming Console</option>
                    <option value="other">Other</option>
                </select>
                <input type="number" placeholder="Daily Rate ($)" required style="width: 100%; margin-bottom: 10px; padding: 8px;">
                <textarea placeholder="Description" required style="width: 100%; margin-bottom: 10px; padding: 8px; height: 100px;"></textarea>
                <input type="file" accept="image/*" style="margin-bottom: 10px;">
                <button type="submit" style="background: #007bff; color: white; border: none; padding: 10px; width: 100%; border-radius: 5px; cursor: pointer;">List Gadget</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Close modal functionality
    const close = modal.querySelector('.close');
    close.onclick = function() {
        modal.remove();
    }

    // Close when clicking outside
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.remove();
        }
    }

    // Form submission
    const form = modal.querySelector('#list-gadget-form');
    form.onsubmit = function(e) {
        e.preventDefault();
        alert('Thank you for listing your gadget! Our team will review your submission.');
        modal.remove();
    }
});

// Contact Form
document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    this.reset();
});

// Rent Now Buttons
document.querySelectorAll('.gadget-card button').forEach(button => {
    button.addEventListener('click', function() {
        const gadgetName = this.parentElement.querySelector('h3').textContent;
    });
});
// Rent Now Buttons Functionality
document.querySelectorAll('.gadget-card button').forEach(button => {
    button.addEventListener('click', function() {
        const gadgetCard = this.parentElement;
        const gadgetName = gadgetCard.querySelector('h3').textContent;
        const gadgetPrice = gadgetCard.querySelector('p').textContent;
        const gadgetImage = gadgetCard.querySelector('img').src;
        const gadgetFeatures = Array.from(gadgetCard.querySelectorAll('.features-list li'))
            .map(li => li.textContent).join(', ');

        const modal = document.createElement('div');
        modal.className = 'modal rental-modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                
                <!-- Progress Bar -->
                <div class="progress-bar">
                    <div class="step active" data-step="1">Details</div>
                    <div class="step" data-step="2">Verification</div>
                    <div class="step" data-step="3">Payment</div>
                    <div class="step" data-step="4">Confirmation</div>
                </div>

                <!-- Step 1: Rental Details -->
                <div class="rental-step" id="step1">
                    <div class="rental-header">
                        <img src="${gadgetImage}" alt="${gadgetName}">
                        <div>
                            <h2>${gadgetName}</h2>
                            <p class="price">${gadgetPrice}</p>
                            <p class="features">${gadgetFeatures}</p>
                        </div>
                    </div>

                    <form id="rental-details-form">
                        <div class="form-section">
                            <h3>Personal Information</h3>
                            <div class="form-group">
                                <label for="renter-name">Full Name*</label>
                                <input type="text" id="renter-name" required>
                            </div>
                            <div class="form-group">
                                <label for="renter-email">Email*</label>
                                <input type="email" id="renter-email" required>
                            </div>
                            <div class="form-group">
                                <label for="renter-phone">Phone Number*</label>
                                <input type="tel" id="renter-phone" required>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Rental Period</h3>
                            <div class="date-group">
                                <div class="form-group">
                                    <label for="pickup-date">Pickup Date*</label>
                                    <input type="date" id="pickup-date" required>
                                </div>
                                <div class="form-group">
                                    <label for="return-date">Return Date*</label>
                                    <input type="date" id="return-date" required>
                                </div>
                            </div>
                            <div class="time-group">
                                <div class="form-group">
                                    <label for="pickup-time">Pickup Time*</label>
                                    <select id="pickup-time" required>
                                        ${generateTimeOptions()}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Delivery Information</h3>
                            <div class="form-group">
                                <label for="delivery-address">Delivery Address*</label>
                                <textarea id="delivery-address" required></textarea>
                            </div>
                            <div class="form-group">
                                <label for="delivery-instructions">Special Instructions</label>
                                <textarea id="delivery-instructions"></textarea>
                            </div>
                        </div>

                        <button type="submit" class="next-step">Continue to Verification</button>
                    </form>
                </div>

                <!-- Step 2: Verification -->
                <div class="rental-step" id="step2" style="display: none;">
                    <h2>Identity Verification</h2>
                    <div class="form-section">
                        <div class="form-group">
                            <label for="id-type">ID Type*</label>
                            <select id="id-type" required>
                                <option value="">Select ID Type</option>
                                <option value="passport">Passport</option>
                                <option value="drivers_license">Driver's License</option>
                                <option value="national_id">National ID</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="id-number">ID Number*</label>
                            <input type="text" id="id-number" required>
                        </div>
                        <div class="form-group">
                            <label for="id-upload">Upload ID Document*</label>
                            <input type="file" id="id-upload" accept="image/*" required>
                            <div class="upload-preview"></div>
                        </div>
                    </div>
                    <div class="button-group">
                        <button class="prev-step">Back</button>
                        <button class="next-step">Continue to Payment</button>
                    </div>
                </div>

                <!-- Step 3: Payment -->
                <div class="rental-step" id="step3" style="display: none;">
                    <h2>Payment Details</h2>
                    <div class="price-breakdown">
                        <!-- Will be populated dynamically -->
                    </div>
                    <div class="payment-options">
                        <h3>Select Payment Method</h3>
                        <div class="payment-methods">
                            <label class="payment-method">
                                <input type="radio" name="payment" value="credit_card" checked>
                                <span>Credit Card</span>
                            </label>
                            <label class="payment-method">
                                <input type="radio" name="payment" value="debit_card">
                                <span>Debit Card</span>
                            </label>
                            <label class="payment-method">
                                <input type="radio" name="payment" value="paypal">
                                <span>PayPal</span>
                            </label>
                        </div>
                        <div class="card-details">
                            <div class="form-group">
                                <label for="card-number">Card Number*</label>
                                <input type="text" id="card-number" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="expiry-date">Expiry Date*</label>
                                    <input type="text" id="expiry-date" placeholder="MM/YY" required>
                                </div>
                                <div class="form-group">
                                    <label for="cvv">CVV*</label>
                                    <input type="text" id="cvv" required>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="button-group">
                        <button class="prev-step">Back</button>
                        <button class="next-step">Confirm Payment</button>
                    </div>
                </div>

                <!-- Step 4: Confirmation -->
                <div class="rental-step" id="step4" style="display: none;">
                    <div class="confirmation-message">
                        <i class="fas fa-check-circle"></i>
                        <h2>Booking Confirmed!</h2>
                        <p>Your rental has been successfully booked.</p>
                        <div class="booking-details">
                            <!-- Will be populated dynamically -->
                        </div>
                        <button class="close-modal">Done</button>
                    </div>
                </div>
            </div>
        `;

        // Add the necessary styles
        // Update the style section in your Rent Now button code
// Rent Now Button Styling
const style = document.createElement('style');
style.textContent = `
    .rental-modal .modal-content {
        max-width: 800px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        padding: 20px;
        margin: 20px auto;
        background: white;
        border-radius: 8px;
        position: relative;
    }

    /* Rental Header with Image */
    .rental-header {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
        align-items: flex-start;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
    }

    .rental-header img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #ddd;
    }

    .rental-header div {
        flex: 1;
    }

    .rental-header h2 {
        margin: 0 0 5px 0;
        font-size: 1.1rem;
        color: #333;
    }

    .rental-header .price {
        font-size: 1rem;
        color: #007bff;
        font-weight: bold;
        margin: 3px 0;
    }

    .rental-header .features {
        font-size: 0.9rem;
        color: #666;
        margin-top: 5px;
    }

    /* Progress Bar */
    .progress-bar {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        position: sticky;
        top: 0;
        background: white;
        padding: 10px 0;
        z-index: 1;
        border-bottom: 1px solid #eee;
    }

    .step {
        flex: 1;
        text-align: center;
        padding: 8px;
        background: #f8f9fa;
        margin: 0 4px;
        border-radius: 4px;
        font-size: 0.9rem;
        color: #666;
    }

    .step.active {
        background: #007bff;
        color: white;
    }

    /* Form Sections */
    .rental-step {
        padding: 15px 0;
    }

    .form-section {
        margin-bottom: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
    }

    .form-section h3 {
        margin-bottom: 12px;
        color: #333;
        font-size: 1rem;
    }

    /* Form Groups */
    .form-group {
        margin-bottom: 12px;
    }

    .form-group label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
        color: #555;
        font-size: 0.9rem;
    }

    .form-group input[type="text"],
    .form-group input[type="email"],
    .form-group input[type="tel"],
    .form-group input[type="date"],
    .form-group input[type="number"],
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.9rem;
    }

    .form-group textarea {
        min-height: 60px;
        resize: vertical;
    }

    /* Date and Time Inputs */
    .date-group {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
    }

    .date-group .form-group {
        flex: 1;
    }

    /* Payment Section */
    .payment-methods {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 8px;
        margin: 12px 0;
    }

    .payment-method {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        font-size: 0.9rem;
    }

    .payment-method:hover {
        background: #f0f0f0;
    }

    /* Price Breakdown */
    .price-breakdown {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 4px;
        margin: 12px 0;
        font-size: 0.9rem;
    }

    .price-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        padding: 4px 0;
    }

    .price-item.total {
        border-top: 2px solid #ddd;
        margin-top: 8px;
        padding-top: 8px;
        font-weight: bold;
    }

    /* Buttons */
    .button-group {
        display: flex;
        gap: 8px;
        margin-top: 15px;
    }

    .next-step,
    .prev-step {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.3s;
    }

    .next-step {
        background: #007bff;
        color: white;
        flex: 2;
    }

    .prev-step {
        background: #6c757d;
        color: white;
        flex: 1;
    }

    .next-step:hover {
        background: #0056b3;
    }

    .prev-step:hover {
        background: #5a6268;
    }

    /* Close Button */
    .close {
        position: absolute;
        right: 15px;
        top: 15px;
        font-size: 20px;
        cursor: pointer;
        color: #666;
        z-index: 2;
    }

    /* Confirmation Step */
    .confirmation-message {
        text-align: center;
        padding: 20px;
    }

    .confirmation-message i {
        font-size: 40px;
        color: #28a745;
        margin-bottom: 15px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .rental-modal .modal-content {
            width: 95%;
            padding: 12px;
            margin: 10px auto;
        }

        .progress-bar {
            font-size: 0.8rem;
        }

        .step {
            padding: 6px 4px;
        }

        .date-group {
            flex-direction: column;
            gap: 8px;
        }

        .payment-methods {
            grid-template-columns: 1fr;
        }

        .button-group {
            flex-direction: column;
        }

        .next-step,
        .prev-step {
            width: 100%;
        }

        .rental-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .rental-header img {
            width: 50px;
            height: 50px;
        }
    }

    /* Loading and Error Styles */
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        color: white;
    }

    .error-messages {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    }

    .error-content {
        background: white;
        padding: 15px;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
    }

    /* Upload Preview */
    .upload-preview {
        margin-top: 8px;
    }

    .upload-preview img {
        max-width: 150px;
        border-radius: 4px;
    }
`;

document.head.appendChild(style);

document.head.appendChild(style);
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Helper function to generate time options
        function generateTimeOptions() {
            let options = '';
            for(let i = 9; i <= 17; i++) {
                const hour = i.toString().padStart(2, '0');
                options += `<option value="${hour}:00">${hour}:00</option>`;
                options += `<option value="${hour}:30">${hour}:30</option>`;
            }
            return options;
        }

        // Initialize form handling
        let currentStep = 1;
        const steps = modal.querySelectorAll('.rental-step');
        const progressSteps = modal.querySelectorAll('.step');

        function updateProgress() {
            progressSteps.forEach((step, index) => {
                if (index + 1 <= currentStep) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        }

        function showStep(stepNumber) {
            steps.forEach(step => step.style.display = 'none');
            modal.querySelector(`#step${stepNumber}`).style.display = 'block';
            currentStep = stepNumber;
            updateProgress();
        }

        // Handle next/prev buttons
        modal.querySelectorAll('.next-step').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                if (currentStep < 4) {
                    showStep(currentStep + 1);
                }
            });
        });

        modal.querySelectorAll('.prev-step').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                if (currentStep > 1) {
                    showStep(currentStep - 1);
                }
            });
        });

        // Close modal functionality
        const closeButtons = modal.querySelectorAll('.close, .close-modal');
        closeButtons.forEach(button => {
            button.onclick = function() {
                modal.remove();
            }
        });

        // Close when clicking outside
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.remove();
            }
        }

        // Initialize date inputs
        const today = new Date().toISOString().split('T')[0];
        const pickupDate = modal.querySelector('#pickup-date');
        const returnDate = modal.querySelector('#return-date');
        pickupDate.min = today;
        returnDate.min = today;

        // Update price breakdown
        function updatePriceBreakdown() {
            if (pickupDate.value && returnDate.value) {
                const start = new Date(pickupDate.value);
                const end = new Date(returnDate.value);
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                
                if (days > 0) {
                    const basePrice = parseInt(gadgetPrice.match(/\d+/)[0]);
                    const subtotal = basePrice * days;
                    const deposit = Math.round(basePrice * 0.2);
                    const total = subtotal + deposit;

                    const breakdown = modal.querySelector('.price-breakdown');
                    breakdown.innerHTML = `
                        <div class="price-item">
                            <span>Daily Rate:</span>
                            <span>$${basePrice}</span>
                        </div>
                        <div class="price-item">
                            <span>Number of Days:</span>
                            <span>${days}</span>
                        </div>
                        <div class="price-item">
                            <span>Subtotal:</span>
                            <span>$${subtotal}</span>
                        </div>
                        <div class="price-item">
                            <span>Security Deposit:</span>
                            <span>$${deposit}</span>
                        </div>
                        <div class="price-item total">
                            <span>Total:</span>
                            <span>$${total}</span>
                        </div>
                    `;
                }
            }
        }

        pickupDate.addEventListener('change', updatePriceBreakdown);
        returnDate.addEventListener('change', updatePriceBreakdown);

        // Handle file upload preview
        const idUpload = modal.querySelector('#id-upload');
        const previewContainer = modal.querySelector('.upload-preview');
        
        idUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewContainer.innerHTML = `
                        <img src="${e.target.result}" style="max-width: 200px; margin-top: 10px;">
                    `;
                }
                reader.readAsDataURL(file);
            }
        });

        // Handle final confirmation
        modal.querySelector('#step3 .next-step').addEventListener('click', function() {
            const bookingDetails = modal.querySelector('.booking-details');
            bookingDetails.innerHTML = `
                <h3>Rental Summary</h3>
                <p><strong>Gadget:</strong> ${gadgetName}</p>
                <p><strong>Pickup:</strong> ${pickupDate.value} at ${modal.querySelector('#pickup-time').value}</p>
                <p><strong>Return:</strong> ${returnDate.value}</p>
                <p><strong>Delivery Address:</strong> ${modal.querySelector('#delivery-address').value}</p>
                <p><strong>Booking Reference:</strong> #${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            `;
        });
    });
});
// Explore Rentals Button Functionality
document.addEventListener('DOMContentLoaded', function() {
    const exploreButton = document.querySelector('.cta-btn');  // Changed from .explore-rentals to .cta-btn
    if (exploreButton) {
        exploreButton.addEventListener('click', function() {
           
            // Create and show the explore modal
            const modal = document.createElement('div');
            modal.className = 'modal explore-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <div class="explore-header">
                        <h2>Explore Available Gadgets</h2>
                        <div class="search-bar">
                            <input type="text" id="search-gadgets" placeholder="Search gadgets...">
                        </div>
                    </div>

                    <div class="filters-section">
                        <div class="filter-group">
                            <label>Categories</label>
                            <div class="category-filters">
                                <label><input type="checkbox" value="laptop"> Laptops</label>
                                <label><input type="checkbox" value="camera"> Cameras</label>
                                <label><input type="checkbox" value="audio"> Audio</label>
                                <label><input type="checkbox" value="gaming"> Gaming</label>
                                <label><input type="checkbox" value="accessories"> Accessories</label>
                            </div>
                        </div>

                        <div class="filter-group">
                            <label>Price Range</label>
                            <div class="price-range">
                                <input type="number" id="min-price" placeholder="Min $">
                                <span>to</span>
                                <input type="number" id="max-price" placeholder="Max $">
                            </div>
                        </div>

                        <div class="filter-group">
                            <label>Sort By</label>
                            <select id="sort-options">
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name: A to Z</option>
                                <option value="popularity">Most Popular</option>
                            </select>
                        </div>
                    </div>

                    <div class="gadgets-grid">
                        <!-- Sample Gadgets -->
                        <div class="gadget-card" data-category="laptop">
                            <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Laptop">
                            <div class="gadget-info">
                                <h3>MacBook Pro</h3>
                                <div class="price">$50/day</div>
                                <div class="availability">Available</div>
                            </div>
                        </div>
                        <div class="gadget-card" data-category="camera">
                            <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Camera">
                            <div class="gadget-info">
                                <h3>Canon DSLR</h3>
                                <div class="price">$40/day</div>
                                <div class="availability">Available</div>
                            </div>
                        </div>
                        <!-- Add more gadget cards as needed -->
                    </div>
                </div>
            `;

            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .explore-modal {
                    display: block;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                }

                .explore-modal .modal-content {
                    background-color: white;
                    max-width: 1200px;
                    width: 90%;
                    max-height: 85vh;
                    overflow-y: auto;
                    padding: 20px;
                    margin: 20px auto;
                    border-radius: 8px;
                    position: relative;
                }

                .explore-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #eee;
                }

                .search-bar input {
                    width: 300px;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }

                .filters-section {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 20px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }

                .filter-group {
                    margin-bottom: 15px;
                }

                .filter-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: bold;
                    color: #333;
                }

                .category-filters {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .category-filters label {
                    font-weight: normal;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .price-range {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .price-range input {
                    width: 100px;
                    padding: 6px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                #sort-options {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                .gadgets-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }

                .gadget-card {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                    transition: transform 0.2s;
                }

                .gadget-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }

                .gadget-card img {
                    width: 100%;
                    height: 180px;
                    object-fit: cover;
                }

                .gadget-info {
                    padding: 15px;
                }

                .gadget-info h3 {
                    margin: 0 0 10px 0;
                    font-size: 1.1rem;
                }

                .gadget-info .price {
                    color: #007bff;
                    font-weight: bold;
                    margin-bottom: 10px;
                }

                .gadget-info .availability {
                    font-size: 0.9rem;
                    color: #28a745;
                }

                .close {
                    position: absolute;
                    right: 20px;
                    top: 20px;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                }

                @media (max-width: 768px) {
                    .explore-header {
                        flex-direction: column;
                        gap: 15px;
                    }

                    .search-bar input {
                        width: 100%;
                    }

                    .filters-section {
                        grid-template-columns: 1fr;
                    }
                }
            `;

            document.head.appendChild(style);
            document.body.appendChild(modal);

            // Add functionality
            const searchInput = modal.querySelector('#search-gadgets');
            const filterInputs = modal.querySelectorAll('.filters-section input, #sort-options');
            const gadgetsGrid = modal.querySelector('.gadgets-grid');

            // Search and filter functionality
            function filterGadgets() {
                const searchTerm = searchInput.value.toLowerCase();
                const selectedCategories = Array.from(modal.querySelectorAll('.category-filters input:checked'))
                    .map(input => input.value);
                const minPrice = parseFloat(modal.querySelector('#min-price').value) || 0;
                const maxPrice = parseFloat(modal.querySelector('#max-price').value) || Infinity;
                const sortBy = modal.querySelector('#sort-options').value;

                const gadgets = Array.from(gadgetsGrid.children);
                
                gadgets.forEach(gadget => {
                    const name = gadget.querySelector('h3').textContent.toLowerCase();
                    const price = parseFloat(gadget.querySelector('.price').textContent.match(/\d+/)[0]);
                    const category = gadget.dataset.category;

                    const matchesSearch = name.includes(searchTerm);
                    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category);
                    const matchesPrice = price >= minPrice && price <= maxPrice;

                    gadget.style.display = 
                        matchesSearch && matchesCategory && matchesPrice ? 'block' : 'none';
                });

                // Sort gadgets
                const sortedGadgets = Array.from(gadgets).sort((a, b) => {
                    const priceA = parseFloat(a.querySelector('.price').textContent.match(/\d+/)[0]);
                    const priceB = parseFloat(b.querySelector('.price').textContent.match(/\d+/)[0]);
                    const nameA = a.querySelector('h3').textContent;
                    const nameB = b.querySelector('h3').textContent;

                    switch(sortBy) {
                        case 'price-low':
                            return priceA - priceB;
                        case 'price-high':
                            return priceB - priceA;
                        case 'name':
                            return nameA.localeCompare(nameB);
                        default:
                            return 0;
                    }
                });

                sortedGadgets.forEach(gadget => gadgetsGrid.appendChild(gadget));
            }

            // Add event listeners
            searchInput.addEventListener('input', filterGadgets);
            filterInputs.forEach(input => {
                input.addEventListener('change', filterGadgets);
            });

            // Close modal functionality
            const close = modal.querySelector('.close');
            close.onclick = function() {
                modal.remove();
            }

            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.remove();
                }
            }
        });
    }
});