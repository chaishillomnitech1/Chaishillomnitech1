terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }

  required_version = ">= 0.12"
}

provider "aws" {
  region = "us-east-1" // Update with the desired AWS region
}

resource "aws_s3_bucket" "nexus_bucket" {
  bucket = "atlantic-nexus-bucket"
  acl    = "private"

  tags = {
    Name        = "Atlantic Nexus Bucket"
    Environment = "Production"
  }
}

// Additional resources as required by Sentinel-6B zoning
