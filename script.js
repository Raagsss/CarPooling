// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAUeSwvXpjTnJHXE2gFoFvp3Qx1BSn__sM",
    authDomain: "carpooling-d3b79.firebaseapp.com",
    projectId: "carpooling-d3b79",
    storageBucket: "carpooling-d3b79.firebasestorage.app",
    messagingSenderId: "141878892814",
    appId: "1:141878892814:web:d44af57a8ea10a91d21f5f",
    measurementId: "G-WE830PPWVJ",
    databaseURL: "https://carpooling-d3b79-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.email);
        // Only redirect if we're on the login page
        if (window.location.pathname.includes('index.html')) {
            window.location.replace('landing.html');
        }
        // Get user data from database
        database.ref(`users/${user.uid}`).once('value')
            .then((snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    // Update UI elements if they exist
                    const userNameElement = document.getElementById('userName');
                    if (userNameElement) {
                        userNameElement.textContent = `Welcome, ${userData.name}!`;
                    }
                }
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            });
    } else {
        // User is signed out
        console.log('User is signed out');
        // Only redirect to login page if we're not already on the login page
        if (!window.location.pathname.includes('index.html')) {
            window.location.replace('index.html');
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // Get form elements
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const switchToSignup = document.getElementById("switch-to-signup");
    const switchToLogin = document.getElementById("switch-to-login");

    // Form Elements
    const loginFormElement = document.getElementById('loginForm');
    const signupFormElement = document.getElementById('signupForm');

    // Password Toggle Elements
    const passwordToggles = document.querySelectorAll('.password-toggle');

    // Form switching functions
    function showLogin() {
        if (loginForm && signupForm) {
            loginForm.style.display = "block";
            signupForm.style.display = "none";
            // Reset any error messages
            document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
        }
    }

    function showSignup() {
        if (loginForm && signupForm) {
            signupForm.style.display = "block";
            loginForm.style.display = "none";
            // Reset any error messages
            document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
        }
    }

    // Add click event listeners for form switching
    if (switchToSignup) {
        switchToSignup.addEventListener("click", function(e) {
            e.preventDefault();
            showSignup();
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener("click", function(e) {
            e.preventDefault();
            showLogin();
        });
    }

    // Password Toggle Functionality
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Form Validation Functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    // Error handling
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    }

    // Login Form Handler
    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Validation
        if (!validateEmail(email)) {
            showError('loginEmailError', 'Please enter a valid email address');
            return;
        }

        if (!validatePassword(password)) {
            showError('loginPasswordError', 'Password must be at least 6 characters long');
            return;
        }

        try {
            const submitButton = loginFormElement.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

            // Sign in with Firebase
            await auth.signInWithEmailAndPassword(email, password);
            // Redirect to landing page after successful login
            window.location.replace('landing.html');
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed. Please try again.';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
            }
            alert(errorMessage);
            const submitButton = loginFormElement.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Login';
        }
    });

    // Signup Form Handler
    signupFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!name.trim()) {
            showError('signupNameError', 'Please enter your name');
            return;
        }

        if (!validateEmail(email)) {
            showError('signupEmailError', 'Please enter a valid email address');
            return;
        }

        if (!validatePassword(password)) {
            showError('signupPasswordError', 'Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            return;
        }

        try {
            const submitButton = signupFormElement.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

            // Create user with Firebase
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Store user data in database
            await database.ref(`users/${user.uid}`).set({
                name: name,
                email: email,
                createdAt: new Date().toISOString()
            });

            alert('Account created successfully!');
            // Redirect to landing page after successful signup
            window.location.replace('landing.html');
        } catch (error) {
            console.error('Signup error:', error);
            let errorMessage = 'Signup failed. Please try again.';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Email/password accounts are not enabled.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters.';
                    break;
            }
            alert(errorMessage);
            const submitButton = signupFormElement.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Sign Up';
        }
    });

    // Check if user is already logged in
    function checkAuthStatus() {
        const currentUser = auth.currentUser;
        if (currentUser && window.location.pathname.includes('index.html')) {
            window.location.replace('landing.html');
        }
    }

    // Run auth check when page loads
    window.onload = function() {
        checkAuthStatus();
    };

    // ✅ Logout Function
    document.getElementById("logout-btn")?.addEventListener("click", function () {
        logout();
    });

    // ✅ Redirect to Create Ride
    document.getElementById("offerRideBtn")?.addEventListener("click", function () {
        window.location.href = "create_ride.html";
    });

    // ✅ Redirect to Find Ride Page
    document.getElementById("findRideBtn")?.addEventListener("click", function () {
        window.location.href = "find_ride.html";
    });

    // ✅ Load rides on page load
    loadRides();
});

// Logout Function
function logout() {
    auth.signOut().then(() => {
        window.location.replace('index.html');
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}

// Search Rides Function
function searchRides() {
    let pickup = document.getElementById("search-pickup").value.toLowerCase();
    let dropoff = document.getElementById("search-dropoff").value.toLowerCase();

    const ridesRef = database.ref('rides');
    ridesRef.once('value')
        .then((snapshot) => {
            let rides = [];
            snapshot.forEach((childSnapshot) => {
                rides.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            let filteredRides = rides.filter(ride =>
                ride.pickup.toLowerCase().includes(pickup) &&
                ride.dropoff.toLowerCase().includes(dropoff)
            );

            displayRides(filteredRides);
        })
        .catch((error) => {
            console.error('Error fetching rides:', error);
            alert('Error fetching rides. Please try again.');
        });
}

// Display Available Rides
function displayRides(rides) {
    let rideResults = document.getElementById("ride-results");
    if (!rideResults) return;

    rideResults.innerHTML = "";

    if (rides.length === 0) {
        rideResults.innerHTML = "<p>No rides found.</p>";
        return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    rides.forEach((ride) => {
        let rideCard = document.createElement("div");
        rideCard.classList.add("ride-card");

        // Check if current user has booked this ride
        const isBooked = ride.bookings && ride.bookings[currentUser.uid];

        rideCard.innerHTML = `
            <p><strong>Pickup:</strong> ${ride.pickup}</p>
            <p><strong>Drop-off:</strong> ${ride.dropoff}</p>
            <p><strong>Date:</strong> ${ride.date}</p>
            <p><strong>Time:</strong> ${ride.time}</p>
            <p><strong>Available Seats:</strong> ${ride.availableSeats}</p>
            <button onclick="bookRide('${ride.id}')" ${isBooked ? "disabled" : ""}>
                ${isBooked ? "Booked" : "Book Ride"}
            </button>
            ${isBooked ? `<button onclick="unbookRide('${ride.id}')">Unbook</button>` : ""}
        `;

        rideResults.appendChild(rideCard);
    });
}

// Book a Ride
function bookRide(rideId) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        alert("Please log in to book a ride.");
        return;
    }

    const rideRef = database.ref('rides/' + rideId);
    const userBookingsRef = database.ref(`users/${currentUser.uid}/bookings/${rideId}`);

    rideRef.once('value')
        .then((snapshot) => {
            const ride = snapshot.val();
            if (!ride) {
                alert("Ride not found.");
                return;
            }

            if (ride.availableSeats <= 0) {
                alert("No seats available.");
                return;
            }

            // Check if user has already booked this ride
            return userBookingsRef.once('value')
                .then((bookingSnapshot) => {
                    if (bookingSnapshot.exists()) {
                        alert("You have already booked this ride.");
                        return;
                    }

                    // Store the complete ride details in user's bookings
                    const bookingData = {
                        rideId: rideId,
                        bookedAt: new Date().toISOString(),
                        rideDetails: {
                            riderName: ride.riderName,
                            pickup: ride.pickup,
                            destination: ride.destination,
                            date: ride.date,
                            time: ride.time,
                            price: ride.price,
                            availableSeats: ride.availableSeats,
                            phonenumber: ride.phonenumber
                        }
                    };

                    // Update ride data and add to user's bookings
                    return Promise.all([
                        rideRef.update({
                            availableSeats: ride.availableSeats - 1,
                            [`bookings/${currentUser.uid}`]: true
                        }),
                        userBookingsRef.set(bookingData)
                    ]);
                });
        })
        .then(() => {
            alert("Ride booked successfully!");
            searchRides(); // Refresh the display
        })
        .catch((error) => {
            console.error('Error booking ride:', error);
            alert('Error booking ride. Please try again.');
        });
}

// Unbook a Ride
function unbookRide(rideId) {
    if (!confirm('Are you sure you want to unbook this ride?')) {
        return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const rideRef = database.ref(`rides/${rideId}`);
    const userBookingRef = database.ref(`users/${currentUser.uid}/bookings/${rideId}`);

    // Get current ride data
    rideRef.once('value')
        .then((snapshot) => {
            const rideData = snapshot.val();
            if (!rideData) {
                throw new Error('Ride not found');
            }

            // Update available seats and remove booking
            const updates = {
                availableSeats: rideData.availableSeats + 1,
                [`bookings/${currentUser.uid}`]: null
            };

            // Update ride and remove booking
            return Promise.all([
                rideRef.update(updates),
                userBookingRef.remove()
            ]);
        })
        .then(() => {
            alert('Ride unbooked successfully!');
            loadUserBookedRides(); // Refresh the list
        })
        .catch((error) => {
            console.error('Error unbooking ride:', error);
            alert('Error unbooking ride. Please try again.');
        });
}

// Load rides when page loads
function loadRides() {
    let rides = JSON.parse(localStorage.getItem("rides")) || [];
    displayRides(rides);
}

// Load User's Booked Rides
function loadUserBookedRides() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userBookingsRef = database.ref(`users/${currentUser.uid}/bookings`);
    userBookingsRef.once('value')
        .then((snapshot) => {
            const bookedRides = [];
            snapshot.forEach((childSnapshot) => {
                bookedRides.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            displayBookedRides(bookedRides);
        })
        .catch((error) => {
            console.error('Error loading booked rides:', error);
            alert('Error loading booked rides. Please try again.');
        });
}

// Display Booked Rides
function displayBookedRides(bookedRides) {
    const bookedRidesList = document.getElementById("bookedRidesList");
    if (!bookedRidesList) return;

    bookedRidesList.innerHTML = "";

    if (bookedRides.length === 0) {
        bookedRidesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>No Booked Rides</h3>
                <p>You haven't booked any rides yet.</p>
                <button class="btn btn-primary" onclick="window.location.href='find_ride.html'">
                    <i class="fas fa-search"></i> Find a Ride
                </button>
            </div>
        `;
        return;
    }

    bookedRides.forEach((booking) => {
        const ride = booking.rideDetails;
        const rideElement = document.createElement("div");
        rideElement.className = "ride";
        rideElement.innerHTML = `
            <div class="ride-header">
                <div class="rider-info">
                    <div class="rider-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="rider-name">${ride.riderName}</div>
                </div>
                <div class="ride-price">
                    <i class="fas fa-rupee-sign"></i>
                    <span>${ride.price}</span>
                </div>
            </div>
            <div class="ride-details">
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <p>${ride.date}</p>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <p>${ride.time}</p>
                </div>
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <p><strong>Pickup:</strong> ${ride.pickup}</p>
                </div>
                <div class="detail-item">
                    <i class="fas fa-map-marker"></i>
                    <p><strong>Destination:</strong> ${ride.destination}</p>
                </div>
            </div>
            <div class="ride-actions">
                <button class="btn btn-danger" onclick="unbookRide('${booking.id}')">
                    <i class="fas fa-times"></i> Unbook Ride
                </button>
            </div>
        `;
        bookedRidesList.appendChild(rideElement);
    });
}

