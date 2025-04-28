pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE = 'docker-compose'
        // This will be set in Jenkins credentials
        ABUSEIPDB_API_KEY = credentials('ABUSEIPDB_API_KEY')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                bat 'npm install'
                bat 'npm run build'
                
                // Create .env file with the API key
                bat '''
                    echo ABUSEIPDB_API_KEY=%ABUSEIPDB_API_KEY% > .env
                    echo ABUSEIPDB_API_KEY=%ABUSEIPDB_API_KEY% > backend/.env
                '''
            }
        }
        
        stage('Docker Compose') {
            steps {
                bat 'docker-compose down'
                bat 'docker-compose build --no-cache'
                bat 'docker-compose up -d'
            }
        }
    }
    
    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
} 