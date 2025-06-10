# GitHub Workflows

This directory contains GitHub Actions workflows for CI/CD, security, and automation.

## Workflows

### 🔄 CI (`ci.yml`)

**Triggers:** Pull requests and pushes to main

- **Testing:** Runs tests with coverage on Node.js 18.x and 20.x
- **Linting:** Checks code quality with ESLint
- **Formatting:** Validates Prettier formatting
- **Building:** Tests both standard and Cloudflare Pages builds
- **Coverage:** Uploads test coverage to Codecov

### 🔒 Security (`security.yml`)

**Triggers:** PRs, pushes to main, weekly schedule

- **Dependency Check:** npm audit for vulnerabilities
- **CodeQL Analysis:** Static code analysis for security issues
- **Secret Scanning:** TruffleHog for exposed secrets

### 🚀 Deploy (`deploy.yml`)

**Triggers:** Pushes to main, manual dispatch

- **Quality Gates:** Runs tests and linting before deploy
- **Cloudflare Pages:** Automated deployment
- **Health Checks:** Post-deployment verification

## Required Secrets

For the workflows to function properly, add these secrets in your GitHub repository settings:

### Deployment

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

### Optional

- `CODECOV_TOKEN`: For test coverage reporting (optional but recommended)

## Setup Instructions

1. **Enable GitHub Actions:** Ensure Actions are enabled in your repository settings
2. **Add Secrets:** Configure the required secrets mentioned above
3. **Cloudflare Configuration:** Already configured for:
   - Project: "Listen To More"
   - URL: https://listentomore.com

## Workflow Status

You can monitor workflow status in the "Actions" tab of your GitHub repository. Each workflow provides detailed logs and can be re-run if needed.

## Contributing

When creating pull requests:

- All CI checks must pass
- Follow the PR template
- Ensure code quality standards are met
