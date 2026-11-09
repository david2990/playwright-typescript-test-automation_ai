pipeline {
  // Plain Linux agent. Requires Node 20+, npm and the Chromium OS libraries.
  // Docker alternative (pin the tag to the @playwright/test version in package.json):
  //   agent { docker { image 'mcr.microsoft.com/playwright:v1.52.0-jammy'; args '-u pwuser --ipc=host' } }
  agent { label 'linux' }

  options {
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '10'))
    disableConcurrentBuilds()
    skipDefaultCheckout(true)
  }

  parameters {
    choice(
      name: 'BASE_URL',
      choices: ['https://demowebshop.tricentis.com'],
      description: 'Application under test'
    )
    string(
      name: 'TEST_CREDENTIALS_ID',
      defaultValue: 'demowebshop-test-user',
      description: 'Jenkins username/password credential holding TEST_USER and TEST_PASS'
    )
  }

  // Every two hours, at a load-balanced minute rather than exactly on the hour.
  triggers { cron('H */2 * * *') }

  environment {
    CI      = 'true'
    BASE_URL = "${params.BASE_URL}"
    WORKERS  = '4'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install dependencies') {
      steps { sh 'npm ci' }
    }

    stage('Install browsers') {
      steps {
        // Keep the browser cache between builds; re-downloads only on version bumps.
        sh 'npx playwright install chromium'
      }
    }

    stage('Static checks') {
      parallel {
        stage('Typecheck') {
          steps { sh 'npm run typecheck' }
        }
        stage('Lint') {
          steps { sh 'npm run lint' }
        }
      }
    }

    stage('Smoke tests') {
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: params.TEST_CREDENTIALS_ID,
            usernameVariable: 'TEST_USER',
            passwordVariable: 'TEST_PASS'
          )
        ]) {
          sh 'npm run test:smoke'
        }
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: 'results/junit.xml'
      publishHTML(target: [
        allowMissing: true,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'playwright-report',
        reportFiles: 'index.html',
        reportName: 'Playwright report'
      ])
      archiveArtifacts artifacts: 'results/**, test-results/**', allowEmptyArchive: true
      cleanWs()
    }
    failure {
      echo "Smoke pack FAILED - see ${env.BUILD_URL}playwright-report/ and the archived traces."
      // slackSend(color: 'danger', message: "SMOKE FAILED ${env.BUILD_URL}")
    }
    fixed {
      echo "Smoke pack is green again - ${env.BUILD_URL}"
      // slackSend(color: 'good', message: "SMOKE RECOVERED ${env.BUILD_URL}")
    }
  }
}
