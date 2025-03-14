Lost and Found (LAF) Web App

Overview

The Lost and Found (LAF) web application is designed to streamline the process of reporting, tracking, and claiming lost items at Fanshawe College. This application allows users to log lost and found items, verify ownership using QR codes, and manage reports efficiently through an admin dashboard.

Features

Report Lost Items: Users can report lost items with details such as item description, location, and date lost.

Log Found Items: Users can report found items, including images and location.

Claim Items: Owners can claim lost items by verifying their ownership via QR codes.

Admin Dashboard: Administrators can manage reports, verify claims, and oversee the entire process.

Notification System: Users receive updates on lost/found items.

Secure Authentication: Users need to sign in to report, claim, or manage items.

Tech Stack

Frontend: React.js with Tailwind CSS

Backend: Node.js with Express.js

Database: MongoDB

Authentication: Firebase Auth or a secure alternative

Hosting: Vercel/Netlify for frontend, Render/Heroku for backend

Installation

Prerequisites

Ensure you have the following installed:

Node.js

MongoDB (or a cloud alternative like MongoDB Atlas)

Git

Steps

Clone the repository:

git clone https://github.com/your-repo/laf-app.git
cd laf-app

Install dependencies:

npm install

Set up environment variables:
Create a .env file in the root directory and add the following:

MONGO_URI=your_mongodb_connection_string
FIREBASE_API_KEY=your_firebase_api_key

Run the development server:

npm start

Usage

Sign up/log in to access the dashboard.

Report a lost item by providing details.

Report a found item with necessary information.

Claim an item by scanning the QR code and verifying ownership.

Admins can manage and validate claims through the admin panel.

Contribution

Fork the repository.

Create a new branch (feature-branch-name).

Commit your changes (git commit -m 'Add new feature').

Push to your branch (git push origin feature-branch-name).

Open a pull request.

License

This project is licensed under the MIT License.

Contact

For any issues or suggestions, please contact:

Developer: Sandesh

Email: your-email@example.com

Project Repository: GitHub Link

