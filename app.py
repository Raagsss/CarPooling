from flask import Flask, request, jsonify
from flask_cors import CORS
import pyrebase
import re

app = Flask(__name__)
CORS(app)

firebase_config = {
    "apiKey": "AIzaSyAUeSwvXpjTnJHXE2gFoFvp3Qx1BSn__sM",
    "authDomain": "carpooling-d3b79.firebaseapp.com",
    "projectId": "carpooling-d3b79",
    "storageBucket": "carpooling-d3b79.firebasestorage.app",
    "messagingSenderId": "141878892814",
    "appId": "1:141878892814:web:d44af57a8ea10a91d21f5f",
    "measurementId": "G-WE830PPWVJ",
    "databaseURL": "https://carpooling-d3b79-default-rtdb.firebaseio.com/"
}

firebase = pyrebase.initialize_app(firebase_config)
auth = firebase.auth()

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    # Validate input
    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    try:
        # Try creating a new user
        user = auth.create_user_with_email_and_password(email, password)
        print(f"User created: {user}")  # Debugging: Print the user data
        
        return jsonify({"message": "User created successfully", "uid": user['localId']}), 201
    except pyrebase.pyrebase.AuthError as e:
        # Catch Firebase specific errors
        error_message = str(e)
        print(f"Signup error: {error_message}")  # Debugging: Print error
        
        if 'EMAIL_EXISTS' in error_message:
            return jsonify({"error": "Email already exists."}), 400
        elif 'WEAK_PASSWORD' in error_message:
            return jsonify({"error": "Password is too weak."}), 400
        else:
            return jsonify({"error": "Signup failed: " + error_message}), 400


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    # Validate email and password
    email_valid, email_error = validate_email(email)
    if not email_valid:
        return jsonify({"error": email_error}), 400

    password_valid, password_error = validate_password(password)
    if not password_valid:
        return jsonify({"error": password_error}), 400

    try:
        user = auth.sign_in_with_email_and_password(email, password)
        return jsonify({"message": "Login successful", "token": user['idToken']}), 200
    except pyrebase.pyrebase.AuthError as e:
        return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 400


def validate_password(password):
    if len(password) < 6:
        return False, "Password should be at least 6 characters long."
    return True, ""

def validate_email(email):
    regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(regex, email):
        return False, "Invalid email format."
    return True, ""

def verify_token(token):
    try:
        user = auth.get_account_info(token)
        return user
    except Exception as e:
        return None

@app.route('/profile', methods=['GET'])
def profile():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Token is missing."}), 400
    user_info = verify_token(token)
    if user_info is None:
        return jsonify({"error": "Invalid or expired token."}), 401
    return jsonify({"message": "Profile data", "user_info": user_info}), 200

if __name__ == '__main__':
    app.run(debug=True)
