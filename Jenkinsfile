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
                    try {
                        echo 'Starting deployment to staging environment...'
                        
                        // Step 1: Stop and remove existing containers
                        echo 'Step 1: Stopping existing containers...'
                        def downResult = bat(returnStatus: true, script: 'docker-compose -f docker-compose.staging.yml down --remove-orphans')
                        if (downResult != 0) {
                            echo "Warning: docker-compose down returned ${downResult}"
                        }
                        
                        // Step 2: Force remove containers
                        echo 'Step 2: Force removing containers...'
                        def rmResult = bat(returnStatus: true, script: 'docker rm -f threat_intelligence-frontend-1 threat_intelligence-backend-1 2>nul')
                        if (rmResult != 0) {
                            echo "Warning: docker rm returned ${rmResult}"
                        }
                        
                        // Step 3: Remove network
                        echo 'Step 3: Removing network...'
                        def networkResult = bat(returnStatus: true, script: 'docker network rm threat_intelligence_app-network 2>nul')
                        if (networkResult != 0) {
                            echo "Warning: docker network rm returned ${networkResult}"
                        }
                        
                        // Step 4: Wait for ports to be released
                        echo 'Step 4: Waiting for ports to be released...'
                        bat 'ping -n 6 127.0.0.1 >nul'
                        
                        // Step 5: Start new containers
                        echo 'Step 5: Starting new containers...'
                        def upResult = bat(returnStatus: true, script: 'docker-compose -f docker-compose.staging.yml up -d')
                        if (upResult != 0) {
                            error "Failed to start containers: docker-compose up returned ${upResult}"
                        }
                        
                        // Step 6: Wait for services to be ready
                        echo 'Step 6: Waiting for services to be ready...'
                        bat 'ping -n 11 127.0.0.1 >nul'
                        
                        // Step 7: Verify services are running
                        echo 'Step 7: Verifying services...'
                        bat 'docker ps'
                        
                        echo 'Deployment completed successfully!'
                    } catch (Exception e) {
                        echo "Deployment failed: ${e.message}"
                        currentBuild.result = 'FAILURE'
                        throw e
                    }
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