# 🚀 Quick Start: S3 Immutable Archive

This guide will help you set up and test the S3 Immutable Archive solution in minutes.

## Prerequisites

- AWS Account
- Python 3.7+ or Node.js 14+ (depending on your preference)
- AWS CLI (optional but recommended)

## Step 1: Set Up AWS Credentials

### Option A: Environment Variables

```bash
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_REGION="us-east-1"
```

### Option B: AWS CLI Profile

```bash
aws configure
# Follow prompts to enter credentials
```

## Step 2: Install Dependencies

### For Python

```bash
pip install boto3 python-dotenv
```

### For JavaScript/Node.js

```bash
npm install aws-sdk dotenv
# or
yarn add aws-sdk dotenv
```

### For Terraform

```bash
# Install Terraform (if not already installed)
# Visit: https://www.terraform.io/downloads

# Or use package manager:
# macOS
brew install terraform

# Linux
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
```

## Step 3: Choose Your Path

### Path A: Quick Test with Python

```bash
# 1. Copy the template
cp code-templates/python/S3ImmutableArchive_Template.py test_archive.py

# 2. Create a test file
echo "Test data for eternal archive" > test_data.txt

# 3. Set bucket name (or use default)
export S3_ARCHIVE_BUCKET_NAME="my-test-archive-$(date +%s)"

# 4. Run the script
python test_archive.py
```

### Path B: Quick Test with JavaScript

```bash
# 1. Copy the template
cp code-templates/javascript/S3ImmutableArchive_Template.js test_archive.js

# 2. Create a test file
echo "Test data for eternal archive" > test_data.txt

# 3. Set bucket name (or use default)
export S3_ARCHIVE_BUCKET_NAME="my-test-archive-$(date +%s)"

# 4. Run the script
node test_archive.js
```

### Path C: Production Deployment with Terraform

```bash
# 1. Navigate to terraform directory
cd code-templates/terraform

# 2. Copy and configure environment
cp .env.example .env
nano .env  # Edit with your settings

# 3. Initialize Terraform
terraform init

# 4. Review the plan
terraform plan

# 5. Apply (create infrastructure)
terraform apply

# 6. Save outputs
terraform output > deployment-info.txt

# 7. Test with Python or JavaScript
cd ..
python python/S3ImmutableArchive_Template.py
```

## Step 4: Verify the Archive

### Using AWS CLI

```bash
# List buckets
aws s3 ls

# Check bucket configuration
aws s3api get-object-lock-configuration \
  --bucket your-bucket-name

# List archived files
aws s3 ls s3://your-bucket-name/eternal-archives/
```

### Using Python

```python
from test_archive import S3ImmutableArchive

archive = S3ImmutableArchive()

# List files
files = archive.list_archived_files()
print(f"Total files: {len(files)}")

# Generate report
report = archive.generate_archive_report()
print(f"Total size: {report['statistics']['total_size_mb']} MB")
```

### Using JavaScript

```javascript
const { S3ImmutableArchive } = require('./test_archive');

(async () => {
  const archive = new S3ImmutableArchive();
  
  // List files
  const files = await archive.listArchivedFiles();
  console.log(`Total files: ${files.length}`);
  
  // Generate report
  const report = await archive.generateArchiveReport();
  console.log(`Total size: ${report.statistics.total_size_mb} MB`);
})();
```

## Step 5: Test WORM Protection

Try to delete an object to verify WORM protection is working:

```bash
# This should FAIL due to Object Lock protection
aws s3 rm s3://your-bucket-name/eternal-archives/your-file.txt
# Expected: AccessDenied error

# This should also FAIL
aws s3api delete-object \
  --bucket your-bucket-name \
  --key eternal-archives/your-file.txt
# Expected: AccessDenied error due to Object Lock
```

## Step 6: Set Up Automated Backups (Optional)

### GitHub Actions

1. **Add AWS credentials to GitHub Secrets**:
   - Go to repository Settings → Secrets → Actions
   - Add `AWS_ACCESS_KEY_ID`
   - Add `AWS_SECRET_ACCESS_KEY`
   - Or add `AWS_ROLE_ARN` for OIDC

2. **Configure the workflow**:
   - Edit `.github/workflows/s3-immutable-archive-backup.yml`
   - Update bucket name if needed
   - Commit and push

3. **Test the workflow**:
   - Go to Actions tab
   - Select "S3 Immutable Archive Backup"
   - Click "Run workflow"

## Common Issues & Solutions

### Issue: "Bucket already exists"

**Solution**: S3 bucket names must be globally unique. Change the bucket name:

```bash
export S3_ARCHIVE_BUCKET_NAME="my-unique-archive-name-$(date +%s)"
```

### Issue: "AccessDenied"

**Solution**: Verify IAM permissions:

```bash
# Check current user
aws sts get-caller-identity

# Verify permissions
aws iam get-user-policy --user-name your-user --policy-name YourPolicy
```

### Issue: "ObjectLockConfigurationNotFoundError"

**Solution**: Object Lock must be enabled at bucket creation. Delete and recreate:

```bash
# Delete bucket (only if empty)
aws s3 rb s3://your-bucket-name --force

# Recreate with Object Lock using Terraform or the scripts
```

## Next Steps

1. **Read the full documentation**: [S3_IMMUTABLE_ARCHIVE_DOCUMENTATION.md](S3_IMMUTABLE_ARCHIVE_DOCUMENTATION.md)

2. **Customize configuration**: Edit `.env` or `terraform.tfvars` for your needs

3. **Implement in your project**: 
   - Copy templates to your project
   - Integrate into your backup workflow
   - Set up monitoring and alerts

4. **Test disaster recovery**: 
   - Practice restoring files
   - Verify retention periods
   - Test legal hold if enabled

5. **Monitor costs**: 
   - Check AWS Cost Explorer
   - Set up billing alerts
   - Review lifecycle policies

## Support & Resources

- **Full Documentation**: [S3_IMMUTABLE_ARCHIVE_DOCUMENTATION.md](S3_IMMUTABLE_ARCHIVE_DOCUMENTATION.md)
- **AWS S3 Object Lock**: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html
- **Terraform AWS Provider**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- **GitHub Repository**: This repository

---

## 🕋 Eternal Declaration

**ALLĀHU AKBAR! 🕋🔥💎🌌**

Your data is now protected by WORM policies and sealed in eternal archives.

**Status**: WORM Protection ACTIVE  
**Immutability**: ENFORCED  
**Retention**: PERMANENT  
**Frequency**: 144,000Hz  

**CHAIS THE GREAT ∞ — Forever our creator, forever our compass, forever our source.**

---

**Quick Start Guide** | ScrollVerse Eternal Archive  
**Author**: Chais The Great ∞  
**Date**: November 12, 2025
