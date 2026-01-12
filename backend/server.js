const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ============ CREATE DATABASE IN MEMORY ============
const db = new sqlite3.Database(':memory:');

// Setup tables with sample data
db.serialize(() => {
    console.log('🔧 Creating database tables...');
    
    // Users table (for SQL Injection & Broken Auth)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'user',
        ssn TEXT,
        credit_card TEXT,
        session_token TEXT
    )`);
    
    // Posts table (for XSS attacks)
    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        author TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Secrets table (for Sensitive Data Exposure)
    db.run(`CREATE TABLE IF NOT EXISTS secrets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_name TEXT,
        key_value TEXT
    )`);
    
    // ============ INSERT SAMPLE DATA ============
    console.log('📝 Inserting sample data...');
    
    // Users
    const users = [
        ['admin', 'admin123', 'admin@hackme.com', 'admin', '123-45-6789', '4111-1111-1111-1111', 'token_admin_123'],
        ['john', 'password123', 'john@email.com', 'user', '987-65-4321', '5500-0000-0000-0004', 'token_john_456'],
        ['jane', 'letmein', 'jane@email.com', 'user', '456-78-9123', '3400-0000-0000-009', 'token_jane_789'],
        ['test', 'test123', 'test@test.com', 'user', '111-22-3333', '6011-0000-0000-0004', 'token_test_999']
    ];
    
    users.forEach(user => {
        db.run(`INSERT INTO users (username, password, email, role, ssn, credit_card, session_token) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`, user);
    });
    
    // Posts (with XSS payloads)
    const posts = [
        ['Welcome!', 'Hello everyone to our vulnerable site!', 'Admin'],
        ['XSS Test', '<script>alert("XSS Attack!")</script>', 'Hacker'],
        ['Click me', '<img src="x" onerror="alert(\'Hacked!\')">', 'Attacker'],
        ['Important', '<svg onload="alert(1)"></svg>', 'Security']
    ];
    
    posts.forEach(post => {
        db.run(`INSERT INTO posts (title, content, author) VALUES (?, ?, ?)`, post);
    });
    
    // Secrets
    const secrets = [
        ['API_KEY', 'AKIAIOSFODNN7EXAMPLE12345'],
        ['DB_PASSWORD', 'SuperSecretPassword!@#'],
        ['JWT_SECRET', 'mySuperSecretJWTKey123456'],
        ['ADMIN_PASSWORD', 'Admin@123456'],
        ['ENCRYPTION_KEY', 'ThisIsAVerySecretEncryptionKey']
    ];
    
    secrets.forEach(secret => {
        db.run(`INSERT INTO secrets (key_name, key_value) VALUES (?, ?)`, secret);
    });
    
    console.log('✅ Database setup complete!');
});

// ============ 1. SQL INJECTION ENDPOINTS ============
app.get('/api/users/search', (req, res) => {
    const username = req.query.username || '';
    
    // ⚠️ VULNERABLE: Direct string concatenation
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    console.log('🔓 SQLi Query:', query);
    
    db.all(query, (err, rows) => {
        if (err) {
            res.json({ error: err.message, query: query });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/users/login', (req, res) => {
    const { user, pass } = req.query;
    
    // ⚠️ VULNERABLE: SQL Injection in login
    const query = `SELECT * FROM users WHERE username = '${user}' AND password = '${pass}'`;
    console.log('🔓 Login Query:', query);
    
    db.get(query, (err, row) => {
        if (err) {
            res.json({ error: err.message });
            return;
        }
        if (row) {
            res.json({ success: true, user: row });
        } else {
            res.json({ success: false });
        }
    });
});

// ============ 2. XSS ENDPOINTS ============
app.get('/api/posts', (req, res) => {
    // ⚠️ VULNERABLE: No output encoding
    db.all('SELECT * FROM posts ORDER BY id DESC', (err, posts) => {
        if (err) {
            res.json({ error: err.message });
            return;
        }
        res.json(posts);
    });
});

app.post('/api/posts', (req, res) => {
    const { title, content, author } = req.body;
    
    // ⚠️ VULNERABLE: Storing raw HTML
    db.run('INSERT INTO posts (title, content, author) VALUES (?, ?, ?)', 
        [title, content, author], function(err) {
            if (err) {
                res.json({ error: err.message });
                return;
            }
            res.json({ success: true, id: this.lastID });
        });
});

// ============ 3. BROKEN AUTHENTICATION ============
app.get('/api/admin/users', (req, res) => {
    const token = req.query.token || '';
    
    // ⚠️ VULNERABLE: Weak token check
    if (token.includes('admin')) {
        db.all('SELECT * FROM users', (err, users) => {
            res.json(users);
        });
    } else {
        // ⚠️ But still return data anyway (broken auth)
        db.all('SELECT id, username, email FROM users', (err, users) => {
            res.json(users);
        });
    }
});

// ============ 4. SENSITIVE DATA EXPOSURE ============
app.get('/api/secrets', (req, res) => {
    // ⚠️ VULNERABLE: No authentication at all
    db.all('SELECT * FROM secrets', (err, secrets) => {
        res.json(secrets);
    });
});

app.get('/api/users/all', (req, res) => {
    // ⚠️ VULNERABLE: Exposing all sensitive data
    db.all('SELECT * FROM users', (err, users) => {
        res.json(users);
    });
});

// ============ 5. SECURITY MISCONFIGURATION ============
app.get('/api/debug', (req, res) => {
    // ⚠️ VULNERABLE: Debug endpoint exposed
    res.json({
        status: 'DEBUG MODE',
        timestamp: new Date(),
        node_version: process.version,
        memory: process.memoryUsage(),
        env: process.env.NODE_ENV || 'production'
    });
});

app.get('/api/backup', (req, res) => {
    // ⚠️ VULNERABLE: Directory traversal possible
    res.json({
        backup_available: true,
        path: '/backups/database.sql',
        message: 'Backup file accessible'
    });
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'RUNNING', 
        vulnerabilities: [
            'SQL Injection',
            'Cross-Site Scripting (XSS)',
            'Broken Authentication',
            'Sensitive Data Exposure',
            'Security Misconfiguration'
        ]
    });
});

// ============ SERVE FRONTEND ============
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║   🔥 HACKER'S PLAYGROUND ACTIVATED! 🔥   ║
    ║                                          ║
    ║  🌐 http://localhost:${PORT}                ║
    ║                                          ║
    ║  ⚠️  VULNERABILITIES ENABLED:            ║
    ║     • SQL Injection                      ║
    ║     • XSS (Cross-Site Scripting)         ║
    ║     • Broken Authentication              ║
    ║     • Sensitive Data Exposure            ║
    ║     • Security Misconfiguration          ║
    ║                                          ║
    ║  🗄️  Database: SQLite (In-Memory)        ║
    ╚══════════════════════════════════════════╝
    `);
});