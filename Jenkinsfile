pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'threat-intelligence'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = 'your-docker-registry' // Replace with your registry
    }

    // Specify the branch
    triggers {
        pollSCM('H/5 * * * *') // Poll SCM every 5 minutes
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/master']],
                    userRemoteConfigs: [[url: 'https://github.com/Kanishak-xd/threat-intelligence.git']]
                ])
                echo 'Checking out source code...'
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    echo 'Building frontend...'
                    bat 'docker build -t %DOCKER_IMAGE%-frontend:%DOCKER_TAG% .'
                }
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    echo 'Building backend...'
                    bat 'docker build -t %DOCKER_IMAGE%-backend:%DOCKER_TAG% -f backend/Dockerfile.backend ./backend'
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                script {
                    echo 'Deploying to staging environment...'
                    
                    // Stop and remove any existing containers
                    bat 'docker-compose -f docker-compose.staging.yml down --remove-orphans'
                    
                    // Force remove any containers that might be using the ports
                    bat '''
                        @echo off
                        for /f "tokens=*" %%a in ('docker ps -a --format "{{.Names}}" ^| findstr threat_intelligence') do (
                            docker rm -f %%a
                        )
                    '''
                    
                    // Remove any existing networks
                    bat 'docker network rm threat_intelligence_app-network 2>nul || echo Network does not exist'
                    
                    // Wait a moment to ensure ports are released
                    bat 'timeout /t 5'
                    
                    // Start new containers
                    bat 'docker-compose -f docker-compose.staging.yml up -d'
                    
                    // Wait for services to be ready
                    bat 'timeout /t 10'
                    
                    // Verify services are running
                    bat 'docker ps'
                }
            }
        }
    }

    post {
        always {
            // Clean up workspace
            cleanWs()
            echo 'Pipeline completed!'
        }
        success {
            echo 'Pipeline completed successfully!'
            // Add notification here if needed
        }
        failure {
            echo 'Pipeline failed!'
            // Add notification here if needed
        }
    }
} 