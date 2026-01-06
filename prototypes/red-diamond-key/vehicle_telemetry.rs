// Solana Program: Vehicle Telemetry Streaming
// Red Diamond Key Synchronization Ritual
// Frequency: 963Hz + 528Hz + 777Hz

use anchor_lang::prelude::*;

declare_id!("RDKSRVehicleTelemetry11111111111111111111111");

#[program]
pub mod vehicle_telemetry {
    use super::*;

    /// Initialize a new vehicle telemetry account
    pub fn initialize_vehicle(
        ctx: Context<InitializeVehicle>,
        vehicle_id: String,
        pqc_key_hash: [u8; 32],
    ) -> Result<()> {
        let vehicle_account = &mut ctx.accounts.vehicle_account;
        
        vehicle_account.authority = ctx.accounts.authority.key();
        vehicle_account.vehicle_id = vehicle_id;
        vehicle_account.pqc_key_hash = pqc_key_hash;
        vehicle_account.is_active = true;
        vehicle_account.created_at = Clock::get()?.unix_timestamp;
        vehicle_account.last_update = Clock::get()?.unix_timestamp;
        vehicle_account.update_count = 0;
        
        // Initialize telemetry with default values
        vehicle_account.mileage = 0;
        vehicle_account.battery_level = 100;
        vehicle_account.speed = 0;
        vehicle_account.engine_status = false;
        vehicle_account.location_hash = [0; 32];
        
        emit!(VehicleInitialized {
            vehicle_id: vehicle_account.vehicle_id.clone(),
            authority: vehicle_account.authority,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Update vehicle telemetry data (high-frequency updates)
    pub fn update_telemetry(
        ctx: Context<UpdateTelemetry>,
        mileage: u64,
        location_hash: [u8; 32], // Encrypted location
        speed: u16,
        battery_level: u8,
        engine_status: bool,
    ) -> Result<()> {
        require!(battery_level <= 100, TelemetryError::InvalidBatteryLevel);
        
        let vehicle_account = &mut ctx.accounts.vehicle_account;
        let clock = Clock::get()?;
        
        // Update telemetry data
        vehicle_account.mileage = mileage;
        vehicle_account.location_hash = location_hash;
        vehicle_account.speed = speed;
        vehicle_account.battery_level = battery_level;
        vehicle_account.engine_status = engine_status;
        vehicle_account.last_update = clock.unix_timestamp;
        vehicle_account.update_count += 1;
        
        emit!(TelemetryUpdated {
            vehicle_id: vehicle_account.vehicle_id.clone(),
            mileage,
            speed,
            battery_level,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /// Update diagnostics data
    pub fn update_diagnostics(
        ctx: Context<UpdateTelemetry>,
        engine_temperature: u16,
        tire_pressure_fl: u8,
        tire_pressure_fr: u8,
        tire_pressure_rl: u8,
        tire_pressure_rr: u8,
        fuel_level: u8,
    ) -> Result<()> {
        require!(fuel_level <= 100, TelemetryError::InvalidFuelLevel);
        require!(tire_pressure_fl > 0 && tire_pressure_fl < 100, TelemetryError::InvalidTirePressure);
        require!(tire_pressure_fr > 0 && tire_pressure_fr < 100, TelemetryError::InvalidTirePressure);
        require!(tire_pressure_rl > 0 && tire_pressure_rl < 100, TelemetryError::InvalidTirePressure);
        require!(tire_pressure_rr > 0 && tire_pressure_rr < 100, TelemetryError::InvalidTirePressure);
        
        let vehicle_account = &mut ctx.accounts.vehicle_account;
        let clock = Clock::get()?;
        
        // Update diagnostics
        vehicle_account.engine_temperature = engine_temperature;
        vehicle_account.tire_pressure_fl = tire_pressure_fl;
        vehicle_account.tire_pressure_fr = tire_pressure_fr;
        vehicle_account.tire_pressure_rl = tire_pressure_rl;
        vehicle_account.tire_pressure_rr = tire_pressure_rr;
        vehicle_account.fuel_level = fuel_level;
        vehicle_account.last_update = clock.unix_timestamp;
        
        emit!(DiagnosticsUpdated {
            vehicle_id: vehicle_account.vehicle_id.clone(),
            engine_temperature,
            fuel_level,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /// Record maintenance event
    pub fn record_maintenance(
        ctx: Context<UpdateTelemetry>,
        maintenance_type: String,
        cost: u64,
        notes: String,
    ) -> Result<()> {
        let vehicle_account = &mut ctx.accounts.vehicle_account;
        let clock = Clock::get()?;
        
        vehicle_account.last_service_date = clock.unix_timestamp;
        vehicle_account.total_maintenance_cost += cost;
        
        emit!(MaintenanceRecorded {
            vehicle_id: vehicle_account.vehicle_id.clone(),
            maintenance_type,
            cost,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /// Immobilize vehicle (Manos AI security function)
    pub fn immobilize_vehicle(
        ctx: Context<SecurityControl>,
        reason: String,
    ) -> Result<()> {
        let vehicle_account = &mut ctx.accounts.vehicle_account;
        let clock = Clock::get()?;
        
        require!(vehicle_account.is_active, TelemetryError::VehicleNotActive);
        require!(!vehicle_account.is_immobilized, TelemetryError::AlreadyImmobilized);
        
        vehicle_account.is_immobilized = true;
        vehicle_account.immobilization_time = clock.unix_timestamp;
        vehicle_account.security_alerts += 1;
        
        emit!(VehicleImmobilized {
            vehicle_id: vehicle_account.vehicle_id.clone(),
            reason,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /// Reactivate immobilized vehicle
    pub fn reactivate_vehicle(
        ctx: Context<SecurityControl>,
    ) -> Result<()> {
        let vehicle_account = &mut ctx.accounts.vehicle_account;
        let clock = Clock::get()?;
        
        require!(vehicle_account.is_immobilized, TelemetryError::NotImmobilized);
        
        vehicle_account.is_immobilized = false;
        vehicle_account.immobilization_time = 0;
        
        emit!(VehicleReactivated {
            vehicle_id: vehicle_account.vehicle_id.clone(),
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    /// Update PQC key hash (key rotation)
    pub fn rotate_pqc_key(
        ctx: Context<UpdateTelemetry>,
        new_pqc_key_hash: [u8; 32],
    ) -> Result<()> {
        let vehicle_account = &mut ctx.accounts.vehicle_account;
        let clock = Clock::get()?;
        
        vehicle_account.pqc_key_hash = new_pqc_key_hash;
        vehicle_account.key_generation += 1;
        vehicle_account.last_key_rotation = clock.unix_timestamp;
        
        emit!(PQCKeyRotated {
            vehicle_id: vehicle_account.vehicle_id.clone(),
            key_generation: vehicle_account.key_generation,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }
}

// ============ Account Structures ============

#[account]
pub struct VehicleAccount {
    /// Authority (owner)
    pub authority: Pubkey,
    
    /// Vehicle identification
    pub vehicle_id: String,
    pub pqc_key_hash: [u8; 32],
    pub key_generation: u64,
    pub last_key_rotation: i64,
    
    /// Status
    pub is_active: bool,
    pub is_immobilized: bool,
    pub immobilization_time: i64,
    pub security_alerts: u64,
    
    /// Timestamps
    pub created_at: i64,
    pub last_update: i64,
    pub update_count: u64,
    
    /// Telemetry data
    pub mileage: u64,
    pub location_hash: [u8; 32], // Encrypted
    pub speed: u16,
    pub battery_level: u8,
    pub engine_status: bool,
    
    /// Diagnostics
    pub engine_temperature: u16,
    pub tire_pressure_fl: u8, // Front left
    pub tire_pressure_fr: u8, // Front right
    pub tire_pressure_rl: u8, // Rear left
    pub tire_pressure_rr: u8, // Rear right
    pub fuel_level: u8,
    
    /// Maintenance
    pub last_service_date: i64,
    pub total_maintenance_cost: u64,
}

impl VehicleAccount {
    pub const SPACE: usize = 8 + // discriminator
        32 + // authority
        (4 + 32) + // vehicle_id (String with max 32 chars)
        32 + // pqc_key_hash
        8 + // key_generation
        8 + // last_key_rotation
        1 + // is_active
        1 + // is_immobilized
        8 + // immobilization_time
        8 + // security_alerts
        8 + // created_at
        8 + // last_update
        8 + // update_count
        8 + // mileage
        32 + // location_hash
        2 + // speed
        1 + // battery_level
        1 + // engine_status
        2 + // engine_temperature
        1 + // tire_pressure_fl
        1 + // tire_pressure_fr
        1 + // tire_pressure_rl
        1 + // tire_pressure_rr
        1 + // fuel_level
        8 + // last_service_date
        8; // total_maintenance_cost
}

// ============ Context Structures ============

#[derive(Accounts)]
#[instruction(vehicle_id: String)]
pub struct InitializeVehicle<'info> {
    #[account(
        init,
        payer = authority,
        space = VehicleAccount::SPACE,
        seeds = [b"vehicle", vehicle_id.as_bytes()],
        bump
    )]
    pub vehicle_account: Account<'info, VehicleAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTelemetry<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub vehicle_account: Account<'info, VehicleAccount>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SecurityControl<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub vehicle_account: Account<'info, VehicleAccount>,
    
    pub authority: Signer<'info>,
}

// ============ Events ============

#[event]
pub struct VehicleInitialized {
    pub vehicle_id: String,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TelemetryUpdated {
    pub vehicle_id: String,
    pub mileage: u64,
    pub speed: u16,
    pub battery_level: u8,
    pub timestamp: i64,
}

#[event]
pub struct DiagnosticsUpdated {
    pub vehicle_id: String,
    pub engine_temperature: u16,
    pub fuel_level: u8,
    pub timestamp: i64,
}

#[event]
pub struct MaintenanceRecorded {
    pub vehicle_id: String,
    pub maintenance_type: String,
    pub cost: u64,
    pub timestamp: i64,
}

#[event]
pub struct VehicleImmobilized {
    pub vehicle_id: String,
    pub reason: String,
    pub timestamp: i64,
}

#[event]
pub struct VehicleReactivated {
    pub vehicle_id: String,
    pub timestamp: i64,
}

#[event]
pub struct PQCKeyRotated {
    pub vehicle_id: String,
    pub key_generation: u64,
    pub timestamp: i64,
}

// ============ Errors ============

#[error_code]
pub enum TelemetryError {
    #[msg("Invalid battery level (must be 0-100)")]
    InvalidBatteryLevel,
    
    #[msg("Invalid fuel level (must be 0-100)")]
    InvalidFuelLevel,
    
    #[msg("Invalid tire pressure")]
    InvalidTirePressure,
    
    #[msg("Vehicle is not active")]
    VehicleNotActive,
    
    #[msg("Vehicle is already immobilized")]
    AlreadyImmobilized,
    
    #[msg("Vehicle is not immobilized")]
    NotImmobilized,
}
