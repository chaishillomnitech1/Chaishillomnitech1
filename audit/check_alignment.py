#!/usr/bin/env python3
"""
OmniTech1 Alignment Audit Script
ScrollVerse Genesis Protocol - Governance Alignment Check

This script audits the repository for alignment with OmniTech1 governance
standards, verifying configuration, security settings, and documentation.
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import List, Dict, Any

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class AlignmentAudit:
    """OmniTech1 governance alignment auditor."""

    def __init__(self, repo_root: str = '.'):
        """
        Initialize the auditor.

        Args:
            repo_root: Path to the repository root
        """
        self.repo_root = Path(repo_root)
        self.findings: List[Dict[str, Any]] = []
        self.passed = 0
        self.failed = 0
        self.warnings = 0

    def add_finding(self, check: str, status: str, message: str) -> None:
        """Add an audit finding."""
        self.findings.append({
            'check': check,
            'status': status,
            'message': message
        })

        if status == 'PASS':
            self.passed += 1
        elif status == 'FAIL':
            self.failed += 1
        else:
            self.warnings += 1

    def check_env_example(self) -> None:
        """Check that .env.example exists and documents required variables."""
        env_example = self.repo_root / '.env.example'

        if not env_example.exists():
            self.add_finding(
                'env_example',
                'FAIL',
                '.env.example file is missing'
            )
            return

        content = env_example.read_text()

        required_vars = [
            'GITHUB_WEBHOOK_SECRET',
            'ADMIN_TOKEN',
            'JWT_SECRET',
            'NEO4J_URI',
            'NEO4J_USER',
            'NEO4J_PASSWORD'
        ]

        missing = []
        for var in required_vars:
            if var not in content:
                missing.append(var)

        if missing:
            self.add_finding(
                'env_example',
                'WARN',
                f'.env.example missing documentation for: {", ".join(missing)}'
            )
        else:
            self.add_finding(
                'env_example',
                'PASS',
                'All required environment variables documented'
            )

    def check_no_hardcoded_secrets(self) -> None:
        """Check that no secrets are hardcoded in source files."""
        secret_patterns = [
            'PRIVATE_KEY=',
            'API_KEY=',
            'password=',
            'secret=',
        ]

        source_extensions = ['.py', '.js', '.ts', '.sol']
        exclude_patterns = ['.env.example', 'test_', '_test.', '.test.']

        violations = []

        for ext in source_extensions:
            for source_file in self.repo_root.rglob(f'*{ext}'):
                # Skip node_modules and test files
                if 'node_modules' in str(source_file):
                    continue
                if any(p in source_file.name for p in exclude_patterns):
                    continue

                try:
                    content = source_file.read_text()
                    for pattern in secret_patterns:
                        if pattern.lower() in content.lower():
                            # Check if it's an env variable reference
                            if f"os.environ.get('{pattern.rstrip('=')}')" not in content:
                                if f"process.env.{pattern.rstrip('=')}" not in content:
                                    # Could be a false positive, mark as warning
                                    violations.append(f"{source_file}: potential {pattern}")
                except Exception:
                    pass

        if violations:
            self.add_finding(
                'hardcoded_secrets',
                'WARN',
                f'Potential hardcoded secrets found in: {len(violations)} locations'
            )
        else:
            self.add_finding(
                'hardcoded_secrets',
                'PASS',
                'No hardcoded secrets detected'
            )

    def check_gitignore(self) -> None:
        """Check that .gitignore properly excludes sensitive files."""
        gitignore = self.repo_root / '.gitignore'

        if not gitignore.exists():
            self.add_finding(
                'gitignore',
                'FAIL',
                '.gitignore file is missing'
            )
            return

        content = gitignore.read_text()

        required_patterns = ['.env', 'node_modules/', '*.log']
        missing = [p for p in required_patterns if p not in content]

        if missing:
            self.add_finding(
                'gitignore',
                'WARN',
                f'.gitignore missing patterns: {", ".join(missing)}'
            )
        else:
            self.add_finding(
                'gitignore',
                'PASS',
                '.gitignore properly configured'
            )

    def check_security_docs(self) -> None:
        """Check that SECURITY.md exists."""
        security_md = self.repo_root / 'SECURITY.md'

        if security_md.exists():
            self.add_finding(
                'security_docs',
                'PASS',
                'SECURITY.md exists'
            )
        else:
            self.add_finding(
                'security_docs',
                'WARN',
                'SECURITY.md not found - consider adding security documentation'
            )

    def check_deployment_docs(self) -> None:
        """Check that deployment documentation exists."""
        deployment_docs = [
            'DEPLOYMENT.md',
            'DEPLOYMENT_README.md',
            'deployment/README.md'
        ]

        found = False
        for doc in deployment_docs:
            if (self.repo_root / doc).exists():
                found = True
                break

        if found:
            self.add_finding(
                'deployment_docs',
                'PASS',
                'Deployment documentation found'
            )
        else:
            self.add_finding(
                'deployment_docs',
                'WARN',
                'No deployment documentation found'
            )

    def check_dockerfile(self) -> None:
        """Check that Dockerfile exists and follows best practices."""
        dockerfile = self.repo_root / 'Dockerfile'

        if not dockerfile.exists():
            self.add_finding(
                'dockerfile',
                'WARN',
                'Dockerfile not found'
            )
            return

        content = dockerfile.read_text()

        # Check for best practices
        issues = []

        if 'USER root' in content or 'USER 0' in content:
            issues.append('Runs as root user')

        if 'COPY . .' in content and '.dockerignore' not in os.listdir(self.repo_root):
            issues.append('COPY . . without .dockerignore')

        if issues:
            self.add_finding(
                'dockerfile',
                'WARN',
                f'Dockerfile issues: {", ".join(issues)}'
            )
        else:
            self.add_finding(
                'dockerfile',
                'PASS',
                'Dockerfile follows best practices'
            )

    def check_ci_workflows(self) -> None:
        """Check that CI/CD workflows exist."""
        workflows_dir = self.repo_root / '.github' / 'workflows'

        if not workflows_dir.exists():
            self.add_finding(
                'ci_workflows',
                'FAIL',
                'No GitHub Actions workflows found'
            )
            return

        workflows = list(workflows_dir.glob('*.yml')) + list(workflows_dir.glob('*.yaml'))

        if len(workflows) == 0:
            self.add_finding(
                'ci_workflows',
                'FAIL',
                'No workflow files found'
            )
        else:
            self.add_finding(
                'ci_workflows',
                'PASS',
                f'Found {len(workflows)} workflow files'
            )

    def run_audit(self) -> bool:
        """
        Run all audit checks.

        Returns:
            True if all critical checks pass, False otherwise
        """
        logger.info("Starting OmniTech1 Alignment Audit")
        logger.info("=" * 60)

        self.check_env_example()
        self.check_no_hardcoded_secrets()
        self.check_gitignore()
        self.check_security_docs()
        self.check_deployment_docs()
        self.check_dockerfile()
        self.check_ci_workflows()

        # Print results
        logger.info("")
        logger.info("=" * 60)
        logger.info("AUDIT RESULTS")
        logger.info("=" * 60)

        for finding in self.findings:
            status_icon = {
                'PASS': '✅',
                'WARN': '⚠️',
                'FAIL': '❌'
            }.get(finding['status'], '?')

            logger.info(f"{status_icon} [{finding['status']}] {finding['check']}: {finding['message']}")

        logger.info("")
        logger.info(f"Total: {self.passed} passed, {self.warnings} warnings, {self.failed} failed")

        return self.failed == 0


def main():
    """Main entry point."""
    repo_root = os.environ.get('REPO_ROOT', '.')

    auditor = AlignmentAudit(repo_root)
    success = auditor.run_audit()

    # Output JSON for CI integration
    if os.environ.get('OUTPUT_JSON'):
        result = {
            'passed': auditor.passed,
            'warnings': auditor.warnings,
            'failed': auditor.failed,
            'findings': auditor.findings,
            'success': success
        }
        print(json.dumps(result, indent=2))

    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
