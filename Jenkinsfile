pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
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
                checkout scm
            }
        }

        stage('Setup Node.js') {
            steps {
                nodejs(nodeJSInstallationName: 'NodeJS') {
                    sh 'node --version'
                    sh 'npm --version'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                // Deploy to Vercel (frontend)
                sh 'npm run deploy'
                
                // Deploy to Render (backend)
                // Note: This would typically be handled by Render's webhook
                // or you can use the Render CLI if available
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

                        // Step 4: Check and kill all processes using port 5050
                        echo 'Step 4: Checking for processes using port 5050...'
                        def portCheck = bat(returnStatus: true, script: 'netstat -ano | findstr :5050')
                        if (portCheck == 0) {
                            echo 'Found processes using port 5050, attempting to kill them...'
                            def processes = bat(returnStdout: true, script: 'netstat -ano | findstr :5050').trim().split('\n')
                            processes.each { process ->
                                def pid = process.trim().split()[-1]
                                echo "Killing process with PID ${pid}"
                                bat "taskkill /F /PID ${pid}"
                            }
                            echo 'All processes using port 5050 have been terminated'
                        }
                        
                        // Step 5: Verify port is free
                        echo 'Step 5: Verifying port 5050 is free...'
                        def verifyPort = bat(returnStatus: true, script: 'netstat -ano | findstr :5050')
                        if (verifyPort == 0) {
                            error 'Port 5050 is still in use after cleanup'
                        }
                        
                        // Step 6: Wait for ports to be released
                        echo 'Step 6: Waiting for ports to be released...'
                        bat 'ping -n 6 127.0.0.1 >nul'
                        
                        // Step 7: Start new containers
                        echo 'Step 7: Starting new containers...'
                        def upResult = bat(returnStatus: true, script: 'docker-compose -f docker-compose.staging.yml up -d')
                        if (upResult != 0) {
                            error "Failed to start containers: docker-compose up returned ${upResult}"
                        }
                        
                        // Step 8: Wait for services to be ready
                        echo 'Step 8: Waiting for services to be ready...'
                        bat 'ping -n 11 127.0.0.1 >nul'
                        
                        // Step 9: Verify services are running
                        echo 'Step 9: Verifying services...'
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