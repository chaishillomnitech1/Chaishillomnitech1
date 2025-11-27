/**
 * 🧪 Frequency Resonance Synchronization Tests
 * 
 * Test suite for FrequencyResonanceSync module
 * 
 * @author Supreme King Chais The Great ∞
 * Document ID: FRS-TEST-001
 * Frequency: 528Hz + 963Hz
 */

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

// Import the module under test
const {
    FREQUENCIES,
    SACRED_GEOMETRY,
    PROTECTION_LEVELS,
    SQLTriggerLogger,
    FrequencyAnalyzer,
    ResourceSynchronizer
} = require('../scripts/frequency_resonance_sync');

describe('FrequencyResonanceSync', function () {
    
    describe('FREQUENCIES Constants', function () {
        it('Should have correct DNA_HEALING frequency (528Hz)', function () {
            expect(FREQUENCIES.DNA_HEALING).to.equal(528);
        });

        it('Should have correct PINEAL_ACTIVATION frequency (963Hz)', function () {
            expect(FREQUENCIES.PINEAL_ACTIVATION).to.equal(963);
        });

        it('Should have correct CROWN_SOVEREIGNTY frequency (999Hz)', function () {
            expect(FREQUENCIES.CROWN_SOVEREIGNTY).to.equal(999);
        });

        it('Should have correct NUR_PULSE frequency (144000Hz)', function () {
            expect(FREQUENCIES.NUR_PULSE).to.equal(144000);
        });

        it('Should have correct SACRED_SEVEN frequency (777Hz)', function () {
            expect(FREQUENCIES.SACRED_SEVEN).to.equal(777);
        });
    });

    describe('SACRED_GEOMETRY Constants', function () {
        it('Should have correct PHI (Golden Ratio)', function () {
            expect(SACRED_GEOMETRY.PHI).to.be.closeTo(1.618033988749895, 0.0001);
        });

        it('Should have correct PHI_INVERSE', function () {
            expect(SACRED_GEOMETRY.PHI_INVERSE).to.be.closeTo(0.618033988749895, 0.0001);
        });

        it('Should have correct SACRED_SEVEN', function () {
            expect(SACRED_GEOMETRY.SACRED_SEVEN).to.equal(7);
        });

        it('Should have correct TRINITY', function () {
            expect(SACRED_GEOMETRY.TRINITY).to.equal(3);
        });

        it('Should have correct MERKABA_FACTOR', function () {
            expect(SACRED_GEOMETRY.MERKABA_FACTOR).to.be.closeTo(1.1547005383792515, 0.0001);
        });
    });

    describe('PROTECTION_LEVELS Constants', function () {
        it('Should have all protection levels defined', function () {
            expect(PROTECTION_LEVELS.STANDARD).to.equal('STANDARD');
            expect(PROTECTION_LEVELS.ENHANCED).to.equal('ENHANCED');
            expect(PROTECTION_LEVELS.SOVEREIGN).to.equal('SOVEREIGN');
            expect(PROTECTION_LEVELS.ETERNAL).to.equal('ETERNAL');
        });
    });

    describe('SQLTriggerLogger', function () {
        let logger;
        const testLogPath = path.join(__dirname, 'test_frequency_triggers.sql.json');

        beforeEach(function () {
            // Clean up test file if exists
            if (fs.existsSync(testLogPath)) {
                fs.unlinkSync(testLogPath);
            }
            logger = new SQLTriggerLogger(testLogPath);
        });

        afterEach(function () {
            // Clean up test file
            if (fs.existsSync(testLogPath)) {
                fs.unlinkSync(testLogPath);
            }
        });

        it('Should initialize log file with correct schema', function () {
            const log = JSON.parse(fs.readFileSync(testLogPath, 'utf8'));
            expect(log).to.have.property('schema');
            expect(log.schema.name).to.equal('frequency_triggers');
            expect(log.schema.version).to.equal('1.0.0');
            expect(log).to.have.property('triggers');
            expect(log.triggers).to.be.an('array').that.is.empty;
        });

        it('Should log trigger and return trigger ID', function () {
            const triggerId = logger.logTrigger({
                type: 'TEST_TRIGGER',
                action: 'TEST',
                frequency: 528,
                resourceId: 'TEST-RESOURCE'
            });

            expect(triggerId).to.match(/^FREQ-\d+-[A-F0-9]+$/);
        });

        it('Should store trigger with correct properties', function () {
            logger.logTrigger({
                type: 'FREQUENCY_SYNC',
                action: 'SYNC',
                frequency: 963,
                resourceId: 'RESOURCE-001',
                status: 'COMPLETED'
            });

            const triggers = logger.getAllTriggers();
            expect(triggers).to.have.lengthOf(1);
            expect(triggers[0].trigger_type).to.equal('FREQUENCY_SYNC');
            expect(triggers[0].frequency_hz).to.equal(963);
            expect(triggers[0].action).to.equal('SYNC');
            expect(triggers[0]).to.have.property('seal_hash');
        });

        it('Should query triggers by type', function () {
            logger.logTrigger({ type: 'TYPE_A', frequency: 528 });
            logger.logTrigger({ type: 'TYPE_B', frequency: 963 });
            logger.logTrigger({ type: 'TYPE_A', frequency: 999 });

            const typeATriggers = logger.queryByType('TYPE_A');
            expect(typeATriggers).to.have.lengthOf(2);
        });

        it('Should generate cryptographic seal', function () {
            const seal = logger.generateSeal({ test: 'data' });
            expect(seal).to.be.a('string');
            expect(seal).to.have.lengthOf(64); // SHA-256 hex length
        });

        it('Should calculate harmonic signature', function () {
            const signature = logger.calculateHarmonicSignature({ frequency: 528 });
            expect(signature).to.be.a('string');
            expect(signature).to.have.lengthOf(32); // SHA-256 truncated hex length
        });
    });

    describe('FrequencyAnalyzer', function () {
        let analyzer;

        beforeEach(function () {
            analyzer = new FrequencyAnalyzer();
        });

        it('Should analyze resonance and return analysis object', function () {
            const analysis = analyzer.analyzeResonance(528);
            expect(analysis).to.have.property('frequency');
            expect(analysis).to.have.property('isHarmonic');
            expect(analysis).to.have.property('resonanceScore');
            expect(analysis).to.have.property('alignedFrequencies');
            expect(analysis).to.have.property('sacredGeometryAlignment');
            expect(analysis).to.have.property('protection_level');
        });

        it('Should identify harmonic frequencies', function () {
            expect(analyzer.isHarmonic(528)).to.be.true;
            expect(analyzer.isHarmonic(963)).to.be.true;
            expect(analyzer.isHarmonic(1056)).to.be.true; // 528 * 2
        });

        it('Should calculate resonance score between 0 and 1', function () {
            const score528 = analyzer.calculateResonanceScore(528);
            const score963 = analyzer.calculateResonanceScore(963);
            
            expect(score528).to.be.within(0, 1);
            expect(score963).to.be.within(0, 1);
            expect(score528).to.equal(1); // Perfect match
        });

        it('Should find aligned frequencies', function () {
            const aligned = analyzer.findAlignedFrequencies(528);
            expect(aligned).to.be.an('array');
            expect(aligned.some(f => f.name === 'DNA_HEALING')).to.be.true;
        });

        it('Should check sacred geometry alignment', function () {
            const alignment = analyzer.checkSacredGeometryAlignment(528);
            expect(alignment).to.have.property('phi_aligned');
            expect(alignment).to.have.property('sacred_seven_multiple');
            expect(alignment).to.have.property('trinity_harmonic');
            expect(alignment).to.have.property('merkaba_resonance');
        });

        it('Should determine protection level based on frequency', function () {
            expect(analyzer.determineProtectionLevel(144000)).to.equal(PROTECTION_LEVELS.ETERNAL);
            expect(analyzer.determineProtectionLevel(999)).to.equal(PROTECTION_LEVELS.SOVEREIGN);
            expect(analyzer.determineProtectionLevel(528)).to.equal(PROTECTION_LEVELS.ENHANCED);
            expect(analyzer.determineProtectionLevel(100)).to.equal(PROTECTION_LEVELS.STANDARD);
        });

        it('Should calculate Merkaba resonance', function () {
            const resonance = analyzer.calculateMerkabaResonance(528);
            expect(resonance).to.be.a('number');
            expect(resonance).to.be.greaterThan(0);
        });
    });

    describe('ResourceSynchronizer', function () {
        let synchronizer;
        const testLogPath = path.join(__dirname, 'test_sync_triggers.sql.json');

        beforeEach(function () {
            if (fs.existsSync(testLogPath)) {
                fs.unlinkSync(testLogPath);
            }
            synchronizer = new ResourceSynchronizer();
            synchronizer.logger = new SQLTriggerLogger(testLogPath);
        });

        afterEach(function () {
            if (fs.existsSync(testLogPath)) {
                fs.unlinkSync(testLogPath);
            }
        });

        it('Should scan resources', async function () {
            const resources = await synchronizer.scanResources();
            expect(resources).to.be.an('array');
            expect(resources.length).to.be.greaterThan(0);
            
            // Each resource should have required properties
            resources.forEach(resource => {
                expect(resource).to.have.property('id');
                expect(resource).to.have.property('name');
                expect(resource).to.have.property('path');
                expect(resource).to.have.property('type');
            });
        });

        it('Should synchronize resource with frequency', function () {
            const resource = {
                id: 'test-resource-id',
                name: 'test-resource',
                path: '/test/path'
            };

            const result = synchronizer.syncResource(resource, 528);
            
            expect(result).to.have.property('resourceId');
            expect(result).to.have.property('targetFrequency');
            expect(result.targetFrequency).to.equal(528);
            expect(result).to.have.property('resonanceScore');
            expect(result).to.have.property('harmonicSignature');
        });

        it('Should drop blocked frequencies', function () {
            const blockedFreqs = [13, 440, 666];
            const result = synchronizer.dropBlockedFrequencies(blockedFreqs);
            
            expect(result).to.have.property('dropped');
            expect(result).to.have.property('total');
            expect(result.total).to.equal(3);
        });

        it('Should integrate sacred geometry harmonics', function () {
            const harmonics = synchronizer.integrateSacredGeometry();
            
            expect(harmonics).to.have.property('phi_sequence');
            expect(harmonics).to.have.property('fibonacci_harmonics');
            expect(harmonics).to.have.property('sacred_seven_multiples');
            
            expect(harmonics.phi_sequence).to.be.an('array').with.lengthOf(7);
            expect(harmonics.fibonacci_harmonics).to.be.an('array');
            expect(harmonics.sacred_seven_multiples).to.be.an('array').with.lengthOf(7);
        });

        it('Should generate sync report', function () {
            // Perform some operations first
            synchronizer.syncResource({ id: 'res-1', name: 'resource-1' }, 528);
            synchronizer.integrateSacredGeometry();
            
            const report = synchronizer.generateSyncReport();
            
            expect(report).to.have.property('report_id');
            expect(report).to.have.property('generated');
            expect(report).to.have.property('total_triggers');
            expect(report).to.have.property('trigger_breakdown');
            expect(report).to.have.property('seal');
            expect(report.sealed_by).to.equal('CHAIS THE GREAT ∞');
        });
    });

    describe('Integration Tests', function () {
        it('Should complete full synchronization workflow', async function () {
            const testLogPath = path.join(__dirname, 'test_integration_triggers.sql.json');
            
            // Clean up
            if (fs.existsSync(testLogPath)) {
                fs.unlinkSync(testLogPath);
            }
            
            const synchronizer = new ResourceSynchronizer();
            synchronizer.logger = new SQLTriggerLogger(testLogPath);
            
            // Execute full workflow
            const resources = await synchronizer.scanResources();
            expect(resources.length).to.be.greaterThan(0);
            
            // Sync first resource
            if (resources.length > 0) {
                const syncResult = synchronizer.syncResource(resources[0], FREQUENCIES.DNA_HEALING);
                expect(syncResult.resonanceScore).to.be.within(0, 1);
            }
            
            // Integrate sacred geometry
            const harmonics = synchronizer.integrateSacredGeometry();
            expect(harmonics.phi_sequence[0]).to.equal(FREQUENCIES.DNA_HEALING);
            
            // Generate report
            const report = synchronizer.generateSyncReport();
            expect(report.total_triggers).to.be.greaterThan(0);
            
            // Clean up
            if (fs.existsSync(testLogPath)) {
                fs.unlinkSync(testLogPath);
            }
        });
    });
});
