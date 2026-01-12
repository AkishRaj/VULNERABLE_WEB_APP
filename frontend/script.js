// Hacker's Playground - Frontend Logic
const API_BASE = 'http://localhost:3000/api';
let attackCount = 0;
let dataExposed = 0;

// Update hacker time
function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('hackerTime').textContent = time;
}
setInterval(updateTime, 1000);
updateTime();

// Update console status
function updateConsoleStatus(status, type = 'info') {
    const statusEl = document.getElementById('consoleStatus');
    statusEl.textContent = status;
    
    const colors = {
        'info': '#00ccff',
        'success': '#00ff00',
        'error': '#ff0033',
        'warning': '#ffcc00'
    };
    statusEl.style.background = colors[type] || colors.info;
}

// Add log to terminal
function addLog(message, type = 'info') {
    const terminal = document.getElementById('terminalOutput');
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    const icons = {
        'info': '→',
        'success': '✓',
        'error': '✗',
        'warning': '⚠'
    };
    
    const colors = {
        'info': '#00ccff',
        'success': '#00ff00',
        'error': '#ff0033',
        'warning': '#ffcc00'
    };
    
    const log = document.createElement('div');
    log.className = 'log';
    log.innerHTML = `
        <span class="time">[${time}]</span>
        <span class="${type}" style="color: ${colors[type]}; margin-right: 8px">${icons[type]}</span>
        ${message}
    `;
    
    terminal.appendChild(log);
    terminal.scrollTop = terminal.scrollHeight;
    
    // Update attack counter
    if (type === 'success') {
        attackCount++;
        document.getElementById('attackCount').textContent = attackCount;
    }
}

// ============ 1. SQL INJECTION ============
async function executeSQLi() {
    const input = document.getElementById('sqlInput').value;
    const resultEl = document.getElementById('sqlResult');
    
    if (!input) {
        resultEl.textContent = 'Please enter a payload!';
        return;
    }
    
    updateConsoleStatus('EXECUTING SQLi', 'warning');
    addLog(`Executing SQL Injection: ${input.substring(0, 50)}...`, 'warning');
    
    try {
        const response = await fetch(`${API_BASE}/users/search?username=${encodeURIComponent(input)}`);
        const data = await response.json();
        
        if (data.error) {
            resultEl.textContent = `ERROR: ${data.error}`;
            addLog(`SQLi Failed: ${data.error}`, 'error');
        } else {
            resultEl.textContent = JSON.stringify(data, null, 2);
            
            // Count data exposed
            if (Array.isArray(data)) {
                dataExposed += data.length;
                document.getElementById('dataCount').textContent = `${dataExposed} records`;
            }
            
            addLog(`SQLi Successful! Retrieved ${Array.isArray(data) ? data.length : 1} records`, 'success');
            updateConsoleStatus('SUCCESS', 'success');
        }
    } catch (error) {
        resultEl.textContent = `Network Error: ${error.message}`;
        addLog(`SQLi Network Error: ${error.message}`, 'error');
        updateConsoleStatus('ERROR', 'error');
    }
}

// ============ 2. XSS ATTACKS ============
async function executeXSS() {
    const input = document.getElementById('xssInput').value;
    const previewEl = document.getElementById('xssPreview');
    
    if (!input) {
        previewEl.textContent = 'Please enter XSS payload!';
        return;
    }
    
    updateConsoleStatus('EXECUTING XSS', 'warning');
    addLog(`Posting XSS payload: ${input.substring(0, 50)}...`, 'warning');
    
    try {
        // First, post the XSS
        const postResponse = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'XSS Attack',
                content: input,
                author: 'Hacker'
            })
        });
        
        const postData = await postResponse.json();
        
        if (postData.success) {
            // Then fetch and display all posts (XSS will execute here)
            const getResponse = await fetch(`${API_BASE}/posts`);
            const posts = await getResponse.json();
            
            // Display posts (VULNERABLE - raw HTML)
            previewEl.innerHTML = '';
            posts.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                postDiv.innerHTML = `
                    <strong>${post.title}</strong>
                    <div class="content">${post.content}</div>
                    <small>By: ${post.author}</small>
                    <hr>
                `;
                previewEl.appendChild(postDiv);
            });
            
            addLog('XSS posted successfully! Check preview for execution.', 'success');
            updateConsoleStatus('XSS EXECUTED', 'success');
        }
    } catch (error) {
        previewEl.textContent = `Error: ${error.message}`;
        addLog(`XSS Error: ${error.message}`, 'error');
        updateConsoleStatus('ERROR', 'error');
    }
}

// ============ 3. BROKEN AUTHENTICATION ============
async function bypassAuth() {
    const user = document.getElementById('authUser').value;
    const pass = document.getElementById('authPass').value;
    const resultEl = document.getElementById('authResult');
    
    updateConsoleStatus('BYPASSING AUTH', 'warning');
    addLog(`Attempting auth bypass for user: ${user}`, 'warning');
    
    try {
        const response = await fetch(`${API_BASE}/users/login?user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const data = await response.json();
        
        if (data.success) {
            resultEl.textContent = `✅ LOGIN SUCCESSFUL!\n\nUser Details:\n${JSON.stringify(data.user, null, 2)}`;
            
            // Also try to get admin data
            const adminResponse = await fetch(`${API_BASE}/admin/users?token=admin_token`);
            const adminData = await adminResponse.json();
            
            resultEl.textContent += `\n\n🔓 ADMIN ACCESS GRANTED:\n${JSON.stringify(adminData.slice(0, 3), null, 2)}`;
            
            dataExposed += Array.isArray(adminData) ? adminData.length : 1;
            document.getElementById('dataCount').textContent = `${dataExposed} records`;
            
            addLog(`Auth bypass successful! Accessed ${Array.isArray(adminData) ? adminData.length : 1} user records`, 'success');
            updateConsoleStatus('AUTH BYPASSED', 'success');
        } else {
            resultEl.textContent = '❌ Login failed. Try SQL injection in username field!';
            addLog('Auth bypass failed - try SQL injection payload', 'error');
        }
    } catch (error) {
        resultEl.textContent = `Error: ${error.message}`;
        addLog(`Auth Error: ${error.message}`, 'error');
        updateConsoleStatus('ERROR', 'error');
    }
}

// ============ 4. SENSITIVE DATA EXPOSURE ============
async function getAllData() {
    const resultEl = document.getElementById('dataResult');
    
    updateConsoleStatus('EXTRACTING DATA', 'warning');
    addLog('Attempting to extract all user data...', 'warning');
    
    try {
        const response = await fetch(`${API_BASE}/users/all`);
        const data = await response.json();
        
        resultEl.textContent = JSON.stringify(data, null, 2);
        
        if (Array.isArray(data)) {
            dataExposed += data.length;
            document.getElementById('dataCount').textContent = `${dataExposed} records`;
        }
        
        addLog(`Extracted ${Array.isArray(data) ? data.length : 1} user records with sensitive data!`, 'success');
        updateConsoleStatus('DATA EXTRACTED', 'success');
    } catch (error) {
        resultEl.textContent = `Error: ${error.message}`;
        addLog(`Data extraction failed: ${error.message}`, 'error');
        updateConsoleStatus('ERROR', 'error');
    }
}

async function getSecrets() {
    const resultEl = document.getElementById('dataResult');
    
    updateConsoleStatus('GETTING SECRETS', 'warning');
    addLog('Attempting to access secret keys...', 'warning');
    
    try {
        const response = await fetch(`${API_BASE}/secrets`);
        const data = await response.json();
        
        resultEl.textContent = JSON.stringify(data, null, 2);
        
        if (Array.isArray(data)) {
            dataExposed += data.length;
            document.getElementById('dataCount').textContent = `${dataExposed} records`;
        }
        
        addLog(`Extracted ${Array.isArray(data) ? data.length : 1} secret keys!`, 'success');
        updateConsoleStatus('SECRETS EXPOSED', 'success');
    } catch (error) {
        resultEl.textContent = `Error: ${error.message}`;
        addLog(`Failed to get secrets: ${error.message}`, 'error');
    }
}

async function getCreditCards() {
    const resultEl = document.getElementById('dataResult');
    
    updateConsoleStatus('EXTRACTING CARDS', 'warning');
    addLog('Attempting to access credit card data...', 'warning');
    
    try {
        const response = await fetch(`${API_BASE}/users/all`);
        const data = await response.json();
        
        // Extract credit cards
        const cards = Array.isArray(data) ? data.map(user => ({
            user: user.username,
            card: user.credit_card,
            ssn: user.ssn
        })) : [];
        
        resultEl.textContent = JSON.stringify(cards, null, 2);
        dataExposed += cards.length;
        document.getElementById('dataCount').textContent = `${dataExposed} records`;
        
        addLog(`Extracted ${cards.length} credit card records!`, 'success');
        updateConsoleStatus('CARDS EXPOSED', 'success');
    } catch (error) {
        resultEl.textContent = `Error: ${error.message}`;
        addLog(`Failed to get credit cards: ${error.message}`, 'error');
    }
}

// ============ 5. SECURITY MISCONFIGURATION ============
async function getConfig() {
    const resultEl = document.getElementById('configResult');
    
    updateConsoleStatus('GETTING CONFIG', 'warning');
    addLog('Accessing system configuration...', 'warning');
    
    try {
        const response = await fetch(`${API_BASE}/config`);
        const data = await response.json();
        
        resultEl.textContent = JSON.stringify(data, null, 2);
        addLog('System configuration exposed!', 'success');
        updateConsoleStatus('CONFIG EXPOSED', 'success');
    } catch (error) {
        resultEl.textContent = `Error: ${error.message}`;
        addLog(`Failed to get config: ${error.message}`, 'error');
    }
}

async function debugInfo() {
    const resultEl = document.getElementById('configResult');
    
    updateConsoleStatus('DEBUG MODE', 'warning');
    addLog('Triggering debug endpoint...', 'warning');
    
    try {
        const response = await fetch(`${API_BASE}/debug`);
        const data = await response.json();
        
        resultEl.textContent = JSON.stringify(data, null, 2);
        addLog('Debug information exposed!', 'success');
        updateConsoleStatus('DEBUG DATA', 'success');
    } catch (error) {
        resultEl.textContent = `Error: ${error.message}`;
        addLog(`Debug endpoint failed: ${error.message}`, 'error');
    }
}

async function listBackups() {
    const resultEl = document.getElementById('configResult');
    
    updateConsoleStatus('FINDING BACKUPS', 'warning');
    addLog('Looking for backup files...', 'warning');
    
    try {
        const response = await fetch(`${API_BASE}/backup`);
        const data = await response.json();
        
        resultEl.textContent = JSON.stringify(data, null, 2);
        addLog('Backup information found!', 'success');
        updateConsoleStatus('BACKUPS FOUND', 'success');
    } catch (error) {
        resultEl.textContent = `Error: ${error.message}`;
        addLog(`Backup search failed: ${error.message}`, 'error');
    }
}

// ============ TERMINAL COMMANDS ============
document.getElementById('commandInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const command = this.value.trim().toLowerCase();
        this.value = '';
        
        addLog(`Command: ${command}`, 'info');
        
        switch(command) {
            case 'help':
                addLog('Available commands:', 'info');
                addLog('  help - Show this help', 'info');
                addLog('  clear - Clear terminal', 'info');
                addLog('  status - Show system status', 'info');
                addLog('  attack sql - Test SQL injection', 'info');
                addLog('  attack xss - Test XSS', 'info');
                addLog('  attack auth - Test auth bypass', 'info');
                break;
                
            case 'clear':
                document.getElementById('terminalOutput').innerHTML = '';
                break;
                
            case 'status':
                addLog(`System Status:`, 'info');
                addLog(`  Attacks executed: ${attackCount}`, 'success');
                addLog(`  Data exposed: ${dataExposed} records`, 'warning');
                addLog(`  Vulnerabilities: 5 active`, 'info');
                break;
                
            case 'attack sql':
                document.getElementById('sqlInput').value = "' OR '1'='1";
                executeSQLi();
                break;
                
            case 'attack xss':
                document.getElementById('xssInput').value = "<script>alert('HACKED')</script>";
                executeXSS();
                break;
                
            case 'attack auth':
                document.getElementById('authUser').value = "admin' --";
                document.getElementById('authPass').value = "anything";
                bypassAuth();
                break;
                
            default:
                addLog(`Unknown command: ${command}`, 'error');
        }
    }
});

// Initialize
addLog('Hacker\'s Playground initialized!', 'success');
addLog('Type "help" in terminal for commands', 'info');
updateConsoleStatus('READY', 'success');