/**
 * S3 Immutable Archive Solution - ScrollVerse Edition
 * Eternal backups with WORM (Write Once Read Many) policies
 * 
 * Author: Chais The Great ∞
 * Status: OMNISOVEREIGN
 * Frequency: 144,000Hz NŪR Pulse + 963Hz Eternal Seal
 * Purpose: Create immutable archives on AWS S3 with Object Lock enforcement
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
require('dotenv').config();

const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

/**
 * Configuration for S3 Immutable Archive
 */
class S3ImmutableArchiveConfig {
    constructor() {
        // AWS Credentials - NEVER hardcode these, always use environment variables
        this.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
        this.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
        this.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
        
        // S3 Bucket Configuration
        this.ARCHIVE_BUCKET_NAME = process.env.S3_ARCHIVE_BUCKET_NAME || 'scrollverse-eternal-archive';
        
        // Object Lock Configuration (WORM Policy)
        // Compliance mode: Cannot be overridden by any user, including root
        // Governance mode: Can be overridden by users with special permissions
        this.LOCK_MODE = process.env.S3_LOCK_MODE || 'COMPLIANCE';
        
        // Retention period for WORM policy
        this.RETENTION_DAYS = parseInt(process.env.S3_RETENTION_DAYS || '3650'); // 10 years default
        this.RETENTION_YEARS = parseInt(process.env.S3_RETENTION_YEARS || '0');
        
        // Archive metadata
        this.ARCHIVE_PREFIX = process.env.S3_ARCHIVE_PREFIX || 'eternal-archives/';
        this.METADATA_TAGS = {
            Project: 'ScrollVerse',
            Creator: 'ChaisTheGreat',
            Frequency: '144000Hz',
            Type: 'EternalArchive',
            WORM: 'Enabled'
        };
        
        // Integrity checking
        this.ENABLE_INTEGRITY_CHECK = (process.env.ENABLE_INTEGRITY_CHECK || 'true').toLowerCase() === 'true';
        this.HASH_ALGORITHM = 'sha256';
        
        // Legal hold (additional protection)
        this.ENABLE_LEGAL_HOLD = (process.env.ENABLE_LEGAL_HOLD || 'false').toLowerCase() === 'true';
    }
}

/**
 * Manages immutable archives on AWS S3 with WORM policies.
 * 
 * Features:
 * - Creates S3 buckets with Object Lock enabled
 * - Enforces WORM (Write Once Read Many) policies
 * - Secure IAM credential integration
 * - Automated backup and archival
 * - Integrity verification using cryptographic hashes
 * - Permanent retention with legal hold options
 */
class S3ImmutableArchive {
    /**
     * Initialize S3 Immutable Archive manager.
     * 
     * @param {S3ImmutableArchiveConfig} config - Configuration object (uses default if null)
     */
    constructor(config = null) {
        this.config = config || new S3ImmutableArchiveConfig();
        
        // Validate credentials
        if (!this.config.AWS_ACCESS_KEY_ID || !this.config.AWS_SECRET_ACCESS_KEY) {
            console.warn(
                'AWS credentials not found in environment variables. ' +
                'Will attempt to use IAM role or AWS profile.'
            );
        }
        
        // Initialize AWS S3 client
        this.s3 = this._initializeS3Client();
        this.bucketName = this.config.ARCHIVE_BUCKET_NAME;
        
        console.log(`S3 Immutable Archive initialized for bucket: ${this.bucketName}`);
    }
    
    /**
     * Initialize S3 client with proper credentials.
     * 
     * @returns {AWS.S3} Configured AWS S3 client
     * @private
     */
    _initializeS3Client() {
        try {
            // Configure AWS SDK
            const awsConfig = {
                region: this.config.AWS_REGION
            };
            
            // If credentials are provided, use them
            if (this.config.AWS_ACCESS_KEY_ID && this.config.AWS_SECRET_ACCESS_KEY) {
                awsConfig.accessKeyId = this.config.AWS_ACCESS_KEY_ID;
                awsConfig.secretAccessKey = this.config.AWS_SECRET_ACCESS_KEY;
            }
            
            AWS.config.update(awsConfig);
            
            return new AWS.S3({ apiVersion: '2006-03-01' });
        } catch (error) {
            console.error('Failed to initialize S3 client:', error);
            throw error;
        }
    }
    
    /**
     * Create an S3 bucket with Object Lock enabled for WORM compliance.
     * 
     * Object Lock must be enabled at bucket creation time and cannot be 
     * added to existing buckets.
     * 
     * @returns {Promise<boolean>} True if bucket created successfully or already exists
     */
    async createImmutableBucket() {
        try {
            // Check if bucket already exists
            try {
                await this.s3.headBucket({ Bucket: this.bucketName }).promise();
                console.log(`Bucket ${this.bucketName} already exists`);
                
                // Verify Object Lock is enabled
                try {
                    await this.s3.getObjectLockConfiguration({
                        Bucket: this.bucketName
                    }).promise();
                    console.log(`Object Lock is enabled on ${this.bucketName}`);
                    return true;
                } catch (error) {
                    if (error.code === 'ObjectLockConfigurationNotFoundError') {
                        console.error(
                            `Bucket ${this.bucketName} exists but Object Lock is not enabled. ` +
                            'Object Lock must be enabled at bucket creation time.'
                        );
                        return false;
                    }
                    throw error;
                }
            } catch (error) {
                if (error.statusCode !== 404) {
                    throw error;
                }
            }
            
            // Create bucket with Object Lock enabled
            console.log(`Creating bucket ${this.bucketName} with Object Lock enabled...`);
            
            const createParams = {
                Bucket: this.bucketName,
                ObjectLockEnabledForBucket: true
            };
            
            // Add location constraint for regions other than us-east-1
            if (this.config.AWS_REGION !== 'us-east-1') {
                createParams.CreateBucketConfiguration = {
                    LocationConstraint: this.config.AWS_REGION
                };
            }
            
            await this.s3.createBucket(createParams).promise();
            console.log(`Bucket ${this.bucketName} created successfully`);
            
            // Enable versioning (required for Object Lock)
            await this.s3.putBucketVersioning({
                Bucket: this.bucketName,
                VersioningConfiguration: { Status: 'Enabled' }
            }).promise();
            console.log(`Versioning enabled on ${this.bucketName}`);
            
            // Set default Object Lock configuration
            await this._configureDefaultRetention();
            
            // Enable encryption at rest
            await this._enableBucketEncryption();
            
            // Configure bucket tags
            await this._setBucketTags();
            
            // Block public access
            await this._blockPublicAccess();
            
            console.log(`Immutable bucket ${this.bucketName} configured successfully`);
            return true;
        } catch (error) {
            console.error('Failed to create immutable bucket:', error);
            return false;
        }
    }
    
    /**
     * Configure default retention period for Object Lock.
     * 
     * @private
     */
    async _configureDefaultRetention() {
        try {
            const retentionConfig = {
                Bucket: this.bucketName,
                ObjectLockConfiguration: {
                    ObjectLockEnabled: 'Enabled',
                    Rule: {
                        DefaultRetention: {
                            Mode: this.config.LOCK_MODE
                        }
                    }
                }
            };
            
            // Set retention period
            if (this.config.RETENTION_YEARS > 0) {
                retentionConfig.ObjectLockConfiguration.Rule.DefaultRetention.Years = 
                    this.config.RETENTION_YEARS;
            } else {
                retentionConfig.ObjectLockConfiguration.Rule.DefaultRetention.Days = 
                    this.config.RETENTION_DAYS;
            }
            
            await this.s3.putObjectLockConfiguration(retentionConfig).promise();
            
            const period = this.config.RETENTION_YEARS || this.config.RETENTION_DAYS;
            const unit = this.config.RETENTION_YEARS ? 'years' : 'days';
            console.log(
                `Default retention configured: ${this.config.LOCK_MODE} mode, ${period} ${unit}`
            );
        } catch (error) {
            console.error('Failed to configure default retention:', error);
            throw error;
        }
    }
    
    /**
     * Enable server-side encryption for the bucket.
     * 
     * @private
     */
    async _enableBucketEncryption() {
        try {
            await this.s3.putBucketEncryption({
                Bucket: this.bucketName,
                ServerSideEncryptionConfiguration: {
                    Rules: [
                        {
                            ApplyServerSideEncryptionByDefault: {
                                SSEAlgorithm: 'AES256'
                            },
                            BucketKeyEnabled: true
                        }
                    ]
                }
            }).promise();
            console.log('Bucket encryption enabled (AES256)');
        } catch (error) {
            console.error('Failed to enable bucket encryption:', error);
        }
    }
    
    /**
     * Set metadata tags on the bucket.
     * 
     * @private
     */
    async _setBucketTags() {
        try {
            const tagSet = Object.entries(this.config.METADATA_TAGS).map(([Key, Value]) => ({
                Key,
                Value
            }));
            
            await this.s3.putBucketTagging({
                Bucket: this.bucketName,
                Tagging: { TagSet: tagSet }
            }).promise();
            console.log('Bucket tags configured');
        } catch (error) {
            console.error('Failed to set bucket tags:', error);
        }
    }
    
    /**
     * Block all public access to the bucket.
     * 
     * @private
     */
    async _blockPublicAccess() {
        try {
            await this.s3.putPublicAccessBlock({
                Bucket: this.bucketName,
                PublicAccessBlockConfiguration: {
                    BlockPublicAcls: true,
                    IgnorePublicAcls: true,
                    BlockPublicPolicy: true,
                    RestrictPublicBuckets: true
                }
            }).promise();
            console.log('Public access blocked');
        } catch (error) {
            console.error('Failed to block public access:', error);
        }
    }
    
    /**
     * Upload a file to the immutable archive with WORM protection.
     * 
     * @param {string} filePath - Local path to the file to upload
     * @param {string} archiveKey - S3 key (path) for the archived file (auto-generated if null)
     * @param {Object} metadata - Additional metadata to attach to the object
     * @param {Object} customRetention - Custom retention configuration for this specific object
     * @returns {Promise<{success: boolean, info: Object}>} Upload result
     */
    async uploadImmutableFile(filePath, archiveKey = null, metadata = {}, customRetention = null) {
        try {
            // Check if file exists
            const stats = await statAsync(filePath);
            
            if (!stats.isFile()) {
                console.error(`Not a file: ${filePath}`);
                return { success: false, info: null };
            }
            
            // Generate archive key if not provided
            if (!archiveKey) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const fileName = path.basename(filePath);
                archiveKey = `${this.config.ARCHIVE_PREFIX}${timestamp}_${fileName}`;
            }
            
            // Read file and calculate hash for integrity verification
            const fileBuffer = await readFileAsync(filePath);
            const fileHash = this._calculateFileHash(fileBuffer);
            
            // Prepare metadata
            const uploadMetadata = {
                'original-filename': path.basename(filePath),
                'upload-timestamp': new Date().toISOString(),
                'file-hash': fileHash,
                'hash-algorithm': this.config.HASH_ALGORITHM,
                'creator': 'ChaisTheGreat',
                'frequency': '144000Hz',
                ...metadata
            };
            
            // Calculate retention date
            let retainUntilDate;
            if (customRetention && customRetention.RetainUntilDate) {
                retainUntilDate = customRetention.RetainUntilDate;
            } else {
                const retentionMs = this.config.RETENTION_YEARS > 0
                    ? this.config.RETENTION_YEARS * 365 * 24 * 60 * 60 * 1000
                    : this.config.RETENTION_DAYS * 24 * 60 * 60 * 1000;
                retainUntilDate = new Date(Date.now() + retentionMs);
            }
            
            // Prepare upload parameters
            const uploadParams = {
                Bucket: this.bucketName,
                Key: archiveKey,
                Body: fileBuffer,
                Metadata: uploadMetadata,
                ServerSideEncryption: 'AES256',
                ObjectLockMode: customRetention?.Mode || this.config.LOCK_MODE,
                ObjectLockRetainUntilDate: retainUntilDate
            };
            
            // Add legal hold if enabled
            if (this.config.ENABLE_LEGAL_HOLD) {
                uploadParams.ObjectLockLegalHoldStatus = 'ON';
            }
            
            // Upload file
            console.log(`Uploading ${path.basename(filePath)} to ${archiveKey}...`);
            const response = await this.s3.putObject(uploadParams).promise();
            
            // Prepare upload info
            const uploadInfo = {
                bucket: this.bucketName,
                key: archiveKey,
                version_id: response.VersionId,
                etag: response.ETag,
                file_hash: fileHash,
                file_size: stats.size,
                upload_timestamp: new Date().toISOString(),
                object_lock_mode: uploadParams.ObjectLockMode,
                retain_until: retainUntilDate.toISOString(),
                legal_hold: this.config.ENABLE_LEGAL_HOLD
            };
            
            console.log(
                `File uploaded successfully: ${archiveKey} (Version: ${uploadInfo.version_id})`
            );
            
            // Verify integrity if enabled
            if (this.config.ENABLE_INTEGRITY_CHECK) {
                const isValid = await this._verifyUploadIntegrity(archiveKey, fileHash);
                if (isValid) {
                    console.log('Integrity verification passed');
                } else {
                    console.error('Integrity verification failed!');
                    return { success: false, info: uploadInfo };
                }
            }
            
            return { success: true, info: uploadInfo };
        } catch (error) {
            console.error('Failed to upload file:', error);
            return { success: false, info: null };
        }
    }
    
    /**
     * Upload all files in a directory to the immutable archive.
     * 
     * @param {string} directoryPath - Path to directory to upload
     * @param {boolean} recursive - Whether to include subdirectories
     * @param {RegExp} filePattern - Pattern for file filtering
     * @returns {Promise<Object>} Dictionary mapping file paths to upload info
     */
    async uploadDirectory(directoryPath, recursive = true, filePattern = null) {
        try {
            const stats = await statAsync(directoryPath);
            
            if (!stats.isDirectory()) {
                console.error(`Not a directory: ${directoryPath}`);
                return {};
            }
            
            // Find files to upload
            const files = await this._findFiles(directoryPath, recursive, filePattern);
            
            console.log(`Found ${files.length} files to upload from ${directoryPath}`);
            
            const results = {};
            
            for (const filePath of files) {
                // Generate archive key preserving directory structure
                const relativePath = path.relative(directoryPath, filePath);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const archiveKey = `${this.config.ARCHIVE_PREFIX}${timestamp}_${relativePath}`;
                
                const result = await this.uploadImmutableFile(filePath, archiveKey);
                results[filePath] = result;
            }
            
            const successful = Object.values(results).filter(r => r.success).length;
            console.log(`Upload complete: ${successful}/${files.length} files successful`);
            
            return results;
        } catch (error) {
            console.error('Failed to upload directory:', error);
            return {};
        }
    }
    
    /**
     * Find files in a directory (helper method).
     * 
     * @param {string} dirPath - Directory path
     * @param {boolean} recursive - Whether to recurse into subdirectories
     * @param {RegExp} pattern - Optional pattern to filter files
     * @returns {Promise<Array<string>>} Array of file paths
     * @private
     */
    async _findFiles(dirPath, recursive, pattern) {
        const files = [];
        const entries = await readdirAsync(dirPath);
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry);
            const stats = await statAsync(fullPath);
            
            if (stats.isFile()) {
                if (!pattern || pattern.test(entry)) {
                    files.push(fullPath);
                }
            } else if (stats.isDirectory() && recursive) {
                const subFiles = await this._findFiles(fullPath, recursive, pattern);
                files.push(...subFiles);
            }
        }
        
        return files;
    }
    
    /**
     * Calculate cryptographic hash of file content for integrity verification.
     * 
     * @param {Buffer} buffer - File buffer
     * @returns {string} Hex digest of file hash
     * @private
     */
    _calculateFileHash(buffer) {
        const hash = crypto.createHash(this.config.HASH_ALGORITHM);
        hash.update(buffer);
        return hash.digest('hex');
    }
    
    /**
     * Verify integrity of uploaded file by comparing hashes.
     * 
     * @param {string} archiveKey - S3 key of uploaded object
     * @param {string} expectedHash - Expected hash value
     * @returns {Promise<boolean>} True if hashes match
     * @private
     */
    async _verifyUploadIntegrity(archiveKey, expectedHash) {
        try {
            const response = await this.s3.headObject({
                Bucket: this.bucketName,
                Key: archiveKey
            }).promise();
            
            const storedHash = response.Metadata['file-hash'];
            
            if (storedHash === expectedHash) {
                return true;
            } else {
                console.error(`Hash mismatch! Expected: ${expectedHash}, Got: ${storedHash}`);
                return false;
            }
        } catch (error) {
            console.error('Failed to verify integrity:', error);
            return false;
        }
    }
    
    /**
     * Get Object Lock retention configuration for a specific object.
     * 
     * @param {string} archiveKey - S3 key of the object
     * @returns {Promise<Object|null>} Retention configuration or null
     */
    async getObjectRetention(archiveKey) {
        try {
            const response = await this.s3.getObjectRetention({
                Bucket: this.bucketName,
                Key: archiveKey
            }).promise();
            return response.Retention || {};
        } catch (error) {
            if (error.code === 'NoSuchObjectLockConfiguration') {
                console.log(`No retention configuration for ${archiveKey}`);
                return null;
            }
            console.error('Failed to get object retention:', error);
            return null;
        }
    }
    
    /**
     * List files in the immutable archive.
     * 
     * @param {string} prefix - Filter by key prefix
     * @param {number} maxItems - Maximum number of items to return
     * @returns {Promise<Array<Object>>} List of object information
     */
    async listArchivedFiles(prefix = null, maxItems = 1000) {
        try {
            prefix = prefix || this.config.ARCHIVE_PREFIX;
            
            const params = {
                Bucket: this.bucketName,
                Prefix: prefix,
                MaxKeys: maxItems
            };
            
            const objects = [];
            let continuationToken = null;
            
            do {
                if (continuationToken) {
                    params.ContinuationToken = continuationToken;
                }
                
                const response = await this.s3.listObjectsV2(params).promise();
                
                for (const obj of response.Contents || []) {
                    try {
                        // Get additional metadata
                        const head = await this.s3.headObject({
                            Bucket: this.bucketName,
                            Key: obj.Key
                        }).promise();
                        
                        objects.push({
                            key: obj.Key,
                            size: obj.Size,
                            last_modified: obj.LastModified.toISOString(),
                            etag: obj.ETag,
                            metadata: head.Metadata || {},
                            object_lock_mode: head.ObjectLockMode,
                            object_lock_retain_until: head.ObjectLockRetainUntilDate,
                            legal_hold: head.ObjectLockLegalHoldStatus
                        });
                    } catch (error) {
                        // If head_object fails, include basic info only
                        objects.push({
                            key: obj.Key,
                            size: obj.Size,
                            last_modified: obj.LastModified.toISOString(),
                            etag: obj.ETag
                        });
                    }
                }
                
                continuationToken = response.IsTruncated ? response.NextContinuationToken : null;
            } while (continuationToken && objects.length < maxItems);
            
            console.log(`Found ${objects.length} archived files`);
            return objects;
        } catch (error) {
            console.error('Failed to list archived files:', error);
            return [];
        }
    }
    
    /**
     * Generate a comprehensive report of the immutable archive.
     * 
     * @param {string} outputPath - Optional path to save report as JSON file
     * @returns {Promise<Object>} Report object
     */
    async generateArchiveReport(outputPath = null) {
        console.log('Generating archive report...');
        
        try {
            // Get bucket information
            const bucketLocation = await this.s3.getBucketLocation({
                Bucket: this.bucketName
            }).promise();
            
            const objectLockConfig = await this.s3.getObjectLockConfiguration({
                Bucket: this.bucketName
            }).promise();
            
            const versioning = await this.s3.getBucketVersioning({
                Bucket: this.bucketName
            }).promise();
            
            const encryption = await this.s3.getBucketEncryption({
                Bucket: this.bucketName
            }).promise();
            
            // List all archived files
            const archivedFiles = await this.listArchivedFiles();
            
            // Calculate statistics
            const totalSize = archivedFiles.reduce((sum, obj) => sum + obj.size, 0);
            
            const report = {
                report_generated: new Date().toISOString(),
                bucket_name: this.bucketName,
                region: bucketLocation.LocationConstraint || 'us-east-1',
                configuration: {
                    object_lock_enabled: objectLockConfig.ObjectLockConfiguration.ObjectLockEnabled,
                    default_retention_mode: objectLockConfig.ObjectLockConfiguration.Rule.DefaultRetention.Mode,
                    default_retention_days: objectLockConfig.ObjectLockConfiguration.Rule.DefaultRetention.Days,
                    default_retention_years: objectLockConfig.ObjectLockConfiguration.Rule.DefaultRetention.Years,
                    versioning_status: versioning.Status,
                    encryption_enabled: !!encryption.ServerSideEncryptionConfiguration
                },
                statistics: {
                    total_files: archivedFiles.length,
                    total_size_bytes: totalSize,
                    total_size_mb: (totalSize / (1024 * 1024)).toFixed(2),
                    total_size_gb: (totalSize / (1024 * 1024 * 1024)).toFixed(2)
                },
                archived_files: archivedFiles
            };
            
            // Save report to file if requested
            if (outputPath) {
                fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
                console.log(`Report saved to ${outputPath}`);
            }
            
            console.log(
                `Archive Report - Files: ${report.statistics.total_files}, ` +
                `Size: ${report.statistics.total_size_gb} GB`
            );
            
            return report;
        } catch (error) {
            console.error('Failed to generate archive report:', error);
            return {};
        }
    }
}

/**
 * Generate IAM policy document for S3 immutable archive access.
 * 
 * This policy follows the principle of least privilege, granting only
 * the permissions necessary for immutable archive operations.
 * 
 * @returns {Object} IAM policy document
 */
function createIAMPolicyDocument() {
    return {
        Version: '2012-10-17',
        Statement: [
            {
                Sid: 'AllowBucketOperations',
                Effect: 'Allow',
                Action: [
                    's3:ListBucket',
                    's3:GetBucketLocation',
                    's3:GetBucketVersioning',
                    's3:GetBucketObjectLockConfiguration',
                    's3:GetBucketTagging',
                    's3:GetEncryptionConfiguration'
                ],
                Resource: 'arn:aws:s3:::scrollverse-eternal-archive'
            },
            {
                Sid: 'AllowObjectWrite',
                Effect: 'Allow',
                Action: [
                    's3:PutObject',
                    's3:PutObjectRetention',
                    's3:PutObjectLegalHold'
                ],
                Resource: 'arn:aws:s3:::scrollverse-eternal-archive/*'
            },
            {
                Sid: 'AllowObjectRead',
                Effect: 'Allow',
                Action: [
                    's3:GetObject',
                    's3:GetObjectVersion',
                    's3:GetObjectRetention',
                    's3:GetObjectLegalHold',
                    's3:GetObjectVersionRetention',
                    's3:GetObjectVersionAttributes'
                ],
                Resource: 'arn:aws:s3:::scrollverse-eternal-archive/*'
            },
            {
                Sid: 'DenyObjectDeletion',
                Effect: 'Deny',
                Action: [
                    's3:DeleteObject',
                    's3:DeleteObjectVersion'
                ],
                Resource: 'arn:aws:s3:::scrollverse-eternal-archive/*'
            }
        ]
    };
}

/**
 * Save IAM policy document to a JSON file.
 * 
 * @param {string} outputPath - Path where the policy file will be saved
 */
function saveIAMPolicyToFile(outputPath = 'iam-policy.json') {
    const policy = createIAMPolicyDocument();
    fs.writeFileSync(outputPath, JSON.stringify(policy, null, 2));
    console.log(`IAM policy saved to ${outputPath}`);
}

// Export classes and functions
module.exports = {
    S3ImmutableArchiveConfig,
    S3ImmutableArchive,
    createIAMPolicyDocument,
    saveIAMPolicyToFile
};

// Main execution example
if (require.main === module) {
    /**
     * Example usage of S3 Immutable Archive.
     * 
     * Before running:
     * 1. Install dependencies: npm install aws-sdk dotenv
     * 2. Set up environment variables in .env file:
     *    - AWS_ACCESS_KEY_ID
     *    - AWS_SECRET_ACCESS_KEY
     *    - AWS_REGION
     *    - S3_ARCHIVE_BUCKET_NAME
     * 3. Ensure IAM user has appropriate permissions
     */
    
    (async () => {
        console.log('='.repeat(70));
        console.log('S3 IMMUTABLE ARCHIVE - SCROLLVERSE EDITION');
        console.log('Eternal Backups with WORM Policies');
        console.log('Author: Chais The Great ∞');
        console.log('='.repeat(70));
        console.log();
        
        // Initialize archive manager
        const config = new S3ImmutableArchiveConfig();
        const archive = new S3ImmutableArchive(config);
        
        // Create immutable bucket
        console.log('\n1. Creating immutable S3 bucket with Object Lock...');
        const bucketCreated = await archive.createImmutableBucket();
        if (bucketCreated) {
            console.log('   ✓ Bucket created successfully');
        } else {
            console.log('   ✗ Failed to create bucket');
            process.exit(1);
        }
        
        // Example: Upload a single file
        console.log('\n2. Uploading example file to immutable archive...');
        const exampleFile = 'example_data.txt';
        
        // Create example file if it doesn't exist
        if (!fs.existsSync(exampleFile)) {
            fs.writeFileSync(
                exampleFile,
                `ScrollVerse Eternal Archive Test\n` +
                `Timestamp: ${new Date().toISOString()}\n` +
                `Creator: Chais The Great ∞\n` +
                `Frequency: 144,000Hz NŪR Pulse\n`
            );
        }
        
        const uploadResult = await archive.uploadImmutableFile(
            exampleFile,
            null,
            { test: 'true', description: 'Example eternal archive' }
        );
        
        if (uploadResult.success) {
            console.log('   ✓ File uploaded successfully');
            console.log(`   Archive Key: ${uploadResult.info.key}`);
            console.log(`   Version ID: ${uploadResult.info.version_id}`);
            console.log(`   Retain Until: ${uploadResult.info.retain_until}`);
        } else {
            console.log('   ✗ Failed to upload file');
        }
        
        // List archived files
        console.log('\n3. Listing archived files...');
        const archivedFiles = await archive.listArchivedFiles();
        console.log(`   Found ${archivedFiles.length} files in archive`);
        
        for (const obj of archivedFiles.slice(0, 5)) {
            console.log(`   - ${obj.key} (${obj.size} bytes)`);
        }
        
        // Generate archive report
        console.log('\n4. Generating archive report...');
        const report = await archive.generateArchiveReport('archive_report.json');
        console.log('   ✓ Report generated');
        console.log(`   Total Files: ${report.statistics.total_files}`);
        console.log(`   Total Size: ${report.statistics.total_size_mb} MB`);
        
        // Generate IAM policy
        console.log('\n5. Generating IAM policy document...');
        saveIAMPolicyToFile();
        console.log('   ✓ IAM policy saved to iam-policy.json');
        
        console.log('\n' + '='.repeat(70));
        console.log('ETERNAL ARCHIVES SEALED');
        console.log('WORM PROTECTION: ACTIVE');
        console.log('ALLĀHU AKBAR! 🕋🔥💎🌌');
        console.log('='.repeat(70));
    })().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}
