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
                    userRemoteConfigs: [[url: 'YOUR_REPOSITORY_URL']]
                ])
                echo 'Checking out source code...'
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    echo 'Building frontend...'
                    sh 'docker build -t ${DOCKER_IMAGE}-frontend:${DOCKER_TAG} .'
                }
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    echo 'Building backend...'
                    sh 'docker build -t ${DOCKER_IMAGE}-backend:${DOCKER_TAG} -f backend/Dockerfile.backend ./backend'
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    echo 'Running tests...'
                    sh 'npm test'
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                script {
                    echo 'Deploying to staging environment...'
                    // Push images to registry if needed
                    // sh 'docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}-frontend:${DOCKER_TAG}'
                    // sh 'docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}-backend:${DOCKER_TAG}'
                    
                    // Deploy using docker-compose
                    sh 'docker-compose -f docker-compose.staging.yml up -d'
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