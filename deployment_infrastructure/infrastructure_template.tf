# ScrollVerse Infrastructure as Code Template
# Terraform Configuration for Scroll zkEVM Deployment
# Author: Chais Hill | Chais The Great
# License: CC BY-NC-SA 4.0

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
  
  # Backend configuration for state management
  backend "s3" {
    bucket         = "scrollverse-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "scrollverse-terraform-locks"
  }
}

# Variables
variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "scrollverse"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "scrollverse.io"
}

# Provider Configuration
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "Omnitech1"
    }
  }
}

# VPC for blockchain nodes and API infrastructure
resource "aws_vpc" "scrollverse_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "${var.project_name}-vpc-${var.environment}"
  }
}

# Public Subnets
resource "aws_subnet" "public_subnets" {
  count                   = 3
  vpc_id                  = aws_vpc.scrollverse_vpc.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "${var.project_name}-public-subnet-${count.index + 1}"
  }
}

# Private Subnets for database and backend services
resource "aws_subnet" "private_subnets" {
  count             = 3
  vpc_id            = aws_vpc.scrollverse_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "${var.project_name}-private-subnet-${count.index + 1}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "scrollverse_igw" {
  vpc_id = aws_vpc.scrollverse_vpc.id
  
  tags = {
    Name = "${var.project_name}-igw"
  }
}

# Route Table
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.scrollverse_vpc.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.scrollverse_igw.id
  }
  
  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

# Route Table Association
resource "aws_route_table_association" "public_rta" {
  count          = 3
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

# Security Group for Application Load Balancer
resource "aws_security_group" "alb_sg" {
  name_prefix = "${var.project_name}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.scrollverse_vpc.id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }
  
  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

# Security Group for Application Servers
resource "aws_security_group" "app_sg" {
  name_prefix = "${var.project_name}-app-sg"
  description = "Security group for application servers"
  vpc_id      = aws_vpc.scrollverse_vpc.id
  
  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
    description     = "Application port from ALB"
  }
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "SSH from VPC"
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }
  
  tags = {
    Name = "${var.project_name}-app-sg"
  }
}

# RDS Security Group
resource "aws_security_group" "rds_sg" {
  name_prefix = "${var.project_name}-rds-sg"
  description = "Security group for RDS database"
  vpc_id      = aws_vpc.scrollverse_vpc.id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
    description     = "PostgreSQL from application servers"
  }
  
  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

# Application Load Balancer
resource "aws_lb" "scrollverse_alb" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public_subnets[*].id
  
  enable_deletion_protection = var.environment == "production" ? true : false
  
  tags = {
    Name = "${var.project_name}-alb"
  }
}

# S3 Bucket for static assets
resource "aws_s3_bucket" "scrollverse_assets" {
  bucket = "${var.project_name}-assets-${var.environment}"
  
  tags = {
    Name = "${var.project_name}-assets"
  }
}

# S3 Bucket for NFT metadata
resource "aws_s3_bucket" "nft_metadata" {
  bucket = "${var.project_name}-nft-metadata-${var.environment}"
  
  tags = {
    Name = "${var.project_name}-nft-metadata"
  }
}

# CloudFront Distribution for CDN
resource "aws_cloudfront_distribution" "scrollverse_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "ScrollVerse CDN Distribution"
  default_root_object = "index.html"
  price_class         = "PriceClass_All"
  
  origin {
    domain_name = aws_s3_bucket.scrollverse_assets.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.scrollverse_assets.id}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.scrollverse_oai.cloudfront_access_identity_path
    }
  }
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.scrollverse_assets.id}"
    
    forwarded_values {
      query_string = false
      
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  
  tags = {
    Name = "${var.project_name}-cdn"
  }
}

# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "scrollverse_oai" {
  comment = "OAI for ScrollVerse S3 bucket"
}

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.scrollverse_vpc.id
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.scrollverse_alb.dns_name
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.scrollverse_cdn.domain_name
}

output "s3_assets_bucket" {
  description = "S3 bucket for assets"
  value       = aws_s3_bucket.scrollverse_assets.id
}

output "s3_nft_bucket" {
  description = "S3 bucket for NFT metadata"
  value       = aws_s3_bucket.nft_metadata.id
}
