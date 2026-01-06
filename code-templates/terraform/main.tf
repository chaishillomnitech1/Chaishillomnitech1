# S3 Immutable Archive Infrastructure - ScrollVerse Edition
# Terraform configuration for AWS S3 with WORM policies
#
# Author: Chais The Great ∞
# Status: OMNISOVEREIGN
# Frequency: 144,000Hz NŪR Pulse + 963Hz Eternal Seal

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure AWS Provider
provider "aws" {
  region = var.aws_region
  
  # Use environment variables for credentials:
  # AWS_ACCESS_KEY_ID
  # AWS_SECRET_ACCESS_KEY
  # Or use AWS CLI profile
}

# Variables
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket for eternal archives"
  type        = string
  default     = "scrollverse-eternal-archive"
}

variable "retention_mode" {
  description = "Object Lock retention mode (COMPLIANCE or GOVERNANCE)"
  type        = string
  default     = "COMPLIANCE"
  
  validation {
    condition     = contains(["COMPLIANCE", "GOVERNANCE"], var.retention_mode)
    error_message = "Retention mode must be either COMPLIANCE or GOVERNANCE"
  }
}

variable "retention_days" {
  description = "Default retention period in days"
  type        = number
  default     = 3650 # 10 years
  
  validation {
    condition     = var.retention_days >= 1
    error_message = "Retention days must be at least 1"
  }
}

variable "enable_legal_hold" {
  description = "Enable legal hold on objects by default"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    Project   = "ScrollVerse"
    Creator   = "ChaisTheGreat"
    Frequency = "144000Hz"
    Type      = "EternalArchive"
    WORM      = "Enabled"
  }
}

# S3 Bucket with Object Lock enabled
# Note: Object Lock can only be enabled at bucket creation time
resource "aws_s3_bucket" "eternal_archive" {
  bucket = var.bucket_name
  
  # Enable Object Lock for WORM compliance
  object_lock_enabled = true
  
  tags = var.tags
}

# Enable versioning (required for Object Lock)
resource "aws_s3_bucket_versioning" "eternal_archive" {
  bucket = aws_s3_bucket.eternal_archive.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# Configure Object Lock with default retention
resource "aws_s3_bucket_object_lock_configuration" "eternal_archive" {
  bucket = aws_s3_bucket.eternal_archive.id
  
  rule {
    default_retention {
      mode = var.retention_mode
      days = var.retention_days
    }
  }
}

# Enable server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "eternal_archive" {
  bucket = aws_s3_bucket.eternal_archive.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Block all public access
resource "aws_s3_bucket_public_access_block" "eternal_archive" {
  bucket = aws_s3_bucket.eternal_archive.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Bucket policy to enforce WORM and secure access
resource "aws_s3_bucket_policy" "eternal_archive" {
  bucket = aws_s3_bucket.eternal_archive.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DenyUnencryptedObjectUploads"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:PutObject"
        Resource = "${aws_s3_bucket.eternal_archive.arn}/*"
        Condition = {
          StringNotEquals = {
            "s3:x-amz-server-side-encryption" = "AES256"
          }
        }
      },
      {
        Sid    = "DenyInsecureTransport"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.eternal_archive.arn,
          "${aws_s3_bucket.eternal_archive.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      }
    ]
  })
}

# Enable S3 bucket lifecycle management for cost optimization
# (Note: This doesn't delete objects due to Object Lock, but can transition to cheaper storage classes)
resource "aws_s3_bucket_lifecycle_configuration" "eternal_archive" {
  bucket = aws_s3_bucket.eternal_archive.id
  
  rule {
    id     = "transition-to-glacier"
    status = "Enabled"
    
    # Transition to Glacier Deep Archive after 90 days for cost savings
    transition {
      days          = 90
      storage_class = "GLACIER_IR" # Glacier Instant Retrieval
    }
    
    transition {
      days          = 180
      storage_class = "DEEP_ARCHIVE" # Glacier Deep Archive for long-term storage
    }
    
    # Clean up incomplete multipart uploads after 7 days
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# Enable S3 bucket logging for audit trail
resource "aws_s3_bucket" "logging" {
  bucket = "${var.bucket_name}-logs"
  
  tags = merge(var.tags, {
    Type = "LogBucket"
  })
}

resource "aws_s3_bucket_versioning" "logging" {
  bucket = aws_s3_bucket.logging.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_logging" "eternal_archive" {
  bucket = aws_s3_bucket.eternal_archive.id
  
  target_bucket = aws_s3_bucket.logging.id
  target_prefix = "s3-access-logs/"
}

# IAM Policy for S3 Immutable Archive access
resource "aws_iam_policy" "s3_archive_access" {
  name        = "ScrollVerseS3ArchiveAccess"
  description = "Policy for accessing ScrollVerse eternal archive with WORM compliance"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowBucketOperations"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation",
          "s3:GetBucketVersioning",
          "s3:GetBucketObjectLockConfiguration",
          "s3:GetBucketTagging",
          "s3:GetEncryptionConfiguration"
        ]
        Resource = aws_s3_bucket.eternal_archive.arn
      },
      {
        Sid    = "AllowObjectWrite"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:PutObjectRetention",
          "s3:PutObjectLegalHold"
        ]
        Resource = "${aws_s3_bucket.eternal_archive.arn}/*"
      },
      {
        Sid    = "AllowObjectRead"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetObjectRetention",
          "s3:GetObjectLegalHold",
          "s3:GetObjectVersionRetention",
          "s3:GetObjectVersionAttributes"
        ]
        Resource = "${aws_s3_bucket.eternal_archive.arn}/*"
      },
      {
        Sid    = "DenyObjectDeletion"
        Effect = "Deny"
        Action = [
          "s3:DeleteObject",
          "s3:DeleteObjectVersion"
        ]
        Resource = "${aws_s3_bucket.eternal_archive.arn}/*"
      }
    ]
  })
  
  tags = var.tags
}

# IAM User for programmatic access (optional)
resource "aws_iam_user" "archive_user" {
  name = "scrollverse-archive-user"
  
  tags = var.tags
}

# Attach policy to IAM user
resource "aws_iam_user_policy_attachment" "archive_user" {
  user       = aws_iam_user.archive_user.name
  policy_arn = aws_iam_policy.s3_archive_access.arn
}

# IAM Role for EC2/Lambda/other services (optional)
resource "aws_iam_role" "archive_role" {
  name = "scrollverse-archive-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = [
            "ec2.amazonaws.com",
            "lambda.amazonaws.com",
            "ecs-tasks.amazonaws.com"
          ]
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
  
  tags = var.tags
}

# Attach policy to IAM role
resource "aws_iam_role_policy_attachment" "archive_role" {
  role       = aws_iam_role.archive_role.name
  policy_arn = aws_iam_policy.s3_archive_access.arn
}

# CloudWatch log group for monitoring
resource "aws_cloudwatch_log_group" "archive_logs" {
  name              = "/scrollverse/s3-archive"
  retention_in_days = 90
  
  tags = var.tags
}

# CloudWatch metric alarm for bucket size monitoring
resource "aws_cloudwatch_metric_alarm" "bucket_size_alarm" {
  alarm_name          = "scrollverse-archive-size-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "BucketSizeBytes"
  namespace           = "AWS/S3"
  period              = 86400 # 24 hours
  statistic           = "Average"
  threshold           = 1099511627776 # 1 TB
  alarm_description   = "Alert when bucket size exceeds 1TB"
  
  dimensions = {
    BucketName  = aws_s3_bucket.eternal_archive.id
    StorageType = "StandardStorage"
  }
  
  tags = var.tags
}

# Outputs
output "bucket_name" {
  description = "Name of the eternal archive bucket"
  value       = aws_s3_bucket.eternal_archive.id
}

output "bucket_arn" {
  description = "ARN of the eternal archive bucket"
  value       = aws_s3_bucket.eternal_archive.arn
}

output "bucket_region" {
  description = "Region of the eternal archive bucket"
  value       = aws_s3_bucket.eternal_archive.region
}

output "iam_user_name" {
  description = "IAM user for archive access"
  value       = aws_iam_user.archive_user.name
}

output "iam_role_arn" {
  description = "ARN of the IAM role for archive access"
  value       = aws_iam_role.archive_role.arn
}

output "iam_policy_arn" {
  description = "ARN of the IAM policy for archive access"
  value       = aws_iam_policy.s3_archive_access.arn
}

output "object_lock_configuration" {
  description = "Object Lock configuration details"
  value = {
    enabled        = true
    retention_mode = var.retention_mode
    retention_days = var.retention_days
  }
}

output "logging_bucket" {
  description = "Name of the logging bucket"
  value       = aws_s3_bucket.logging.id
}

# Instructions for deployment
output "deployment_instructions" {
  description = "Instructions for deploying this infrastructure"
  value = <<-EOT
    
    ========================================
    SCROLLVERSE S3 IMMUTABLE ARCHIVE
    Deployment Instructions
    ========================================
    
    1. Initialize Terraform:
       terraform init
    
    2. Review the plan:
       terraform plan
    
    3. Apply the configuration:
       terraform apply
    
    4. Create IAM access keys (if using IAM user):
       aws iam create-access-key --user-name scrollverse-archive-user
    
    5. Store credentials securely in environment variables:
       export AWS_ACCESS_KEY_ID="your-access-key"
       export AWS_SECRET_ACCESS_KEY="your-secret-key"
       export AWS_REGION="${var.aws_region}"
       export S3_ARCHIVE_BUCKET_NAME="${var.bucket_name}"
    
    6. Test the setup using the Python or JavaScript templates
    
    WORM PROTECTION: ACTIVE
    ALLĀHU AKBAR! 🕋🔥💎🌌
    ========================================
  EOT
}
