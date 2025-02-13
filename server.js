require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// PostgreSQL Connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// User Authentication (Change password hash later)
const users = [{ username: 'admin', password: '$2a$10$hashedpassword' }];

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Query the database for the user
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const user = result.rows[0];

        // Compare password with hashed password in DB
        if (await bcrypt.compare(password, user.password)) {
            req.session.user = username;
            return res.json({ success: true, redirect: "/job_add.html" });
        } else {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Job Entry API
app.post('/submit-job', async (req, res) => {
    const { jobType, constructionSite, jobTitle } = req.body;

    try {
        await pool.query(
            'INSERT INTO jobs (job_type, construction_site, job_title) VALUES ($1, $2, $3)',
            [jobType, constructionSite, jobTitle]
        );
        res.json({ success: true, message: "Job added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
