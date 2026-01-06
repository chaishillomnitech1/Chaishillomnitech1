# GitHub Actions Workflow Guidelines

## Overview

This document provides guidelines for creating and maintaining GitHub Actions workflows in this repository to ensure compliance with GitHub's best practices.

## Deprecated Commands - DO NOT USE

The following workflow commands are **deprecated** and should **NOT** be used:

### ❌ `::set-output` (Deprecated)
```yaml
# DO NOT USE THIS
- name: Set output
  run: echo "::set-output name=my_var::my_value"
```

### ❌ `::save-state` (Deprecated)
```yaml
# DO NOT USE THIS
- name: Save state
  run: echo "::save-state name=my_state::my_value"
```

### ❌ `::set-env` (Deprecated)
```yaml
# DO NOT USE THIS
- name: Set env
  run: echo "::set-env name=MY_VAR::my_value"
```

### ❌ `::add-path` (Deprecated)
```yaml
# DO NOT USE THIS
- name: Add to path
  run: echo "::add-path::/my/custom/path"
```

## Modern Approach - USE THESE

### ✅ Setting Job Outputs with `$GITHUB_OUTPUT`

**Bash/Shell:**
```yaml
- name: Set output
  id: my_step
  run: |
    echo "my_var=my_value" >> $GITHUB_OUTPUT
    echo "another_var=another_value" >> $GITHUB_OUTPUT

- name: Use output
  run: echo "The value is ${{ steps.my_step.outputs.my_var }}"
```

**Python:**
```python
import os

with open(os.environ['GITHUB_OUTPUT'], 'a') as f:
    f.write(f"my_var=my_value\n")
    f.write(f"another_var=another_value\n")
```

**Node.js:**
```javascript
const fs = require('fs');
const os = require('os');

fs.appendFileSync(
  process.env.GITHUB_OUTPUT,
  `my_var=my_value${os.EOL}another_var=another_value${os.EOL}`
);
```

### ✅ Setting Environment Variables with `$GITHUB_ENV`

**Bash/Shell:**
```yaml
- name: Set environment variable
  run: |
    echo "MY_VAR=my_value" >> $GITHUB_ENV
    echo "ANOTHER_VAR=another_value" >> $GITHUB_ENV

- name: Use environment variable
  run: echo "The value is $MY_VAR"
```

**Python:**
```python
import os

with open(os.environ['GITHUB_ENV'], 'a') as f:
    f.write(f"MY_VAR=my_value\n")
    f.write(f"ANOTHER_VAR=another_value\n")
```

### ✅ Adding to PATH with `$GITHUB_PATH`

```yaml
- name: Add to PATH
  run: echo "/my/custom/path" >> $GITHUB_PATH

- name: Verify path
  run: which my_command
```

### ✅ Creating Job Summaries with `$GITHUB_STEP_SUMMARY`

```yaml
- name: Create job summary
  run: |
    echo "## 📊 Job Summary" >> $GITHUB_STEP_SUMMARY
    echo "" >> $GITHUB_STEP_SUMMARY
    echo "**Status**: ✅ Success" >> $GITHUB_STEP_SUMMARY
    echo "**Duration**: 5 minutes" >> $GITHUB_STEP_SUMMARY
    echo "" >> $GITHUB_STEP_SUMMARY
    echo "### Details" >> $GITHUB_STEP_SUMMARY
    echo "- Item 1: Complete" >> $GITHUB_STEP_SUMMARY
    echo "- Item 2: Complete" >> $GITHUB_STEP_SUMMARY
```

## Multi-line Values

### For `$GITHUB_OUTPUT` with Multi-line Values

Use a delimiter approach:
```yaml
- name: Set multi-line output
  id: multi
  run: |
    delimiter="$(openssl rand -hex 8)"
    echo "content<<${delimiter}" >> $GITHUB_OUTPUT
    echo "Line 1" >> $GITHUB_OUTPUT
    echo "Line 2" >> $GITHUB_OUTPUT
    echo "Line 3" >> $GITHUB_OUTPUT
    echo "${delimiter}" >> $GITHUB_OUTPUT

- name: Use multi-line output
  run: echo "${{ steps.multi.outputs.content }}"
```

### For `$GITHUB_ENV` with Multi-line Values

```yaml
- name: Set multi-line environment variable
  run: |
    delimiter="$(openssl rand -hex 8)"
    echo "CONTENT<<${delimiter}" >> $GITHUB_ENV
    echo "Line 1" >> $GITHUB_ENV
    echo "Line 2" >> $GITHUB_ENV
    echo "Line 3" >> $GITHUB_ENV
    echo "${delimiter}" >> $GITHUB_ENV
```

## Best Practices

### 1. Always Use Append Mode

Use `>>` (append) not `>` (overwrite):
```bash
# ✅ Correct - Appends to the file
echo "var=value" >> $GITHUB_OUTPUT

# ❌ Wrong - Overwrites the file
echo "var=value" > $GITHUB_OUTPUT
```

### 2. Validate Before Using

Always validate environment variables before using them:
```yaml
- name: Validate output
  run: |
    if [ -z "${{ steps.my_step.outputs.my_var }}" ]; then
      echo "Error: Output not set"
      exit 1
    fi
```

### 3. Use Quotes for Values with Spaces

```bash
echo "message=Hello World" >> $GITHUB_OUTPUT
```

### 4. Escape Special Characters

Be careful with special characters in values:
```bash
# Escape newlines, quotes, etc.
value=$(echo "my value" | sed 's/"/\\"/g')
echo "my_var=$value" >> $GITHUB_OUTPUT
```

## Examples from This Repository

### Example 1: FlameNode Integration (Python)
```python
# From: .github/workflows/flamenode-integration.yml
import os

with open(os.environ['GITHUB_OUTPUT'], 'a') as f:
    f.write(f"flame_signature={flame_signature}\n")
    f.write(f"node_count={node_count}\n")
```

### Example 2: Temporal Node Scaling (Python)
```python
# From: .github/workflows/temporal-node-scaling.yml
import os

with open(os.environ['GITHUB_OUTPUT'], 'a') as f:
    f.write(f"temporal_hash={temporal_hash}\n")
    f.write(f"frequency_lock={frequency_lock}\n")
```

### Example 3: OMR-P Temporal Lock (Bash)
```bash
# From: .github/workflows/omr-p-temporal-lock.yml
echo "is_anchor=true" >> $GITHUB_OUTPUT
echo "timestamp=$current_timestamp" >> $GITHUB_OUTPUT
echo "harmony_score=$harmony_score" >> $GITHUB_OUTPUT
```

### Example 4: Nuxt.js Workflow (Bash)
```bash
# From: .github/workflows/nuxtjs.yml
if [ -f "${{ github.workspace }}/yarn.lock" ]; then
  echo "manager=yarn" >> $GITHUB_OUTPUT
  echo "command=install" >> $GITHUB_OUTPUT
else
  echo "manager=npm" >> $GITHUB_OUTPUT
  echo "command=ci" >> $GITHUB_OUTPUT
fi
```

## Automated Compliance Checking

This repository includes an automated workflow compliance checker:
- **Workflow**: `.github/workflows/workflow-compliance-check.yml`
- **Runs on**: PR changes to workflows, pushes to main, and monthly
- **Purpose**: Detects deprecated commands and ensures compliance

## Migration Guide

If you need to update a workflow using deprecated commands:

### Step 1: Identify Deprecated Commands
```bash
grep -rn "::set-output\|::save-state\|::set-env\|::add-path" .github/workflows/
```

### Step 2: Replace with Environment Files

**Before:**
```yaml
run: echo "::set-output name=version::1.0.0"
```

**After:**
```yaml
run: echo "version=1.0.0" >> $GITHUB_OUTPUT
```

### Step 3: Test the Workflow

- Create a test branch
- Make the changes
- Trigger the workflow manually or via PR
- Verify outputs are correctly set and used

### Step 4: Validate Compliance

Run the compliance checker:
```bash
# Local check
if grep -r "::set-output\|::save-state\|::set-env\|::add-path" .github/workflows/; then
    echo "ERROR: Deprecated commands found"
else
    echo "SUCCESS: No deprecated commands"
fi
```

## Common Patterns

### Pattern 1: Conditional Output Setting
```yaml
- name: Set output conditionally
  id: check
  run: |
    if [ "${{ github.event_name }}" = "push" ]; then
      echo "deploy=true" >> $GITHUB_OUTPUT
    else
      echo "deploy=false" >> $GITHUB_OUTPUT
    fi
```

### Pattern 2: Dynamic Variable Names
```bash
# Not directly supported - use a JSON object instead
echo "data={\"key1\":\"value1\",\"key2\":\"value2\"}" >> $GITHUB_OUTPUT
```

### Pattern 3: Numeric Values
```bash
# Numbers don't need quotes
echo "count=42" >> $GITHUB_OUTPUT
echo "percentage=3.14" >> $GITHUB_OUTPUT
```

## Troubleshooting

### Issue: Output not available in subsequent steps

**Cause**: Step doesn't have an `id`

**Solution**: Add an `id` to the step that sets the output:
```yaml
- name: Set output
  id: my_step  # Required!
  run: echo "var=value" >> $GITHUB_OUTPUT
```

### Issue: Multi-line output is truncated

**Cause**: Not using delimiter syntax

**Solution**: Use the delimiter approach shown above

### Issue: Special characters breaking the output

**Cause**: Unescaped special characters

**Solution**: Properly escape or encode values:
```bash
value=$(echo "$raw_value" | base64)
echo "encoded_value=$value" >> $GITHUB_OUTPUT
```

## References

- [GitHub Actions: Deprecating save-state and set-output commands](https://github.blog/changelog/2022-10-11-github-actions-deprecating-save-state-and-set-output-commands/)
- [Workflow commands for GitHub Actions](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions)
- [Environment Files](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#environment-files)
- [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

## Support

If you have questions about workflow compliance or need help migrating a workflow:

1. Review this guide and the compliance report
2. Check existing workflows in this repository for examples
3. Run the automated compliance checker
4. Consult the official GitHub Actions documentation

---

**Last Updated**: 2025-11-18  
**Maintained By**: Repository Maintainers
