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

        stage('Test') {
            steps {
                script {
                    echo 'Running tests...'
                    // Run tests in a temporary container
                    bat '''
                        docker run --rm -v "%WORKSPACE%:/app" -w /app node:18-alpine sh -c "npm install && npm test"
                    '''
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                script {
                    echo 'Deploying to staging environment...'
                    // Push images to registry if needed
                    // bat 'docker push %DOCKER_REGISTRY%/%DOCKER_IMAGE%-frontend:%DOCKER_TAG%'
                    // bat 'docker push %DOCKER_REGISTRY%/%DOCKER_IMAGE%-backend:%DOCKER_TAG%'
                    
                    // Deploy using docker-compose
                    bat 'docker-compose -f docker-compose.staging.yml up -d'
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