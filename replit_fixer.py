#!/usr/bin/env python3
"""
Replit Application Diagnostic and Repair Tool

This script helps diagnose and fix common issues in Replit applications.
Run this script to perform an automatic diagnosis and get recommendations for fixing your application.
"""

import os
import sys
import subprocess
import logging
import re
import json
import importlib
import pkgutil
import time
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("ReplitFixer")

class ReplitFixer:
    def __init__(self):
        self.issues = []
        self.fixes_applied = []
        self.repl_directory = os.getcwd()
        self.root_files = []
        self.python_files = []
        self.js_files = []
        self.html_files = []
        self.package_json = None
        self.requirements_txt = None
        self.pyproject_toml = None
        self.poetry_lock = None
        self.replit_nix = None
        self.has_flask = False
        self.has_django = False
        self.has_fastapi = False
        self.has_nodejs = False
        self.has_react = False
        self.fixed_error = False
        
    def scan_directory(self):
        """Scan the directory structure to identify important files"""
        logger.info("🔍 Scanning directory structure...")
        
        for root, dirs, files in os.walk(self.repl_directory):
            # Skip node_modules, __pycache__, and .git directories
            dirs[:] = [d for d in dirs if d not in ('node_modules', '__pycache__', '.git', 'venv', '.venv')]
            
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, self.repl_directory)
                
                # Get the root level files
                if root == self.repl_directory:
                    self.root_files.append(file)
                
                # Categorize by file extension
                if file.endswith('.py'):
                    self.python_files.append(rel_path)
                elif file.endswith('.js') and not file.endswith('.min.js'):
                    self.js_files.append(rel_path)
                elif file.endswith('.html'):
                    self.html_files.append(rel_path)
                
                # Check for specific config files
                if file == 'package.json':
                    self.package_json = rel_path
                elif file == 'requirements.txt':
                    self.requirements_txt = rel_path
                elif file == 'pyproject.toml':
                    self.pyproject_toml = rel_path
                elif file == 'poetry.lock':
                    self.poetry_lock = rel_path
                elif file == 'replit.nix':
                    self.replit_nix = rel_path
        
        logger.info(f"Found {len(self.python_files)} Python files, {len(self.js_files)} JavaScript files, and {len(self.html_files)} HTML files")
        
    def identify_framework(self):
        """Identify the web framework used in the application"""
        logger.info("🔍 Identifying web framework...")
        
        # Check package.json for Node.js projects
        if self.package_json:
            try:
                with open(self.package_json, 'r') as f:
                    package_data = json.load(f)
                    dependencies = package_data.get('dependencies', {})
                    
                    if 'react' in dependencies:
                        self.has_react = True
                        logger.info("Detected React framework")
                    
                    if dependencies:
                        self.has_nodejs = True
                        logger.info("Detected Node.js application")
            except json.JSONDecodeError:
                logger.error("Error parsing package.json file")
                self.issues.append("Invalid package.json file")
        
        # Check Python files for imports
        for py_file in self.python_files:
            try:
                with open(py_file, 'r') as f:
                    content = f.read()
                    
                    if re.search(r'import\s+flask|from\s+flask\s+import', content):
                        self.has_flask = True
                        logger.info("Detected Flask framework")
                    
                    if re.search(r'import\s+django|from\s+django\s+import', content):
                        self.has_django = True
                        logger.info("Detected Django framework")
                    
                    if re.search(r'import\s+fastapi|from\s+fastapi\s+import', content):
                        self.has_fastapi = True
                        logger.info("Detected FastAPI framework")
            except UnicodeDecodeError:
                # Skip binary files
                continue
                
    def check_for_common_issues(self):
        """Check for common issues that might prevent the application from running"""
        logger.info("🔍 Checking for common issues...")
        
        # Check for Python web server binding
        if self.has_flask or self.has_fastapi:
            host_port_pattern = re.compile(r'app\.run\(.*?host\s*=\s*[\'"](.+?)[\'"].*?port\s*=\s*(\d+)', re.DOTALL)
            only_port_pattern = re.compile(r'app\.run\(.*?port\s*=\s*(\d+)', re.DOTALL)
            
            has_proper_binding = False
            
            for py_file in self.python_files:
                try:
                    with open(py_file, 'r') as f:
                        content = f.read()
                        
                        host_port_match = host_port_pattern.search(content)
                        if host_port_match:
                            host = host_port_match.group(1)
                            if host != '0.0.0.0':
                                self.issues.append(f"Web server in {py_file} is not binding to 0.0.0.0 (using {host} instead)")
                            else:
                                has_proper_binding = True
                        
                        only_port_match = only_port_pattern.search(content)
                        if only_port_match and not host_port_match:
                            self.issues.append(f"Web server in {py_file} does not explicitly bind to 0.0.0.0")
                except UnicodeDecodeError:
                    continue
            
            if not has_proper_binding and (self.has_flask or self.has_fastapi):
                self.issues.append("No proper host binding found for web server (should bind to 0.0.0.0)")
        
        # Check for required files
        if not self.python_files and not self.js_files:
            self.issues.append("No Python or JavaScript files found")
        
        # Check if .replit file exists and has proper configuration
        replit_config_path = os.path.join(self.repl_directory, '.replit')
        if os.path.exists(replit_config_path):
            try:
                with open(replit_config_path, 'r') as f:
                    content = f.read()
                    if not re.search(r'run\s*=', content):
                        self.issues.append(".replit file exists but doesn't have a run command")
            except Exception as e:
                self.issues.append(f"Error reading .replit file: {str(e)}")
        else:
            self.issues.append("No .replit file found")
        
        # Check for main.py in root
        if 'main.py' not in self.root_files and self.python_files:
            potential_main_files = [f for f in self.root_files if f.endswith('.py')]
            if potential_main_files:
                self.issues.append(f"No main.py found, but other Python files exist: {', '.join(potential_main_files)}")
            else:
                self.issues.append("No main.py found in root directory")
        
        # Check for index.html if it seems to be a static site
        if not self.has_flask and not self.has_django and not self.has_fastapi and not self.has_nodejs:
            if self.html_files and not any(f.endswith('index.html') for f in self.html_files):
                self.issues.append("HTML files found but no index.html")
    
    def fix_issues(self):
        """Try to fix the identified issues"""
        logger.info("🔧 Attempting to fix issues...")
        
        # Fix 1: Create a .replit file if missing
        replit_config_path = os.path.join(self.repl_directory, '.replit')
        if not os.path.exists(replit_config_path):
            if self.python_files:
                main_file = 'main.py' if 'main.py' in self.root_files else self.python_files[0]
                with open(replit_config_path, 'w') as f:
                    f.write(f"""[interpreter]
run = [\"python\", \"{main_file}\"]

[env]
PYTHONPATH = \"${PYTHONPATH}:{self.repl_directory}\"

[nix]
channel = \"stable-21_11\"
""")
                self.fixes_applied.append(f"Created .replit file with run command for {main_file}")
                self.fixed_error = True
            elif self.has_nodejs:
                with open(replit_config_path, 'w') as f:
                    f.write("""[interpreter]
run = [\"npm\", \"start\"]

[nix]
channel = \"stable-21_11\"
""")
                self.fixes_applied.append("Created .replit file with npm start command")
                self.fixed_error = True
        
        # Fix 2: Create a main.py file if missing but Python files exist
        if 'main.py' not in self.root_files and self.python_files:
            # Create a minimal Flask app to serve the existing files
            if self.html_files:
                with open(os.path.join(self.repl_directory, 'main.py'), 'w') as f:
                    f.write("""from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__, 
            static_url_path='/static', 
            static_folder='static',
            template_folder='templates')

@app.route('/')
def index():
    # Check if index.html exists in templates
    if os.path.exists('templates/index.html'):
        return render_template('index.html')
    # Otherwise try to serve an index.html from the root directory
    elif os.path.exists('index.html'):
        return send_from_directory('.', 'index.html')
    # Fall back to a simple message
    return "<h1>Welcome to your app!</h1><p>Your application is running, but no index.html file was found.</p>"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
""")
                self.fixes_applied.append("Created a main.py file with Flask to serve your HTML content")
                self.fixed_error = True
                
                # Create templates and static directories if they don't exist
                os.makedirs('templates', exist_ok=True)
                os.makedirs('static', exist_ok=True)
                
                # If there's no index.html, create a minimal one in templates
                if not any(f.endswith('index.html') for f in self.html_files):
                    with open(os.path.join(self.repl_directory, 'templates', 'index.html'), 'w') as f:
                        f.write("""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Application</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body>
    <div class="container">
        <h1>Your Application is Running!</h1>
        <p>This is a template page created by the Replit Fixer. You can modify this file to create your own content.</p>
        <div class="status-box success">
            <p>✅ Application successfully started</p>
        </div>
    </div>
    <script src="{{ url_for('static', filename='js/script.js') }}"></script>
</body>
</html>""")
                    self.fixes_applied.append("Created a template index.html file")
                    
                    # Create CSS and JS directories and files
                    os.makedirs('static/css', exist_ok=True)
                    with open(os.path.join(self.repl_directory, 'static', 'css', 'style.css'), 'w') as f:
                        f.write("""body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    color: #333;
}

.container {
    width: 80%;
    margin: 0 auto;
    padding: 2rem;
}

h1 {
    color: #0066cc;
}

.status-box {
    padding: 1rem;
    border-radius: 5px;
    margin: 1rem 0;
}

.success {
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
}

.error {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
}""")
                    self.fixes_applied.append("Created a CSS file")
                    
                    os.makedirs('static/js', exist_ok=True)
                    with open(os.path.join(self.repl_directory, 'static', 'js', 'script.js'), 'w') as f:
                        f.write("""document.addEventListener('DOMContentLoaded', function() {
    console.log('Application is running properly!');
    
    // Add timestamp to show it's working
    const timestampElem = document.createElement('p');
    timestampElem.textContent = `Page loaded at: ${new Date().toLocaleTimeString()}`;
    document.querySelector('.status-box').appendChild(timestampElem);
});""")
                    self.fixes_applied.append("Created a JavaScript file")
                    self.fixed_error = True
        
        # Fix 3: Add requirements.txt if missing but Python files exist
        if not self.requirements_txt and self.python_files:
            with open(os.path.join(self.repl_directory, 'requirements.txt'), 'w') as f:
                requirements = ["flask==2.0.1"]
                if self.has_django:
                    requirements.append("django==3.2.7")
                if self.has_fastapi:
                    requirements.extend(["fastapi==0.68.0", "uvicorn==0.15.0"])
                f.write("\n".join(requirements))
            self.fixes_applied.append("Created a requirements.txt file with necessary dependencies")
            self.fixed_error = True
        
        # Fix 4: Fix host binding issues in Flask/FastAPI apps
        if self.has_flask or self.has_fastapi:
            for py_file in self.python_files:
                try:
                    with open(py_file, 'r') as f:
                        content = f.read()
                    
                    # Look for app.run() without proper host
                    if 'app.run(' in content:
                        host_pattern = re.compile(r'app\.run\(.*?host\s*=\s*[\'"](.+?)[\'"]', re.DOTALL)
                        host_match = host_pattern.search(content)
                        
                        if not host_match:
                            # No host parameter, add it
                            new_content = re.sub(
                                r'app\.run\((.*?)\)',
                                r'app.run(\1, host="0.0.0.0")',
                                content
                            )
                            with open(py_file, 'w') as f:
                                f.write(new_content)
                            self.fixes_applied.append(f"Updated {py_file} to bind to host 0.0.0.0")
                            self.fixed_error = True
                        elif host_match.group(1) != '0.0.0.0':
                            # Wrong host, fix it
                            new_content = re.sub(
                                r'host\s*=\s*[\'"](.+?)[\'"]',
                                r'host="0.0.0.0"',
                                content
                            )
                            with open(py_file, 'w') as f:
                                f.write(new_content)
                            self.fixes_applied.append(f"Updated {py_file} to bind to host 0.0.0.0 instead of {host_match.group(1)}")
                            self.fixed_error = True
                except UnicodeDecodeError:
                    continue
        
        return self.fixed_error
    
    def install_dependencies(self):
        """Install required dependencies"""
        logger.info("📦 Installing dependencies...")
        
        if self.requirements_txt:
            try:
                logger.info("Installing Python dependencies...")
                subprocess.run(["pip", "install", "-r", self.requirements_txt], check=True)
                logger.info("Python dependencies installed successfully")
            except subprocess.CalledProcessError as e:
                logger.error(f"Error installing Python dependencies: {str(e)}")
        
        if self.package_json:
            try:
                logger.info("Installing Node.js dependencies...")
                subprocess.run(["npm", "install"], check=True)
                logger.info("Node.js dependencies installed successfully")
            except subprocess.CalledProcessError as e:
                logger.error(f"Error installing Node.js dependencies: {str(e)}")
    
    def run_application(self):
        """Attempt to run the application"""
        logger.info("🚀 Attempting to run the application...")
        
        replit_config_path = os.path.join(self.repl_directory, '.replit')
        if os.path.exists(replit_config_path):
            try:
                with open(replit_config_path, 'r') as f:
                    content = f.read()
                    run_match = re.search(r'run\s*=\s*\[(.*?)\]', content)
                    if run_match:
                        run_command = run_match.group(1)
                        run_command = re.sub(r'["\'\s]', '', run_command)
                        run_parts = run_command.split(',')
                        
                        logger.info(f"Executing run command: {' '.join(run_parts)}")
                        process = subprocess.Popen(run_parts)
                        
                        # Wait a bit to see if it crashes immediately
                        time.sleep(2)
                        if process.poll() is not None:
                            logger.error(f"Process exited with code {process.returncode}")
                            return False
                        
                        logger.info("Application appears to be running...")
                        return True
            except Exception as e:
                logger.error(f"Error running application: {str(e)}")
                return False
        else:
            logger.error("No .replit file found, cannot determine run command")
            return False
    
    def run_diagnostics(self):
        """Run the full diagnostic process"""
        logger.info("🔍 Starting diagnostics...")
        
        self.scan_directory()
        self.identify_framework()
        self.check_for_common_issues()
        
        if self.issues:
            logger.info("⚠️ Issues found:")
            for issue in self.issues:
                logger.info(f"  - {issue}")
            
            fixed = self.fix_issues()
            if fixed:
                logger.info("✅ Applied fixes:")
                for fix in self.fixes_applied:
                    logger.info(f"  - {fix}")
                
                self.install_dependencies()
                success = self.run_application()
                
                if success:
                    logger.info("🎉 Application is now running! Refresh your Replit page to see it in action.")
                    return True
                else:
                    logger.error("⚠️ Application is still not running properly.")
                    return False
            else:
                logger.warning("⚠️ Couldn't apply automatic fixes. Manual intervention needed.")
                return False
        else:
            logger.info("✅ No issues found.")
            self.install_dependencies()
            success = self.run_application()
            
            if success:
                logger.info("🎉 Application is running fine!")
                return True
            else:
                logger.error("⚠️ Application is not running properly despite no obvious issues.")
                return False


if __name__ == "__main__":
    print("""
    ╭───────────────────────────────────────────╮
    │                                           │
    │        Replit Application Fixer           │
    │                                           │
    ╰───────────────────────────────────────────╯
    """)
    
    fixer = ReplitFixer()
    success = fixer.run_diagnostics()
    
    if success:
        print("""
        ╭───────────────────────────────────────────╮
        │                                           │
        │    🎉 Your application should now work!    │
        │                                           │
        ╰───────────────────────────────────────────╯
        """)
    else:
        print("""
        ╭───────────────────────────────────────────────────────────────────────────────╮
        │                                                                               │
        │  ⚠️  Some issues could not be automatically fixed                             │
        │                                                                               │
        │  Visit https://replit.com/help or check your logs for more details           │
        │                                                                               │
        ╰───────────────────────────────────────────────────────────────────────────────╯
        """)
