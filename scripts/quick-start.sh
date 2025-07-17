#!/bin/bash

# MustMe Firebase Emulator Quick Start Setup Script
# Supports macOS, Linux, and Windows (via Git Bash)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Emoji support (fallback for systems without emoji)
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$TERM" == *"xterm"* ]]; then
    CHECKMARK="✅"
    CROSSMARK="❌"
    ROCKET="🚀"
    GEAR="⚙️"
    FIRE="🔥"
    WARNING="⚠️"
    INFO="ℹ️"
    PACKAGE="📦"
else
    CHECKMARK="[✓]"
    CROSSMARK="[✗]"
    ROCKET="[>]"
    GEAR="[*]"
    FIRE="[F]"
    WARNING="[!]"
    INFO="[i]"
    PACKAGE="[P]"
fi

# Progress tracking
STEP=0
TOTAL_STEPS=10

print_header() {
    echo ""
    echo -e "${PURPLE}${BOLD}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}${BOLD}║                        ${WHITE}MustMe Firebase Emulator Setup${PURPLE}                         ║${NC}"
    echo -e "${PURPLE}${BOLD}║                     ${WHITE}Quick Start Script v1.0${PURPLE}                              ║${NC}"
    echo -e "${PURPLE}${BOLD}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    ((STEP++))
    echo -e "${CYAN}${BOLD}[$STEP/$TOTAL_STEPS] $1${NC}"
    echo -e "${WHITE}────────────────────────────────────────────────────────────────────────────────${NC}"
}

print_success() {
    echo -e "${GREEN}${CHECKMARK} $1${NC}"
}

print_error() {
    echo -e "${RED}${CROSSMARK} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

print_info() {
    echo -e "${BLUE}${INFO} $1${NC}"
}

print_action() {
    echo -e "${WHITE}${GEAR} $1${NC}"
}

# Detect operating system
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    print_info "Detected OS: $OS"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d 'v' -f 2)
        REQUIRED_VERSION="16.0.0"
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Node.js $NODE_VERSION is installed"
            return 0
        else
            print_error "Node.js version $NODE_VERSION is too old. Required: $REQUIRED_VERSION or higher"
            return 1
        fi
    else
        print_error "Node.js is not installed"
        return 1
    fi
}

# Check Java version
check_java_version() {
    if command_exists java; then
        JAVA_VERSION=$(java -version 2>&1 | head -n1 | cut -d'"' -f2 | cut -d'.' -f1-2)
        if [[ "$JAVA_VERSION" == "1.8" ]] || [[ "${JAVA_VERSION%%.*}" -ge 8 ]]; then
            print_success "Java $JAVA_VERSION is installed"
            return 0
        else
            print_error "Java version $JAVA_VERSION is too old. Required: Java 8 or higher"
            return 1
        fi
    else
        print_error "Java is not installed"
        return 1
    fi
}

# Install Node.js based on OS
install_nodejs() {
    print_action "Installing Node.js..."
    case $OS in
        "macos")
            if command_exists brew; then
                brew install node
            else
                print_error "Homebrew not found. Please install Node.js manually: https://nodejs.org"
                return 1
            fi
            ;;
        "linux")
            if command_exists apt-get; then
                sudo apt-get update
                sudo apt-get install -y nodejs npm
            elif command_exists yum; then
                sudo yum install -y nodejs npm
            elif command_exists dnf; then
                sudo dnf install -y nodejs npm
            else
                print_error "Package manager not found. Please install Node.js manually: https://nodejs.org"
                return 1
            fi
            ;;
        "windows")
            print_error "Please install Node.js manually from https://nodejs.org"
            print_info "Download the Windows installer and run it"
            return 1
            ;;
        *)
            print_error "Unsupported OS. Please install Node.js manually: https://nodejs.org"
            return 1
            ;;
    esac
}

# Install Java based on OS
install_java() {
    print_action "Installing Java..."
    case $OS in
        "macos")
            if command_exists brew; then
                brew install openjdk@11
            else
                print_error "Homebrew not found. Please install Java manually"
                return 1
            fi
            ;;
        "linux")
            if command_exists apt-get; then
                sudo apt-get install -y openjdk-11-jdk
            elif command_exists yum; then
                sudo yum install -y java-11-openjdk
            elif command_exists dnf; then
                sudo dnf install -y java-11-openjdk
            else
                print_error "Package manager not found. Please install Java manually"
                return 1
            fi
            ;;
        "windows")
            print_error "Please install Java manually from https://adoptium.net/"
            print_info "Download the Windows installer and run it"
            return 1
            ;;
        *)
            print_error "Unsupported OS. Please install Java manually"
            return 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    print_step "${GEAR} Checking Prerequisites"
    
    detect_os
    
    local missing_deps=0
    
    # Check Node.js
    if ! check_node_version; then
        print_warning "Attempting to install Node.js..."
        if ! install_nodejs; then
            ((missing_deps++))
        fi
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed"
        ((missing_deps++))
    else
        NPM_VERSION=$(npm --version)
        print_success "npm $NPM_VERSION is installed"
    fi
    
    # Check Java
    if ! check_java_version; then
        print_warning "Attempting to install Java..."
        if ! install_java; then
            ((missing_deps++))
        fi
    fi
    
    if [ $missing_deps -gt 0 ]; then
        print_error "Missing dependencies detected. Please install them manually and run this script again."
        echo ""
        print_info "Installation guides:"
        print_info "• Node.js: https://nodejs.org/"
        print_info "• Java: https://adoptium.net/"
        exit 1
    fi
    
    print_success "All prerequisites are satisfied!"
}

# Install Firebase CLI
install_firebase_cli() {
    print_step "${PACKAGE} Installing Firebase CLI"
    
    if command_exists firebase; then
        FIREBASE_VERSION=$(firebase --version | head -n1)
        print_success "Firebase CLI is already installed: $FIREBASE_VERSION"
    else
        print_action "Installing Firebase CLI globally..."
        npm install -g firebase-tools
        print_success "Firebase CLI installed successfully!"
    fi
}

# Install project dependencies
install_project_dependencies() {
    print_step "${PACKAGE} Installing Project Dependencies"
    
    if [ -f "package.json" ]; then
        print_action "Installing npm dependencies..."
        npm install
        print_success "Project dependencies installed!"
    else
        print_warning "No package.json found. Creating basic Next.js project structure..."
        
        # Create basic structure if it doesn't exist
        mkdir -p src/lib src/components/ui
        
        # Create a basic package.json if it doesn't exist
        cat > package.json << 'EOF'
{
  "name": "mustme-firebase-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "emulators": "firebase emulators:start"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "firebase": "^10.0.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18"
  }
}
EOF
        npm install
        print_success "Basic project structure created and dependencies installed!"
    fi
}

# Setup environment variables
setup_environment() {
    print_step "${GEAR} Setting Up Environment Variables"
    
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            print_action "Copying .env.example to .env.local..."
            cp .env.example .env.local
        else
            print_action "Creating .env.local file..."
            cat > .env.local << 'EOF'
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdefghijklmnop

# Firebase Emulator Settings
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

# Development
NODE_ENV=development
EOF
        fi
        print_success "Environment file created!"
    else
        print_success "Environment file already exists!"
    fi
    
    print_info "Please update .env.local with your actual Firebase configuration if needed"
}

# Initialize Firebase project
initialize_firebase() {
    print_step "${FIRE} Initializing Firebase Project"
    
    if [ -f "firebase.json" ]; then
        print_success "Firebase project already initialized!"
        return 0
    fi
    
    print_action "Initializing Firebase project..."
    
    # Check if user is logged in
    if ! firebase projects:list >/dev/null 2>&1; then
        print_action "Logging into Firebase..."
        firebase login --no-localhost
    fi
    
    # Initialize Firebase with emulators
    print_action "Setting up Firebase configuration..."
    firebase init emulators --only auth,firestore,storage
    
    # Create or update firebase.json with proper emulator configuration
    cat > firebase.json << 'EOF'
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    },
    "singleProjectMode": true
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
EOF
    
    # Create basic firestore rules
    cat > firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access on all documents to any user signed in to the application
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
EOF
    
    # Create basic storage rules
    cat > storage.rules << 'EOF'
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
EOF
    
    # Create empty firestore indexes file
    echo '{"indexes":[],"fieldOverrides":[]}' > firestore.indexes.json
    
    print_success "Firebase project initialized!"
}

# Start Firebase emulators
start_emulators() {
    print_step "${ROCKET} Starting Firebase Emulators"
    
    print_action "Starting Firebase Emulator Suite..."
    print_info "This will start the Auth, Firestore, and Storage emulators"
    print_info "The Emulator UI will be available at http://localhost:4000"
    
    # Check if emulators are already running
    if curl -s http://localhost:4000 >/dev/null 2>&1; then
        print_warning "Emulators appear to be already running!"
        print_info "Visit http://localhost:4000 to access the Emulator UI"
    else
        print_action "Launching emulators in the background..."
        firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data &
        FIREBASE_PID=$!
        
        # Wait for emulators to start
        print_action "Waiting for emulators to start..."
        for i in {1..30}; do
            if curl -s http://localhost:4000 >/dev/null 2>&1; then
                print_success "Emulators started successfully!"
                break
            fi
            echo -n "."
            sleep 2
        done
        
        if ! curl -s http://localhost:4000 >/dev/null 2>&1; then
            print_error "Emulators failed to start within 60 seconds"
            return 1
        fi
    fi
}

# Validate setup
validate_setup() {
    print_step "${CHECKMARK} Validating Setup"
    
    local validation_errors=0
    
    # Check if emulators are running
    if curl -s http://localhost:4000 >/dev/null 2>&1; then
        print_success "Firebase Emulator UI is accessible"
    else
        print_error "Firebase Emulator UI is not accessible"
        ((validation_errors++))
    fi
    
    if curl -s http://localhost:9099 >/dev/null 2>&1; then
        print_success "Firebase Auth Emulator is running"
    else
        print_error "Firebase Auth Emulator is not running"
        ((validation_errors++))
    fi
    
    if curl -s http://localhost:8080 >/dev/null 2>&1; then
        print_success "Firestore Emulator is running"
    else
        print_error "Firestore Emulator is not running"
        ((validation_errors++))
    fi
    
    if curl -s http://localhost:9199 >/dev/null 2>&1; then
        print_success "Storage Emulator is running"
    else
        print_error "Storage Emulator is not running"
        ((validation_errors++))
    fi
    
    # Check project files
    if [ -f "firebase.json" ]; then
        print_success "firebase.json exists"
    else
        print_error "firebase.json is missing"
        ((validation_errors++))
    fi
    
    if [ -f ".env.local" ]; then
        print_success ".env.local exists"
    else
        print_error ".env.local is missing"
        ((validation_errors++))
    fi
    
    if [ $validation_errors -gt 0 ]; then
        print_error "Setup validation failed with $validation_errors errors"
        return 1
    else
        print_success "All validation checks passed!"
        return 0
    fi
}

# Provide next steps
provide_instructions() {
    print_step "${INFO} Next Steps & Instructions"
    
    echo ""
    echo -e "${GREEN}${BOLD}${ROCKET} Setup Complete! Your Firebase Emulator Suite is ready!${NC}"
    echo ""
    
    echo -e "${CYAN}${BOLD}Access Points:${NC}"
    echo -e "${WHITE}• Firebase Emulator UI: ${BLUE}http://localhost:4000${NC}"
    echo -e "${WHITE}• Auth Emulator: ${BLUE}http://localhost:9099${NC}"
    echo -e "${WHITE}• Firestore Emulator: ${BLUE}http://localhost:8080${NC}"
    echo -e "${WHITE}• Storage Emulator: ${BLUE}http://localhost:9199${NC}"
    echo ""
    
    echo -e "${CYAN}${BOLD}Next Steps:${NC}"
    echo -e "${WHITE}1. ${GREEN}Start your Next.js development server:${NC}"
    echo -e "   ${YELLOW}npm run dev${NC}"
    echo ""
    echo -e "${WHITE}2. ${GREEN}Configure your Firebase app in your code:${NC}"
    echo -e "   ${YELLOW}• Update .env.local with your Firebase config${NC}"
    echo -e "   ${YELLOW}• Import Firebase SDK in your components${NC}"
    echo -e "   ${YELLOW}• Connect to emulators in development${NC}"
    echo ""
    echo -e "${WHITE}3. ${GREEN}Test authentication in the Emulator UI:${NC}"
    echo -e "   ${YELLOW}• Create test users${NC}"
    echo -e "   ${YELLOW}• Test sign-in/sign-out flows${NC}"
    echo -e "   ${YELLOW}• View Firestore data${NC}"
    echo ""
    
    echo -e "${CYAN}${BOLD}Useful Commands:${NC}"
    echo -e "${WHITE}• Start emulators: ${YELLOW}firebase emulators:start${NC}"
    echo -e "${WHITE}• Stop emulators: ${YELLOW}Ctrl+C in this terminal${NC}"
    echo -e "${WHITE}• Reset emulator data: ${YELLOW}firebase emulators:start --import=./emulator-data${NC}"
    echo -e "${WHITE}• View Firebase projects: ${YELLOW}firebase projects:list${NC}"
    echo ""
    
    echo -e "${CYAN}${BOLD}Documentation:${NC}"
    echo -e "${WHITE}• Firebase Emulator Suite: ${BLUE}https://firebase.google.com/docs/emulator-suite${NC}"
    echo -e "${WHITE}• Firebase Auth: ${BLUE}https://firebase.google.com/docs/auth${NC}"
    echo -e "${WHITE}• Firestore: ${BLUE}https://firebase.google.com/docs/firestore${NC}"
    echo ""
    
    echo -e "${PURPLE}${BOLD}Happy coding! ${FIRE}${NC}"
}

# Error handling
handle_error() {
    print_error "Setup failed at step $STEP"
    echo ""
    print_info "Common solutions:"
    print_info "• Make sure you have a stable internet connection"
    print_info "• Check that ports 4000, 8080, 9099, and 9199 are not in use"
    print_info "• Ensure you have sufficient disk space"
    print_info "• Try running the script with sudo if you encounter permission errors"
    echo ""
    print_info "For help, visit: https://firebase.google.com/docs/emulator-suite"
    exit 1
}

# Cleanup function
cleanup() {
    if [ ! -z "$FIREBASE_PID" ]; then
        print_info "Cleaning up background processes..."
        kill $FIREBASE_PID >/dev/null 2>&1 || true
    fi
}

# Set up error handling and cleanup
trap handle_error ERR
trap cleanup EXIT

# Main execution
main() {
    print_header
    
    check_prerequisites
    install_firebase_cli
    install_project_dependencies
    setup_environment
    initialize_firebase
    start_emulators
    validate_setup
    provide_instructions
    
    echo ""
    print_success "MustMe Firebase Emulator setup completed successfully!"
    echo ""
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi