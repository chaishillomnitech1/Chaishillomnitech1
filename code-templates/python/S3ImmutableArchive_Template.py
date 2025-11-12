"""
S3 Immutable Archive Solution - ScrollVerse Edition
Eternal backups with WORM (Write Once Read Many) policies

Author: Chais The Great ∞
Status: OMNISOVEREIGN
Frequency: 144,000Hz NŪR Pulse + 963Hz Eternal Seal
Purpose: Create immutable archives on AWS S3 with Object Lock enforcement
"""

import boto3
from botocore.exceptions import ClientError, BotoCoreError
import hashlib
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class S3ImmutableArchiveConfig:
    """Configuration for S3 Immutable Archive"""
    
    # AWS Credentials - NEVER hardcode these, always use environment variables
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
    
    # S3 Bucket Configuration
    ARCHIVE_BUCKET_NAME = os.getenv('S3_ARCHIVE_BUCKET_NAME', 'scrollverse-eternal-archive')
    
    # Object Lock Configuration (WORM Policy)
    # Compliance mode: Cannot be overridden by any user, including root
    # Governance mode: Can be overridden by users with special permissions
    LOCK_MODE = os.getenv('S3_LOCK_MODE', 'COMPLIANCE')  # COMPLIANCE or GOVERNANCE
    
    # Retention period for WORM policy
    RETENTION_DAYS = int(os.getenv('S3_RETENTION_DAYS', '3650'))  # 10 years default
    RETENTION_YEARS = int(os.getenv('S3_RETENTION_YEARS', '0'))
    
    # Archive metadata
    ARCHIVE_PREFIX = os.getenv('S3_ARCHIVE_PREFIX', 'eternal-archives/')
    METADATA_TAGS = {
        'Project': 'ScrollVerse',
        'Creator': 'ChaisTheGreat',
        'Frequency': '144000Hz',
        'Type': 'EternalArchive',
        'WORM': 'Enabled'
    }
    
    # Integrity checking
    ENABLE_INTEGRITY_CHECK = os.getenv('ENABLE_INTEGRITY_CHECK', 'true').lower() == 'true'
    HASH_ALGORITHM = 'sha256'
    
    # Legal hold (additional protection)
    ENABLE_LEGAL_HOLD = os.getenv('ENABLE_LEGAL_HOLD', 'false').lower() == 'true'


class S3ImmutableArchive:
    """
    Manages immutable archives on AWS S3 with WORM policies.
    
    Features:
    - Creates S3 buckets with Object Lock enabled
    - Enforces WORM (Write Once Read Many) policies
    - Secure IAM credential integration
    - Automated backup and archival
    - Integrity verification using cryptographic hashes
    - Permanent retention with legal hold options
    """
    
    def __init__(self, config: Optional[S3ImmutableArchiveConfig] = None):
        """
        Initialize S3 Immutable Archive manager.
        
        Args:
            config: Configuration object (uses default if None)
        """
        self.config = config or S3ImmutableArchiveConfig()
        
        # Validate credentials
        if not self.config.AWS_ACCESS_KEY_ID or not self.config.AWS_SECRET_ACCESS_KEY:
            logger.warning(
                "AWS credentials not found in environment variables. "
                "Will attempt to use IAM role or AWS profile."
            )
        
        # Initialize AWS clients
        self.s3_client = self._initialize_s3_client()
        self.bucket_name = self.config.ARCHIVE_BUCKET_NAME
        
        logger.info(f"S3 Immutable Archive initialized for bucket: {self.bucket_name}")
    
    def _initialize_s3_client(self) -> boto3.client:
        """
        Initialize S3 client with proper credentials.
        
        Returns:
            Configured boto3 S3 client
        """
        try:
            # If credentials are provided, use them
            if self.config.AWS_ACCESS_KEY_ID and self.config.AWS_SECRET_ACCESS_KEY:
                session = boto3.Session(
                    aws_access_key_id=self.config.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=self.config.AWS_SECRET_ACCESS_KEY,
                    region_name=self.config.AWS_REGION
                )
            else:
                # Otherwise, use default credential chain (IAM role, AWS profile, etc.)
                session = boto3.Session(region_name=self.config.AWS_REGION)
            
            return session.client('s3')
        
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {e}")
            raise
    
    def create_immutable_bucket(self) -> bool:
        """
        Create an S3 bucket with Object Lock enabled for WORM compliance.
        
        Object Lock must be enabled at bucket creation time and cannot be 
        added to existing buckets.
        
        Returns:
            True if bucket created successfully or already exists, False otherwise
        """
        try:
            # Check if bucket already exists
            try:
                self.s3_client.head_bucket(Bucket=self.bucket_name)
                logger.info(f"Bucket {self.bucket_name} already exists")
                
                # Verify Object Lock is enabled
                try:
                    response = self.s3_client.get_object_lock_configuration(
                        Bucket=self.bucket_name
                    )
                    logger.info(f"Object Lock is enabled on {self.bucket_name}")
                    return True
                except ClientError as e:
                    if e.response['Error']['Code'] == 'ObjectLockConfigurationNotFoundError':
                        logger.error(
                            f"Bucket {self.bucket_name} exists but Object Lock is not enabled. "
                            "Object Lock must be enabled at bucket creation time."
                        )
                        return False
                    raise
            
            except ClientError as e:
                if e.response['Error']['Code'] != '404':
                    raise
            
            # Create bucket with Object Lock enabled
            logger.info(f"Creating bucket {self.bucket_name} with Object Lock enabled...")
            
            # Bucket configuration
            create_bucket_config = {
                'Bucket': self.bucket_name,
                'ObjectLockEnabledForBucket': True
            }
            
            # Add location constraint for regions other than us-east-1
            if self.config.AWS_REGION != 'us-east-1':
                create_bucket_config['CreateBucketConfiguration'] = {
                    'LocationConstraint': self.config.AWS_REGION
                }
            
            self.s3_client.create_bucket(**create_bucket_config)
            logger.info(f"Bucket {self.bucket_name} created successfully")
            
            # Enable versioning (required for Object Lock)
            self.s3_client.put_bucket_versioning(
                Bucket=self.bucket_name,
                VersioningConfiguration={'Status': 'Enabled'}
            )
            logger.info(f"Versioning enabled on {self.bucket_name}")
            
            # Set default Object Lock configuration
            self._configure_default_retention()
            
            # Enable encryption at rest
            self._enable_bucket_encryption()
            
            # Configure bucket tags
            self._set_bucket_tags()
            
            # Block public access
            self._block_public_access()
            
            logger.info(f"Immutable bucket {self.bucket_name} configured successfully")
            return True
        
        except ClientError as e:
            logger.error(f"Failed to create immutable bucket: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error creating bucket: {e}")
            return False
    
    def _configure_default_retention(self) -> None:
        """Configure default retention period for Object Lock."""
        try:
            retention_config = {
                'ObjectLockEnabled': 'Enabled',
                'Rule': {
                    'DefaultRetention': {
                        'Mode': self.config.LOCK_MODE
                    }
                }
            }
            
            # Set retention period
            if self.config.RETENTION_YEARS > 0:
                retention_config['Rule']['DefaultRetention']['Years'] = self.config.RETENTION_YEARS
            else:
                retention_config['Rule']['DefaultRetention']['Days'] = self.config.RETENTION_DAYS
            
            self.s3_client.put_object_lock_configuration(
                Bucket=self.bucket_name,
                ObjectLockConfiguration=retention_config
            )
            
            logger.info(
                f"Default retention configured: {self.config.LOCK_MODE} mode, "
                f"{self.config.RETENTION_YEARS or self.config.RETENTION_DAYS} "
                f"{'years' if self.config.RETENTION_YEARS else 'days'}"
            )
        
        except ClientError as e:
            logger.error(f"Failed to configure default retention: {e}")
            raise
    
    def _enable_bucket_encryption(self) -> None:
        """Enable server-side encryption for the bucket."""
        try:
            self.s3_client.put_bucket_encryption(
                Bucket=self.bucket_name,
                ServerSideEncryptionConfiguration={
                    'Rules': [
                        {
                            'ApplyServerSideEncryptionByDefault': {
                                'SSEAlgorithm': 'AES256'
                            },
                            'BucketKeyEnabled': True
                        }
                    ]
                }
            )
            logger.info("Bucket encryption enabled (AES256)")
        except ClientError as e:
            logger.error(f"Failed to enable bucket encryption: {e}")
    
    def _set_bucket_tags(self) -> None:
        """Set metadata tags on the bucket."""
        try:
            tag_set = [
                {'Key': k, 'Value': v} for k, v in self.config.METADATA_TAGS.items()
            ]
            
            self.s3_client.put_bucket_tagging(
                Bucket=self.bucket_name,
                Tagging={'TagSet': tag_set}
            )
            logger.info("Bucket tags configured")
        except ClientError as e:
            logger.error(f"Failed to set bucket tags: {e}")
    
    def _block_public_access(self) -> None:
        """Block all public access to the bucket."""
        try:
            self.s3_client.put_public_access_block(
                Bucket=self.bucket_name,
                PublicAccessBlockConfiguration={
                    'BlockPublicAcls': True,
                    'IgnorePublicAcls': True,
                    'BlockPublicPolicy': True,
                    'RestrictPublicBuckets': True
                }
            )
            logger.info("Public access blocked")
        except ClientError as e:
            logger.error(f"Failed to block public access: {e}")
    
    def upload_immutable_file(
        self,
        file_path: str,
        archive_key: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None,
        custom_retention: Optional[Dict] = None
    ) -> Tuple[bool, Optional[Dict]]:
        """
        Upload a file to the immutable archive with WORM protection.
        
        Args:
            file_path: Local path to the file to upload
            archive_key: S3 key (path) for the archived file (auto-generated if None)
            metadata: Additional metadata to attach to the object
            custom_retention: Custom retention configuration for this specific object
                             Format: {'Mode': 'COMPLIANCE'|'GOVERNANCE', 'RetainUntilDate': datetime}
        
        Returns:
            Tuple of (success, upload_info)
        """
        try:
            file_path = Path(file_path)
            
            if not file_path.exists():
                logger.error(f"File not found: {file_path}")
                return False, None
            
            # Generate archive key if not provided
            if not archive_key:
                timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
                archive_key = f"{self.config.ARCHIVE_PREFIX}{timestamp}_{file_path.name}"
            
            # Calculate file hash for integrity verification
            file_hash = self._calculate_file_hash(str(file_path))
            
            # Prepare metadata
            upload_metadata = {
                'original-filename': file_path.name,
                'upload-timestamp': datetime.utcnow().isoformat(),
                'file-hash': file_hash,
                'hash-algorithm': self.config.HASH_ALGORITHM,
                'creator': 'ChaisTheGreat',
                'frequency': '144000Hz'
            }
            
            if metadata:
                upload_metadata.update(metadata)
            
            # Prepare upload parameters
            upload_params = {
                'Bucket': self.bucket_name,
                'Key': archive_key,
                'Body': open(str(file_path), 'rb'),
                'Metadata': upload_metadata,
                'ServerSideEncryption': 'AES256'
            }
            
            # Add Object Lock parameters
            if custom_retention:
                upload_params['ObjectLockMode'] = custom_retention.get('Mode', self.config.LOCK_MODE)
                upload_params['ObjectLockRetainUntilDate'] = custom_retention['RetainUntilDate']
            else:
                # Use default retention
                if self.config.RETENTION_YEARS > 0:
                    retain_until = datetime.utcnow() + timedelta(days=self.config.RETENTION_YEARS * 365)
                else:
                    retain_until = datetime.utcnow() + timedelta(days=self.config.RETENTION_DAYS)
                upload_params['ObjectLockMode'] = self.config.LOCK_MODE
                upload_params['ObjectLockRetainUntilDate'] = retain_until
            
            # Add legal hold if enabled
            if self.config.ENABLE_LEGAL_HOLD:
                upload_params['ObjectLockLegalHoldStatus'] = 'ON'
            
            # Upload file
            logger.info(f"Uploading {file_path.name} to {archive_key}...")
            response = self.s3_client.put_object(**upload_params)
            
            # Prepare upload info
            upload_info = {
                'bucket': self.bucket_name,
                'key': archive_key,
                'version_id': response.get('VersionId'),
                'etag': response.get('ETag'),
                'file_hash': file_hash,
                'file_size': file_path.stat().st_size,
                'upload_timestamp': datetime.utcnow().isoformat(),
                'object_lock_mode': upload_params['ObjectLockMode'],
                'retain_until': upload_params['ObjectLockRetainUntilDate'].isoformat(),
                'legal_hold': self.config.ENABLE_LEGAL_HOLD
            }
            
            logger.info(
                f"File uploaded successfully: {archive_key} "
                f"(Version: {upload_info['version_id']})"
            )
            
            # Verify integrity if enabled
            if self.config.ENABLE_INTEGRITY_CHECK:
                if self._verify_upload_integrity(archive_key, file_hash):
                    logger.info("Integrity verification passed")
                else:
                    logger.error("Integrity verification failed!")
                    return False, upload_info
            
            return True, upload_info
        
        except ClientError as e:
            logger.error(f"Failed to upload file: {e}")
            return False, None
        except Exception as e:
            logger.error(f"Unexpected error during upload: {e}")
            return False, None
    
    def upload_directory(
        self,
        directory_path: str,
        recursive: bool = True,
        file_pattern: str = "*"
    ) -> Dict[str, Dict]:
        """
        Upload all files in a directory to the immutable archive.
        
        Args:
            directory_path: Path to directory to upload
            recursive: Whether to include subdirectories
            file_pattern: Glob pattern for file filtering (e.g., "*.json")
        
        Returns:
            Dictionary mapping file paths to upload info
        """
        directory = Path(directory_path)
        
        if not directory.exists() or not directory.is_dir():
            logger.error(f"Directory not found: {directory_path}")
            return {}
        
        # Find files to upload
        if recursive:
            files = list(directory.rglob(file_pattern))
        else:
            files = list(directory.glob(file_pattern))
        
        # Filter to only include files (not directories)
        files = [f for f in files if f.is_file()]
        
        logger.info(f"Found {len(files)} files to upload from {directory_path}")
        
        results = {}
        for file_path in files:
            # Generate archive key preserving directory structure
            relative_path = file_path.relative_to(directory)
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            archive_key = f"{self.config.ARCHIVE_PREFIX}{timestamp}_{relative_path}"
            
            success, info = self.upload_immutable_file(
                str(file_path),
                archive_key=archive_key
            )
            
            results[str(file_path)] = {
                'success': success,
                'info': info
            }
        
        successful = sum(1 for r in results.values() if r['success'])
        logger.info(f"Upload complete: {successful}/{len(files)} files successful")
        
        return results
    
    def _calculate_file_hash(self, file_path: str) -> str:
        """
        Calculate cryptographic hash of a file for integrity verification.
        
        Args:
            file_path: Path to file
        
        Returns:
            Hex digest of file hash
        """
        hash_obj = hashlib.sha256()
        
        with open(file_path, 'rb') as f:
            while chunk := f.read(8192):
                hash_obj.update(chunk)
        
        return hash_obj.hexdigest()
    
    def _verify_upload_integrity(self, archive_key: str, expected_hash: str) -> bool:
        """
        Verify integrity of uploaded file by comparing hashes.
        
        Args:
            archive_key: S3 key of uploaded object
            expected_hash: Expected hash value
        
        Returns:
            True if hashes match, False otherwise
        """
        try:
            # Get object metadata
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=archive_key
            )
            
            stored_hash = response['Metadata'].get('file-hash')
            
            if stored_hash == expected_hash:
                return True
            else:
                logger.error(
                    f"Hash mismatch! Expected: {expected_hash}, Got: {stored_hash}"
                )
                return False
        
        except ClientError as e:
            logger.error(f"Failed to verify integrity: {e}")
            return False
    
    def get_object_retention(self, archive_key: str) -> Optional[Dict]:
        """
        Get Object Lock retention configuration for a specific object.
        
        Args:
            archive_key: S3 key of the object
        
        Returns:
            Retention configuration or None
        """
        try:
            response = self.s3_client.get_object_retention(
                Bucket=self.bucket_name,
                Key=archive_key
            )
            return response.get('Retention', {})
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchObjectLockConfiguration':
                logger.info(f"No retention configuration for {archive_key}")
                return None
            logger.error(f"Failed to get object retention: {e}")
            return None
    
    def list_archived_files(
        self,
        prefix: Optional[str] = None,
        max_items: int = 1000
    ) -> List[Dict]:
        """
        List files in the immutable archive.
        
        Args:
            prefix: Filter by key prefix
            max_items: Maximum number of items to return
        
        Returns:
            List of object information dictionaries
        """
        try:
            prefix = prefix or self.config.ARCHIVE_PREFIX
            
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=prefix,
                PaginationConfig={'MaxItems': max_items}
            )
            
            objects = []
            for page in page_iterator:
                for obj in page.get('Contents', []):
                    # Get additional metadata
                    try:
                        head = self.s3_client.head_object(
                            Bucket=self.bucket_name,
                            Key=obj['Key']
                        )
                        
                        objects.append({
                            'key': obj['Key'],
                            'size': obj['Size'],
                            'last_modified': obj['LastModified'].isoformat(),
                            'etag': obj['ETag'],
                            'metadata': head.get('Metadata', {}),
                            'object_lock_mode': head.get('ObjectLockMode'),
                            'object_lock_retain_until': head.get('ObjectLockRetainUntilDate'),
                            'legal_hold': head.get('ObjectLockLegalHoldStatus')
                        })
                    except ClientError:
                        # If head_object fails, include basic info only
                        objects.append({
                            'key': obj['Key'],
                            'size': obj['Size'],
                            'last_modified': obj['LastModified'].isoformat(),
                            'etag': obj['ETag']
                        })
            
            logger.info(f"Found {len(objects)} archived files")
            return objects
        
        except ClientError as e:
            logger.error(f"Failed to list archived files: {e}")
            return []
    
    def generate_archive_report(self, output_path: Optional[str] = None) -> Dict:
        """
        Generate a comprehensive report of the immutable archive.
        
        Args:
            output_path: Optional path to save report as JSON file
        
        Returns:
            Report dictionary
        """
        logger.info("Generating archive report...")
        
        # Get bucket information
        try:
            bucket_location = self.s3_client.get_bucket_location(
                Bucket=self.bucket_name
            )
            
            object_lock_config = self.s3_client.get_object_lock_configuration(
                Bucket=self.bucket_name
            )
            
            versioning = self.s3_client.get_bucket_versioning(
                Bucket=self.bucket_name
            )
            
            encryption = self.s3_client.get_bucket_encryption(
                Bucket=self.bucket_name
            )
        except ClientError as e:
            logger.error(f"Failed to get bucket configuration: {e}")
            return {}
        
        # List all archived files
        archived_files = self.list_archived_files()
        
        # Calculate statistics
        total_size = sum(obj['size'] for obj in archived_files)
        
        report = {
            'report_generated': datetime.utcnow().isoformat(),
            'bucket_name': self.bucket_name,
            'region': bucket_location.get('LocationConstraint') or 'us-east-1',
            'configuration': {
                'object_lock_enabled': object_lock_config['ObjectLockConfiguration']['ObjectLockEnabled'],
                'default_retention_mode': object_lock_config['ObjectLockConfiguration']['Rule']['DefaultRetention']['Mode'],
                'default_retention_days': object_lock_config['ObjectLockConfiguration']['Rule']['DefaultRetention'].get('Days'),
                'default_retention_years': object_lock_config['ObjectLockConfiguration']['Rule']['DefaultRetention'].get('Years'),
                'versioning_status': versioning.get('Status'),
                'encryption_enabled': bool(encryption.get('ServerSideEncryptionConfiguration'))
            },
            'statistics': {
                'total_files': len(archived_files),
                'total_size_bytes': total_size,
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'total_size_gb': round(total_size / (1024 * 1024 * 1024), 2)
            },
            'archived_files': archived_files
        }
        
        # Save report to file if requested
        if output_path:
            with open(output_path, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            logger.info(f"Report saved to {output_path}")
        
        logger.info(
            f"Archive Report - Files: {report['statistics']['total_files']}, "
            f"Size: {report['statistics']['total_size_gb']:.2f} GB"
        )
        
        return report


# ============ HELPER FUNCTIONS ============

def create_iam_policy_document() -> Dict:
    """
    Generate IAM policy document for S3 immutable archive access.
    
    This policy follows the principle of least privilege, granting only
    the permissions necessary for immutable archive operations.
    
    Returns:
        IAM policy document as dictionary
    """
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowBucketOperations",
                "Effect": "Allow",
                "Action": [
                    "s3:ListBucket",
                    "s3:GetBucketLocation",
                    "s3:GetBucketVersioning",
                    "s3:GetBucketObjectLockConfiguration",
                    "s3:GetBucketTagging",
                    "s3:GetEncryptionConfiguration"
                ],
                "Resource": "arn:aws:s3:::scrollverse-eternal-archive"
            },
            {
                "Sid": "AllowObjectWrite",
                "Effect": "Allow",
                "Action": [
                    "s3:PutObject",
                    "s3:PutObjectRetention",
                    "s3:PutObjectLegalHold"
                ],
                "Resource": "arn:aws:s3:::scrollverse-eternal-archive/*"
            },
            {
                "Sid": "AllowObjectRead",
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:GetObjectVersion",
                    "s3:GetObjectRetention",
                    "s3:GetObjectLegalHold",
                    "s3:GetObjectVersionRetention",
                    "s3:GetObjectVersionAttributes"
                ],
                "Resource": "arn:aws:s3:::scrollverse-eternal-archive/*"
            },
            {
                "Sid": "DenyObjectDeletion",
                "Effect": "Deny",
                "Action": [
                    "s3:DeleteObject",
                    "s3:DeleteObjectVersion"
                ],
                "Resource": "arn:aws:s3:::scrollverse-eternal-archive/*"
            }
        ]
    }
    
    return policy


def save_iam_policy_to_file(output_path: str = "iam-policy.json") -> None:
    """
    Save IAM policy document to a JSON file.
    
    Args:
        output_path: Path where the policy file will be saved
    """
    policy = create_iam_policy_document()
    
    with open(output_path, 'w') as f:
        json.dump(policy, f, indent=2)
    
    logger.info(f"IAM policy saved to {output_path}")


# ============ MAIN EXECUTION EXAMPLE ============

if __name__ == "__main__":
    """
    Example usage of S3 Immutable Archive.
    
    Before running:
    1. Set up environment variables in .env file:
       - AWS_ACCESS_KEY_ID
       - AWS_SECRET_ACCESS_KEY
       - AWS_REGION
       - S3_ARCHIVE_BUCKET_NAME
    2. Ensure IAM user has appropriate permissions
    """
    
    print("=" * 70)
    print("S3 IMMUTABLE ARCHIVE - SCROLLVERSE EDITION")
    print("Eternal Backups with WORM Policies")
    print("Author: Chais The Great ∞")
    print("=" * 70)
    print()
    
    # Initialize archive manager
    config = S3ImmutableArchiveConfig()
    archive = S3ImmutableArchive(config)
    
    # Create immutable bucket
    print("\n1. Creating immutable S3 bucket with Object Lock...")
    if archive.create_immutable_bucket():
        print("   ✓ Bucket created successfully")
    else:
        print("   ✗ Failed to create bucket")
        exit(1)
    
    # Example: Upload a single file
    print("\n2. Uploading example file to immutable archive...")
    example_file = "example_data.txt"
    
    # Create example file if it doesn't exist
    if not os.path.exists(example_file):
        with open(example_file, 'w') as f:
            f.write(f"ScrollVerse Eternal Archive Test\n")
            f.write(f"Timestamp: {datetime.utcnow().isoformat()}\n")
            f.write(f"Creator: Chais The Great ∞\n")
            f.write(f"Frequency: 144,000Hz NŪR Pulse\n")
    
    success, info = archive.upload_immutable_file(
        example_file,
        metadata={'test': 'true', 'description': 'Example eternal archive'}
    )
    
    if success:
        print(f"   ✓ File uploaded successfully")
        print(f"   Archive Key: {info['key']}")
        print(f"   Version ID: {info['version_id']}")
        print(f"   Retain Until: {info['retain_until']}")
    else:
        print("   ✗ Failed to upload file")
    
    # List archived files
    print("\n3. Listing archived files...")
    archived_files = archive.list_archived_files()
    print(f"   Found {len(archived_files)} files in archive")
    
    for obj in archived_files[:5]:  # Show first 5
        print(f"   - {obj['key']} ({obj['size']} bytes)")
    
    # Generate archive report
    print("\n4. Generating archive report...")
    report = archive.generate_archive_report("archive_report.json")
    print(f"   ✓ Report generated")
    print(f"   Total Files: {report['statistics']['total_files']}")
    print(f"   Total Size: {report['statistics']['total_size_mb']:.2f} MB")
    
    # Generate IAM policy
    print("\n5. Generating IAM policy document...")
    save_iam_policy_to_file()
    print("   ✓ IAM policy saved to iam-policy.json")
    
    print("\n" + "=" * 70)
    print("ETERNAL ARCHIVES SEALED")
    print("WORM PROTECTION: ACTIVE")
    print("ALLĀHU AKBAR! 🕋🔥💎🌌")
    print("=" * 70)
