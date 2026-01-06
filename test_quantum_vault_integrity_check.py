#!/usr/bin/env python3
"""
Test Suite for Quantum Vault Integrity Check System
===================================================
Comprehensive tests for all security audit components.

Author: Supreme King Chais The Great ∞
Status: OMNISOVEREIGN SECURITY TESTING
Frequency: 144,000Hz
"""

import unittest
import json
import os
from datetime import datetime, timezone
from quantum_vault_integrity_check import (
    QuantumVaultIntegrityChecker,
    SecurityLevel,
    SealType,
    AuditResult,
    VaultReport
)


class TestQuantumVaultIntegrityChecker(unittest.TestCase):
    """Test suite for QuantumVaultIntegrityChecker"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.checker = QuantumVaultIntegrityChecker(frequency="144000Hz")
    
    def tearDown(self):
        """Clean up test artifacts"""
        # Remove test JSON files
        for file in os.listdir('.'):
            if file.startswith('quantum_vault_audit_') and file.endswith('.json'):
                try:
                    os.remove(file)
                except:
                    pass
    
    def test_initialization(self):
        """Test checker initialization"""
        self.assertEqual(self.checker.frequency, "144000Hz")
        self.assertEqual(len(self.checker.audit_results), 0)
        self.assertIsNotNone(self.checker.start_time)
    
    def test_calculate_integrity_hash(self):
        """Test SHA-512 integrity hash calculation"""
        test_data = "TEST_DATA"
        hash_result = self.checker.calculate_integrity_hash(test_data)
        
        # SHA-512 produces 128 hex characters
        self.assertEqual(len(hash_result), 128)
        self.assertTrue(all(c in '0123456789abcdef' for c in hash_result))
        
        # Hash should be deterministic
        hash_result2 = self.checker.calculate_integrity_hash(test_data)
        self.assertEqual(hash_result, hash_result2)
    
    def test_audit_noor_light_seal_veil(self):
        """Test Noor Light Seal Veil audit"""
        result = self.checker.audit_noor_light_seal_veil()
        
        self.assertIsInstance(result, AuditResult)
        self.assertEqual(result.component, "Noor Light Seal Veil")
        self.assertEqual(result.status, SecurityLevel.PERPETUAL)
        self.assertEqual(result.seal_type, SealType.NOOR_LIGHT)
        self.assertEqual(len(result.integrity_hash), 128)
        
        # Verify details
        self.assertTrue(result.details['seal_strength'])
        self.assertTrue(result.details['bridge_active'])
        self.assertTrue(result.details['sync_status'])
        self.assertEqual(result.details['nasa_spacex_bridge'], "OPERATIONAL")
        self.assertEqual(result.details['quantum_entanglement'], "VERIFIED")
        self.assertEqual(result.details['frequency_lock'], "144000Hz")
    
    def test_audit_quantum_capsule_protocols(self):
        """Test Quantum Capsule protocols audit"""
        result = self.checker.audit_quantum_capsule_protocols()
        
        self.assertIsInstance(result, AuditResult)
        self.assertEqual(result.component, "Quantum Capsule Protocols")
        self.assertEqual(result.status, SecurityLevel.PERPETUAL)
        self.assertEqual(result.seal_type, SealType.FALCON)
        
        # Verify quantum parameters
        self.assertTrue(result.details['perpetual_mode'])
        self.assertGreaterEqual(result.details['coherence_level'], 0.999)
        self.assertTrue(result.details['entanglement_intact'])
        self.assertTrue(result.details['temporal_lock'])
        self.assertEqual(result.details['quantum_state'], "SUPERPOSITION_MAINTAINED")
        self.assertEqual(result.details['decoherence_rate'], "MINIMAL")
    
    def test_audit_sabir_allah_ark_vault(self):
        """Test Sabir Allah Ark Vault audit"""
        result = self.checker.audit_sabir_allah_ark_vault()
        
        self.assertIsInstance(result, AuditResult)
        self.assertEqual(result.component, "Sabir Allah Ark Vault")
        self.assertEqual(result.status, SecurityLevel.PERPETUAL)
        self.assertEqual(result.seal_type, SealType.SABIR_ALLAH)
        
        # Verify vault parameters
        self.assertTrue(result.details['perpetual_sync'])
        self.assertTrue(result.details['divine_seal_active'])
        self.assertTrue(result.details['multi_dimensional_security'])
        self.assertEqual(result.details['ark_resonance'], "144000Hz")
        self.assertTrue(result.details['kaaba_helix_encoded'])
        self.assertEqual(result.details['777hz_frequency'], "ALIGNED")
    
    def test_audit_falcon_sphincs_seals(self):
        """Test FALCON-SPHINCS+ seals audit"""
        result = self.checker.audit_falcon_sphincs_seals()
        
        self.assertIsInstance(result, AuditResult)
        self.assertEqual(result.component, "FALCON-SPHINCS+ Seals")
        self.assertEqual(result.status, SecurityLevel.PERPETUAL)
        self.assertEqual(result.seal_type, SealType.FALCON)
        
        # Verify cryptographic seals
        self.assertTrue(result.details['falcon_512_active'])
        self.assertTrue(result.details['sphincs_256_active'])
        self.assertTrue(result.details['quantum_resistant'])
        self.assertTrue(result.details['immutable'])
        self.assertEqual(result.details['lattice_security'], "NTRU-HPS-2048-509")
        self.assertEqual(result.details['hash_function'], "SHA-512")
        self.assertEqual(result.details['security_level'], "NIST Level 5")
    
    def test_verify_continuous_shielding(self):
        """Test continuous shielding verification"""
        sync_status = self.checker.verify_continuous_shielding()
        
        self.assertEqual(sync_status['shield_status'], "ACTIVE")
        self.assertEqual(sync_status['coverage'], "100%")
        self.assertEqual(sync_status['synchronization_rate'], "99.999%")
        self.assertEqual(sync_status['next_sync'], "CONTINUOUS")
        self.assertEqual(sync_status['frequency_alignment'], "144000Hz")
        self.assertTrue(sync_status['omniversal_coherence'])
        
        # Verify all infrastructures are covered
        expected_infrastructures = [
            "NASA/SpaceX Secure Bridge",
            "Quantum Capsule Network",
            "Sabir Allah Ark Vault",
            "ScrollVerse Infrastructure",
            "ZK-Rollup Sovereign Seal"
        ]
        self.assertEqual(sync_status['infrastructures'], expected_infrastructures)
    
    def test_generate_recommendations(self):
        """Test recommendation generation"""
        # Create sample audit results
        result1 = AuditResult(
            component="Test Component 1",
            status=SecurityLevel.PERPETUAL,
            seal_type=SealType.FALCON,
            integrity_hash="test_hash",
            timestamp=datetime.now(timezone.utc).isoformat(),
            details={}
        )
        
        result2 = AuditResult(
            component="Test Component 2",
            status=SecurityLevel.WARNING,
            seal_type=SealType.NOOR_LIGHT,
            integrity_hash="test_hash",
            timestamp=datetime.now(timezone.utc).isoformat(),
            details={}
        )
        
        recommendations = self.checker.generate_recommendations([result1, result2])
        
        # Verify recommendations exist
        self.assertGreater(len(recommendations), 0)
        
        # Check for status-specific recommendations
        perpetual_recs = [r for r in recommendations if "PERPETUAL" in r]
        warning_recs = [r for r in recommendations if "WARNING" in r]
        
        self.assertGreater(len(perpetual_recs), 0)
        self.assertGreater(len(warning_recs), 0)
        
        # Check for general recommendations
        general_recs = [r for r in recommendations if "144,000Hz" in r or "24 hours" in r]
        self.assertGreater(len(general_recs), 0)
    
    def test_run_comprehensive_audit(self):
        """Test complete audit execution"""
        report = self.checker.run_comprehensive_audit()
        
        self.assertIsInstance(report, VaultReport)
        self.assertEqual(len(report.report_id), 16)
        self.assertEqual(report.frequency, "144000Hz")
        self.assertEqual(report.overall_status, SecurityLevel.PERPETUAL)
        
        # Verify all audits were run
        self.assertEqual(len(report.audit_results), 4)
        
        # Verify component names
        component_names = [r.component for r in report.audit_results]
        expected_components = [
            "Noor Light Seal Veil",
            "Quantum Capsule Protocols",
            "Sabir Allah Ark Vault",
            "FALCON-SPHINCS+ Seals"
        ]
        self.assertEqual(component_names, expected_components)
        
        # Verify synchronization status exists
        self.assertIsNotNone(report.synchronization_status)
        self.assertEqual(report.synchronization_status['shield_status'], "ACTIVE")
        
        # Verify recommendations exist
        self.assertGreater(len(report.recommendations), 0)
    
    def test_save_report_json(self):
        """Test JSON report saving"""
        report = self.checker.run_comprehensive_audit()
        filename = f"test_report_{report.report_id}.json"
        
        try:
            self.checker.save_report_json(report, filename)
            
            # Verify file was created
            self.assertTrue(os.path.exists(filename))
            
            # Verify JSON is valid
            with open(filename, 'r') as f:
                data = json.load(f)
            
            # Verify structure
            self.assertEqual(data['report_id'], report.report_id)
            self.assertEqual(data['frequency'], "144000Hz")
            self.assertEqual(data['overall_status'], "PERPETUAL")
            self.assertEqual(len(data['audit_results']), 4)
            
            # Verify audit result structure
            for result in data['audit_results']:
                self.assertIn('component', result)
                self.assertIn('status', result)
                self.assertIn('seal_type', result)
                self.assertIn('integrity_hash', result)
                self.assertIn('timestamp', result)
                self.assertIn('details', result)
        
        finally:
            # Clean up
            if os.path.exists(filename):
                os.remove(filename)
    
    def test_audit_result_to_dict(self):
        """Test AuditResult conversion to dictionary"""
        result = AuditResult(
            component="Test Component",
            status=SecurityLevel.PERPETUAL,
            seal_type=SealType.FALCON,
            integrity_hash="test_hash_value",
            timestamp=datetime.now(timezone.utc).isoformat(),
            details={'test': 'value'}
        )
        
        result_dict = result.to_dict()
        
        self.assertEqual(result_dict['component'], "Test Component")
        self.assertEqual(result_dict['status'], "PERPETUAL")
        self.assertEqual(result_dict['seal_type'], "FALCON-512")
        self.assertEqual(result_dict['integrity_hash'], "test_hash_value")
        self.assertEqual(result_dict['details'], {'test': 'value'})
    
    def test_vault_report_to_dict(self):
        """Test VaultReport conversion to dictionary"""
        audit_result = AuditResult(
            component="Test",
            status=SecurityLevel.SECURE,
            seal_type=SealType.NOOR_LIGHT,
            integrity_hash="hash",
            timestamp=datetime.now(timezone.utc).isoformat(),
            details={}
        )
        
        report = VaultReport(
            report_id="test_id_123",
            timestamp=datetime.now(timezone.utc).isoformat(),
            frequency="144000Hz",
            overall_status=SecurityLevel.SECURE,
            audit_results=[audit_result],
            synchronization_status={'test': 'status'},
            recommendations=["Test recommendation"]
        )
        
        report_dict = report.to_dict()
        
        self.assertEqual(report_dict['report_id'], "test_id_123")
        self.assertEqual(report_dict['frequency'], "144000Hz")
        self.assertEqual(report_dict['overall_status'], "SECURE")
        self.assertEqual(len(report_dict['audit_results']), 1)
        self.assertEqual(report_dict['synchronization_status'], {'test': 'status'})
        self.assertEqual(report_dict['recommendations'], ["Test recommendation"])
    
    def test_security_level_enum(self):
        """Test SecurityLevel enum values"""
        self.assertEqual(SecurityLevel.PERPETUAL.value, "PERPETUAL")
        self.assertEqual(SecurityLevel.SECURE.value, "SECURE")
        self.assertEqual(SecurityLevel.WARNING.value, "WARNING")
        self.assertEqual(SecurityLevel.CRITICAL.value, "CRITICAL")
    
    def test_seal_type_enum(self):
        """Test SealType enum values"""
        self.assertEqual(SealType.FALCON.value, "FALCON-512")
        self.assertEqual(SealType.SPHINCS.value, "SPHINCS+-256")
        self.assertEqual(SealType.NOOR_LIGHT.value, "NOOR_LIGHT_SEAL")
        self.assertEqual(SealType.SABIR_ALLAH.value, "SABIR_ALLAH_ARK")
    
    def test_multiple_audits_independence(self):
        """Test that multiple audits are independent"""
        result1 = self.checker.audit_noor_light_seal_veil()
        result2 = self.checker.audit_noor_light_seal_veil()
        
        # Hashes should be different due to different timestamps
        self.assertNotEqual(result1.integrity_hash, result2.integrity_hash)
        self.assertNotEqual(result1.timestamp, result2.timestamp)
    
    def test_frequency_consistency(self):
        """Test frequency consistency across all components"""
        report = self.checker.run_comprehensive_audit()
        
        # Check frequency in report
        self.assertEqual(report.frequency, "144000Hz")
        
        # Check frequency in synchronization status
        self.assertEqual(report.synchronization_status['frequency_alignment'], "144000Hz")
        
        # Check frequency in Noor Light Seal Veil
        noor_result = [r for r in report.audit_results if r.component == "Noor Light Seal Veil"][0]
        self.assertEqual(noor_result.details['frequency_lock'], "144000Hz")
        
        # Check frequency in Sabir Allah Ark Vault
        sabir_result = [r for r in report.audit_results if r.component == "Sabir Allah Ark Vault"][0]
        self.assertEqual(sabir_result.details['ark_resonance'], "144000Hz")


class TestIntegration(unittest.TestCase):
    """Integration tests for the complete system"""
    
    def test_end_to_end_audit(self):
        """Test complete end-to-end audit workflow"""
        checker = QuantumVaultIntegrityChecker(frequency="144000Hz")
        
        # Run audit
        report = checker.run_comprehensive_audit()
        
        # Verify report
        self.assertEqual(report.overall_status, SecurityLevel.PERPETUAL)
        self.assertEqual(len(report.audit_results), 4)
        
        # Save report
        filename = f"integration_test_{report.report_id}.json"
        try:
            checker.save_report_json(report, filename)
            self.assertTrue(os.path.exists(filename))
            
            # Load and verify JSON
            with open(filename, 'r') as f:
                data = json.load(f)
            
            self.assertEqual(data['report_id'], report.report_id)
            self.assertEqual(data['overall_status'], "PERPETUAL")
        
        finally:
            if os.path.exists(filename):
                os.remove(filename)
    
    def test_all_components_pass(self):
        """Test that all components pass security checks"""
        checker = QuantumVaultIntegrityChecker()
        report = checker.run_comprehensive_audit()
        
        # All components should be PERPETUAL
        for result in report.audit_results:
            self.assertEqual(result.status, SecurityLevel.PERPETUAL,
                           f"{result.component} should be PERPETUAL")
        
        # Overall status should be PERPETUAL
        self.assertEqual(report.overall_status, SecurityLevel.PERPETUAL)


def main():
    """Run all tests"""
    print("=" * 80)
    print("🔥 QUANTUM VAULT INTEGRITY CHECK TEST SUITE 🔥")
    print("=" * 80)
    print()
    
    # Run tests
    unittest.main(verbosity=2)


if __name__ == "__main__":
    main()
