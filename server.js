const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Initialize SQLite Database (DB Browser compatible)
const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error("DB Connection Error:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Create users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
)`);

// Routes

// Register Page
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "register.html"));
});

// Handle Register Form
app.post("/register", (req, res) => {
    const { email, password } = req.body;

    // Insert into DB
    const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.run(query, [email, password], function(err) {
        if (err) {
            if(err.message.includes("UNIQUE constraint failed")) {
                res.send("<h1>Email already registered ❌</h1>");
            } else {
                res.send("<h1>Error: " + err.message + "</h1>");
            }
        } else {
            res.send("<h1>Registration Successful ✅</h1><a href='/login'>Go to Login</a>");
        }
    });
});

// Login Page
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// Handle Login Form
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.get(query, [email, password], (err, row) => {
        if (err) {
            res.send("<h1>Error: " + err.message + "</h1>");
        } else if (row) {
            res.send(`<h1>Login Successful ✅</h1><p>Welcome ${row.email}</p>`);
        } else {
            res.send("<h1>Invalid Email or Password ❌</h1>");
        }
    });
});

// Home Redirect
app.get("/", (req, res) => {
    res.redirect("/register");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});