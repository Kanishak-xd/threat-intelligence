pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE = 'docker-compose'
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