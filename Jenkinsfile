pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    skipDefaultCheckout(true)
  }

  environment {
    APP_NAME = 'electifind'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
    DOCKER_IMAGE = "${APP_NAME}:${IMAGE_TAG}"
    PATH = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${env.PATH}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'node -v && npm -v'
        sh 'npm ci'
      }
    }

    stage('Run Tests') {
      steps {
        sh 'npm run test'
      }
    }

    stage('Build Frontend') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Build Docker Image') {
      when {
        expression {
          return sh(script: 'command -v docker >/dev/null 2>&1', returnStatus: true) == 0
        }
      }
      steps {
        sh 'docker --version'
        sh 'docker build -t "$DOCKER_IMAGE" .'
      }
    }

    stage('Push Docker Image (Optional)') {
      when {
        expression {
          return env.DOCKER_REGISTRY?.trim() && env.DOCKER_CREDENTIALS_ID?.trim()
        }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo "$DOCKER_PASS" | docker login "$DOCKER_REGISTRY" -u "$DOCKER_USER" --password-stdin
            docker tag "$DOCKER_IMAGE" "$DOCKER_REGISTRY/$DOCKER_IMAGE"
            docker push "$DOCKER_REGISTRY/$DOCKER_IMAGE"
          '''
        }
      }
    }

    stage('Trigger Deploy Hook (Optional)') {
      when {
        expression {
          return env.DEPLOY_HOOK_URL?.trim()
        }
      }
      steps {
        sh 'curl -fsS -X POST "$DEPLOY_HOOK_URL"'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true
    }
    success {
      echo 'Jenkins pipeline completed successfully.'
    }
    failure {
      echo 'Jenkins pipeline failed. Check stage logs for details.'
    }
  }
}