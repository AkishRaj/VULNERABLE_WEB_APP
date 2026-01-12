# PROJECT TITLE : SECURITY BREACH SIMULATOR: THE HACKER’S PLAYGROUND


## INTRODUCTION
In today’s digital world, cyberattacks are becoming more frequent, complex,
and dangerous. Organizations face constant threats such as hacking, data
breaches, malware attacks, and unauthorized access to sensitive information.
Understanding how these attacks work is essential for building strong and
secure systems.
Security Breach Simulator: The Hacker’s Playground is a learning-oriented
simulation platform designed to demonstrate common cyberattack techniques
in a controlled and ethical environment. This simulator allows users to
explore how attackers exploit system vulnerabilities and how proper security
measures can prevent or mitigate these threats.
The project aims to bridge the gap between theoretical cybersecurity concepts
and real-world attack scenarios. By simulating attacks such as SQL injection,
cross-site scripting (XSS), password cracking, Sensitive Data Exposure And
Security Misconfiguraton users gain hands-on experience without causing
real-world damage.
Overall, this simulator helps students, developers, and security professionals
enhance their cybersecurity awareness, improve defensive strategies, and
better understand the mindset of attackers—making it a powerful educational
tool for modern cyber defense.

## OBJECTIVES
### 1.Educational Foundation
• To create an interactive learning platform for understanding web
security
• To demonstrate real-world attack scenarios in a controlled, safe
environment
• To demonstrate real-world attack scenarios in a controlled, safe
environment
### 2.Technical Implementation
• To develop a full-stack web application (Frontend + Backend +
Database)
• To intentionally implement OWASP Top 10 vulnerabilities for
demonstration
• To create a modular architecture allowing easy addition of new
vulnerabilities.
### 3.Security Awareness
• To illustrate the impact and consequences of security breaches
• To demonstrate how seemingly minor flaws can lead to major
security incidents
• To promote security-first mindset among developers and students

### 4. For Students/Developers:
• Understand SQL Injection mechanics and prevention techniques
• Learn about XSS attack vectors and sanitization methods
• Recognize authentication bypass vulnerabilities
• Identify sensitive data exposure risks
• Understand security misconfiguration impacts
5. For Evaluation/Demonstration:
• Provide live, interactive demonstration capabilities.
• Enable step-by-step attack execution with visual feedback.
• Show both vulnerable and secure code implementations.
• Document mitigation strategies for each vulnerability.

## IMPLEMENTATION
### RUN.BAT EXCUTION
### Objective
To start and run the vulnerable web application "Hacker's Playground" on
localhost for security vulnerability demonstrations.
Tool Used
• Operating System: Windows 10/11
• Command Line: PowerShell/CMD
• File: RUN.bat (Batch script)
• Prerequisites: Node.js installed
Step 1: Navigate to Project Directory
cmd
cd A:\VULNERABLE_APP
Step 2: Execute Batch File
cmd
RUN.bat
or double-click RUN.bat in File Explorer
Step 3: Automatic Process
The script automatically:
1. Checks for Node.js installation
2. Navigates to backend folder
3. Creates package.json (if missing)
4. Installs dependencies (express, sqlite3)
5. Starts the Node.js server
<img width="941" height="501" alt="image" src="https://github.com/user-attachments/assets/0d91a97b-dbdf-42c9-a093-736f732ba0a0" />

http:localhost:3000

## 1.SQL INJECTION
Objective
To test whether the login functionality is vulnerable to SQL Injection and
allows authentication bypass.
Tool Used
• Web Browser
Procedure
1. The vulnerable web application was started locally.
2. Burp Suite was configured as a proxy to intercept browser requests.
3. Interception mode was enabled in Burp Suite.
4. A login request was sent with an SQL Injection payload in the
username field.
5. Username: admin' --
6. Password: anything
7. The intercepted request was forwarded to the server.
Result
• Login was successful without entering the correct password.
• The application redirected to the main page.
• Authentication was bypassed.
10
2. Cross-Site Scripting (XSS) Implementation
Objective
To test whether the application is vulnerable to Cross-Site Scripting (XSS)
by injecting malicious scripts into user-controlled input.
Tool Used
• Web Browser (Chrome / Edge)
Procedure
1. The login page of the application was opened in the browser.
2. A malicious script was injected through the URL parameter.
3. <script>alert('XSS')</script>
4. The page was loaded with the injected input.
Result
• A JavaScript alert popup was displayed in the browser.
11
• The injected script executed successfully.
3. Broken Authentication Implementation
Objective
To test whether the authentication mechanism can be bypassed without
valid user credentials.
Tool Used
• Web Browser
• Burp Suite (optional)
Procedure
1. The login page of the application was opened.
2. An invalid or manipulated input was entered in the login fields.
3. Username: ' OR '1'='1
12
4. Password: ' OR '1'='1
5. The login request was submitted to the server.
Result
• Login was successful without valid credentials.
• The user was redirected to the main application page.
13
4. Security Misconfiguration
Objective
To identify insecure server configurations and missing security controls in
the web application.
Procedure
1. The application was executed locally on:
2. http://localhost:3000
Result
• Multiple security headers were found to be missing.
• The application server was running on an open port.
• Default server configuration was exposed.
14
5. Sensitive data exposure
Objective
To identify whether sensitive user credentials are stored and handled
securely in the application.
Procedure
1. The application database file was accessed locally.
2. The SQLite command-line interface was used to view stored user
data.
3. SELECT * FROM users;
4. The contents of the users table were observed.
Result
• User passwords were stored in plain text.
• Sensitive credential data was directly visible in the database.
15
CONCLUSION :
This project successfully demonstrated common web application security
vulnerabilities through the development and testing of an intentionally
vulnerable.
Vulnerabilities such as SQL Injection, Cross-Site Scripting (XSS),
broken authentication, security misconfiguration, and sensitive data
exposure were identified and validated using both manual techniques and
security testing in a controlled local environment.
The project highlights the risks associated with insecure coding practices
and improper security controls in web applications.
By practically performing these attacks, a better understanding of how
vulnerabilities arise and how they impact system security was achieved.
This work emphasizes the importance of secure design principles, proper
input validation, and secure data handling in real-world web application
development.
16
