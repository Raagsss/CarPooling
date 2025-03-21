document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    const switchToSignup = document.getElementById("switch-to-signup");
    const switchToLogin = document.getElementById("switch-to-login");

    function showLogin() {
        loginForm.classList.add("active");
        signupForm.classList.remove("active");
    }

    function showSignup() {
        signupForm.classList.add("active");
        loginForm.classList.remove("active");
    }

    switchToSignup?.addEventListener("click", showSignup);
    switchToLogin?.addEventListener("click", showLogin);

    // ✅ Handle Login and Save User Email
    document.querySelector("#login-form form")?.addEventListener("submit", function (e) {
        e.preventDefault();

        let email = document.querySelector("#login-form input[type='email']").value.trim();
        if (!email) {
            alert("❌ Please enter a valid email.");
            return;
        }

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loggedInUser", email); // ✅ Store user email
        alert("✅ Login Successful!");
        window.location.href = "landing.html";
    });

    // ✅ Logout Function
    document.getElementById("logout-btn")?.addEventListener("click", function () {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loggedInUser"); // ✅ Clear stored email
        window.location.href = "index.html";
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

// ✅ Search Rides (Matches Pickup & Drop-off)
function searchRides() {
    let pickup = document.getElementById("search-pickup").value.toLowerCase();
    let dropoff = document.getElementById("search-dropoff").value.toLowerCase();

    let rides = JSON.parse(localStorage.getItem("rides")) || [];
    let filteredRides = rides.filter(ride =>
        ride.pickup.toLowerCase().includes(pickup) &&
        ride.dropoff.toLowerCase().includes(dropoff)
    );

    displayRides(filteredRides);
}

// ✅ Display Available Rides
function displayRides(rides) {
    let rideResults = document.getElementById("ride-results");
    rideResults.innerHTML = "";

    if (rides.length === 0) {
        rideResults.innerHTML = "<p>No rides found.</p>";
        return;
    }

    let bookedRides = JSON.parse(localStorage.getItem("bookedRides")) || {};
    let loggedInUser = localStorage.getItem("loggedInUser");

    rides.forEach((ride, index) => {
        let rideCard = document.createElement("div");
        rideCard.classList.add("ride-card");

        let isBooked = bookedRides[loggedInUser]?.some(r => r.pickup === ride.pickup && r.dropoff === ride.dropoff);

        rideCard.innerHTML = `
            <p><strong>Pickup:</strong> ${ride.pickup}</p>
            <p><strong>Drop-off:</strong> ${ride.dropoff}</p>
            <p><strong>Date:</strong> ${ride.date}</p>
            <p><strong>Time:</strong> ${ride.time}</p>
            <button onclick="bookRide(${index})" ${isBooked ? "disabled" : ""}>
                ${isBooked ? "Booked" : "Book Ride"}
            </button>
            ${isBooked ? `<button onclick="unbookRide(${index})">Unbook</button>` : ""}
        `;

        rideResults.appendChild(rideCard);
    });
}

// ✅ Load rides when page loads
function loadRides() {
    let rides = JSON.parse(localStorage.getItem("rides")) || [];
    displayRides(rides);
}

// ✅ Book a Ride (Unique per User)
function bookRide(rideIndex) {
    let loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        alert("❌ Please log in to book a ride.");
        return;
    }

    let rides = JSON.parse(localStorage.getItem("rides")) || [];
    let bookedRides = JSON.parse(localStorage.getItem("bookedRides")) || {};

    let selectedRide = rides[rideIndex];

    // Ensure bookedRides is an object with user-specific lists
    if (!bookedRides[loggedInUser]) {
        bookedRides[loggedInUser] = [];
    }

    // Prevent duplicate booking
    if (bookedRides[loggedInUser].some(ride => ride.pickup === selectedRide.pickup && ride.dropoff === selectedRide.dropoff)) {
        alert("✅ You have already booked this ride.");
        return;
    }

    bookedRides[loggedInUser].push(selectedRide);
    localStorage.setItem("bookedRides", JSON.stringify(bookedRides));
    alert("✅ Ride booked successfully!");

    displayRides(rides); // Refresh UI
}

// ✅ Unbook a Ride
function unbookRide(rideIndex) {
    let loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        alert("❌ Please log in to unbook a ride.");
        return;
    }

    let rides = JSON.parse(localStorage.getItem("rides")) || [];
    let bookedRides = JSON.parse(localStorage.getItem("bookedRides")) || {};

    if (!bookedRides[loggedInUser]) return;

    let selectedRide = rides[rideIndex];

    // Remove the booked ride
    bookedRides[loggedInUser] = bookedRides[loggedInUser].filter(ride => ride.pickup !== selectedRide.pickup || ride.dropoff !== selectedRide.dropoff);
    localStorage.setItem("bookedRides", JSON.stringify(bookedRides));
    alert("🚗 Ride unbooked successfully!");

    displayRides(rides); // Refresh UI
}
