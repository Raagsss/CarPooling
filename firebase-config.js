// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAUeSwvXpjTnJHXE2gFoFvp3Qx1BSn__sM",
    authDomain: "carpooling-d3b79.firebaseapp.com",
    databaseURL: "https://carpooling-d3b79-default-rtdb.firebaseio.com",
    projectId: "carpooling-d3b79",
    storageBucket: "carpooling-d3b79.firebasestorage.app",
    messagingSenderId: "141878892814",
    appId: "1:141878892814:web:d44af57a8ea10a91d21f5f",
    measurementId: "G-WE830PPWVJ",
    databaseURL: "https://carpooling-d3b79-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database();

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.email);
        // Redirect to landing page
        window.location.href = 'landing.html';
    } else {
        // User is signed out
        console.log('User is signed out');
    }
});

// Function to update UI for signed-in user
function updateUIForSignedInUser(user) {
    // Get user data from database
    const userRef = database.ref('users/' + user.uid);
    userRef.once('value')
        .then((snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                localStorage.setItem('token', user.uid);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('loggedInUser', user.email);
                localStorage.setItem('userName', userData.name);
                
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
}

// Function to update UI for signed-out user
function updateUIForSignedOutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userName');
    
    // Redirect to login page if not already there
    if (!window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
    }
}

// Export Firebase services for use in other files
window.firebaseServices = {
    auth: auth,
    database: database
}; 