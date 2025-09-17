# Git Workflow & Branching Best Practices

## Overview

This document outlines the Git workflow and branching strategy for Neutron IDE. We follow a modified Git Flow approach that balances simplicity with robust development practices.

## Repository Information

- **Repository**: [derrybirkett/neutron](https://github.com/derrybirkett/neutron)
- **Main Branch**: `main` (production-ready code)
- **Development Branch**: `develop` (integration branch for features)

## Branch Structure

### Main Branches

#### `main`
- **Purpose**: Production-ready code
- **Protection**: Protected branch, requires PR reviews
- **Deployment**: Automatically deployable
- **Direct Commits**: ❌ Never commit directly

#### `develop`
- **Purpose**: Integration branch for ongoing development
- **Protection**: Protected branch, requires PR reviews  
- **Source**: Feature branches merge here first
- **Direct Commits**: ❌ Never commit directly

### Supporting Branches

#### Feature Branches (`feature/`)
- **Naming**: `feature/feature-name` or `feature/issue-number-description`
- **Purpose**: New features or enhancements
- **Source**: Created from `develop`
- **Merge Target**: `develop` (via Pull Request)
- **Lifetime**: Deleted after merge

#### Hotfix Branches (`hotfix/`)
- **Naming**: `hotfix/issue-description` or `hotfix/version-number`
- **Purpose**: Critical production fixes
- **Source**: Created from `main`
- **Merge Target**: Both `main` and `develop`
- **Lifetime**: Deleted after merge

#### Release Branches (`release/`)
- **Naming**: `release/version-number` (e.g., `release/1.1.0`)
- **Purpose**: Prepare for production release
- **Source**: Created from `develop`
- **Merge Target**: Both `main` and `develop`
- **Lifetime**: Deleted after merge

## Workflow Commands

### Starting a New Feature

```bash
# Switch to develop and pull latest
git checkout develop
git pull origin develop

# Create and switch to feature branch
git checkout -b feature/my-new-feature

# Work on your feature (make commits)
git add .
git commit -m "feat: add new feature functionality"

# Push feature branch
git push -u origin feature/my-new-feature

# Create Pull Request via GitHub CLI
gh pr create --base develop --title "Add new feature" --body "Description of changes"
```

### Hotfix Workflow

```bash
# Switch to main and pull latest
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/fix-critical-issue

# Make your fix
git add .
git commit -m "fix: resolve critical production issue"

# Push hotfix branch
git push -u origin hotfix/fix-critical-issue

# Create PR to main
gh pr create --base main --title "Hotfix: Critical Issue" --body "Fix description"

# After merge to main, also merge to develop
git checkout develop
git pull origin main
```

### Release Workflow

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/1.1.0

# Update version numbers, documentation, etc.
git add .
git commit -m "chore: prepare release 1.1.0"

# Push release branch
git push -u origin release/1.1.0

# Create PR to main
gh pr create --base main --title "Release 1.1.0" --body "Release notes"

# After merge, tag the release
git checkout main
git pull origin main
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin v1.1.0
```

## Commit Message Standards

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect code meaning (white-space, formatting)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to build process or auxiliary tools

### Examples
```bash
feat(editor): add syntax highlighting for Python
fix(ui): resolve tab closing issue when multiple files open
docs: update README with installation instructions
chore(deps): update electron to version 28.0.0
```

## Pull Request Guidelines

### Creating PRs
1. **Target the correct base branch** (`develop` for features, `main` for hotfixes)
2. **Use descriptive titles** that summarize the change
3. **Fill out PR template** with detailed description
4. **Link related issues** using GitHub keywords (closes #123)
5. **Add labels** for categorization
6. **Request reviewers** if working in a team

### PR Template
```markdown
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
```

## Branch Protection Rules

### For `main` branch:
- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Restrict pushes that create files larger than 100MB
- Do not allow force pushes
- Do not allow deletions

### For `develop` branch:
- Require pull request reviews before merging
- Require status checks to pass before merging
- Allow administrators to bypass requirements (for urgent fixes)

## Daily Workflow

### Before Starting Work
```bash
git checkout develop
git pull origin develop
```

### During Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make small, focused commits
git add specific-files
git commit -m "feat: specific change description"

# Push regularly to backup work
git push -u origin feature/your-feature-name
```

### Finishing Work
```bash
# Ensure you're up to date
git checkout develop
git pull origin develop
git checkout feature/your-feature-name
git rebase develop  # Optional: keeps history clean

# Push final changes
git push origin feature/your-feature-name

# Create PR
gh pr create --base develop --title "Feature: Description" --body "Details"
```

## Common Git Commands Reference

### Branch Management
```bash
# List all branches
git branch -a

# Delete local branch
git branch -d feature/branch-name

# Delete remote branch
git push origin --delete feature/branch-name

# Rename current branch
git branch -m new-branch-name
```

### Sync & Update
```bash
# Fetch all remote branches
git fetch --all

# Sync fork (if applicable)
git fetch upstream
git checkout main
git merge upstream/main

# Clean up merged branches
git branch --merged | grep -v "main\|develop" | xargs -n 1 git branch -d
```

### Troubleshooting
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# View commit history
git log --oneline --graph --all

# Check repository status
git status
```

## Integration with GitHub CLI

### Setup
```bash
# Authenticate (if not done)
gh auth login

# Set default repository
gh repo set-default derrybirkett/neutron
```

### Common Operations
```bash
# Create PR
gh pr create --title "Title" --body "Description"

# List PRs
gh pr list

# Check out PR
gh pr checkout 123

# Merge PR
gh pr merge 123 --merge  # or --squash or --rebase

# Create release
gh release create v1.0.0 --title "Release 1.0.0" --notes "Release notes"
```

## Best Practices Summary

1. **Never commit directly to `main` or `develop`**
2. **Always create feature branches from `develop`**
3. **Use descriptive branch and commit messages**
4. **Keep commits small and focused**
5. **Test before pushing**
6. **Update documentation with code changes**
7. **Delete branches after merging**
8. **Use Pull Requests for all changes**
9. **Review code before merging**
10. **Keep branches up to date with target branch**

## Resources

- [Git Flow Cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [GitHub CLI Documentation](https://cli.github.com/manual/)