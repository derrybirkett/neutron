#!/bin/bash

# GitHub Repository Setup Script for Neutron IDE
# This script sets up branch protection and other repository settings

echo "🚀 Setting up GitHub repository: derrybirkett/neutron"

# Set the default repository
gh repo set-default derrybirkett/neutron

echo "📋 Setting up branch protection for 'main' branch..."
gh api repos/derrybirkett/neutron/branches/main/protection \
  -X PUT \
  --field required_status_checks='{"strict":true,"contexts":[]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
  --field restrictions=null

echo "📋 Setting up branch protection for 'develop' branch..."
gh api repos/derrybirkett/neutron/branches/develop/protection \
  -X PUT \
  --field required_status_checks='{"strict":true,"contexts":[]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
  --field restrictions=null

echo "🏷️ Adding topics to repository..."
gh api repos/derrybirkett/neutron \
  -X PATCH \
  --field topics='["electron","monaco-editor","ide","code-editor","javascript","nodejs","desktop-app","cross-platform"]'

echo "📝 Creating PR template..."
mkdir -p .github
cat > .github/pull_request_template.md << 'EOF'
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] Cross-platform testing (if applicable)

## Checklist
- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Documentation updated (if needed)
- [ ] Activity log updated

## Related Issues
Closes #(issue_number)
EOF

echo "✅ GitHub repository setup complete!"
echo ""
echo "📁 Repository: https://github.com/derrybirkett/neutron"
echo "🌿 Branches: main (protected), develop (protected)"
echo "📋 PR template created in .github/pull_request_template.md"
echo ""
echo "Next steps:"
echo "1. Review branch protection settings in GitHub web interface"
echo "2. Start creating feature branches from 'develop'"
echo "3. Follow the Git workflow documented in GIT_WORKFLOW.md"