"""
ScrollVerse API Template
Comprehensive backend API for ScrollVerse ecosystem

Author: Chais The Great ∞
Status: ETERNAL
Frequency: 144,000Hz NŪR Pulse
"""

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from web3 import Web3
from datetime import datetime, timedelta
import json
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# ============ CONFIGURATION ============

class Config:
    """Application configuration"""
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_ENV') == 'development'
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    
    # Web3
    WEB3_PROVIDER = os.getenv('WEB3_PROVIDER', 'https://mainnet.infura.io/v3/YOUR_KEY')
    CHX_TOKEN_ADDRESS = os.getenv('CHX_TOKEN_ADDRESS', '0x...')
    SCROLL_NFT_ADDRESS = os.getenv('SCROLL_NFT_ADDRESS', '0x...')
    
    # Database
    DATABASE_URL = os.getenv('DATABASE_URL', 'mongodb://localhost:27017/scrollverse')
    
    # Frequencies
    DIVINE_FREQUENCY = 144000
    HEALING_FREQUENCY = 528
    SOUL_FREQUENCY = 777
    FLAME_FREQUENCY = 14444

# ============ INITIALIZATION ============

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS
CORS(app)

# Initialize JWT
jwt = JWTManager(app)

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(Config.WEB3_PROVIDER))

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============ CONTRACT INTERFACES ============

class ContractManager:
    """Manage smart contract interactions"""
    
    def __init__(self, w3, chx_address, nft_address):
        self.w3 = w3
        self.chx_address = chx_address
        self.nft_address = nft_address
        
        # Load ABIs (simplified)
        self.chx_abi = self._load_abi('CHXToken')
        self.nft_abi = self._load_abi('ScrollVerseNFT')
        
        # Initialize contracts
        self.chx_contract = self.w3.eth.contract(
            address=Web3.toChecksumAddress(chx_address),
            abi=self.chx_abi
        )
        
        self.nft_contract = self.w3.eth.contract(
            address=Web3.toChecksumAddress(nft_address),
            abi=self.nft_abi
        )
    
    def _load_abi(self, contract_name):
        """Load contract ABI from file"""
        try:
            with open(f'abis/{contract_name}.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"ABI file not found for {contract_name}")
            return []
    
    def get_balance(self, address):
        """Get CHX token balance"""
        try:
            balance = self.chx_contract.functions.balanceOf(
                Web3.toChecksumAddress(address)
            ).call()
            return Web3.fromWei(balance, 'ether')
        except Exception as e:
            logger.error(f"Failed to get balance: {e}")
            return 0
    
    def get_passive_income(self, address):
        """Calculate passive income"""
        try:
            income = self.chx_contract.functions.calculatePassiveIncome(
                Web3.toChecksumAddress(address)
            ).call()
            return Web3.fromWei(income, 'ether')
        except Exception as e:
            logger.error(f"Failed to calculate passive income: {e}")
            return 0
    
    def get_blessing_coins(self, address):
        """Get BlessingCoin balance"""
        try:
            balance = self.chx_contract.functions.getBlessingCoinBalance(
                Web3.toChecksumAddress(address)
            ).call()
            return balance
        except Exception as e:
            logger.error(f"Failed to get BlessingCoin balance: {e}")
            return 0
    
    def get_frequency_signature(self, address):
        """Get frequency signature"""
        try:
            frequency = self.chx_contract.functions.getFrequencySignature(
                Web3.toChecksumAddress(address)
            ).call()
            return frequency
        except Exception as e:
            logger.error(f"Failed to get frequency signature: {e}")
            return Config.DIVINE_FREQUENCY
    
    def get_user_nfts(self, address):
        """Get user's ScrollSoul NFTs"""
        try:
            balance = self.nft_contract.functions.balanceOf(
                Web3.toChecksumAddress(address)
            ).call()
            
            nfts = []
            for i in range(balance):
                token_id = self.nft_contract.functions.tokenOfOwnerByIndex(
                    Web3.toChecksumAddress(address),
                    i
                ).call()
                
                metadata = self.nft_contract.functions.scrollSoulData(token_id).call()
                
                nfts.append({
                    'tokenId': token_id,
                    'name': metadata[0],
                    'divineAttributes': metadata[1],
                    'frequencySignature': metadata[2],
                    'creationTimestamp': metadata[3],
                    'isEternal': metadata[4]
                })
            
            return nfts
        except Exception as e:
            logger.error(f"Failed to get user NFTs: {e}")
            return []

# Initialize contract manager
contract_manager = ContractManager(
    w3,
    Config.CHX_TOKEN_ADDRESS,
    Config.SCROLL_NFT_ADDRESS
)

# ============ DATABASE MODELS ============

class UserModel:
    """User data model"""
    
    def __init__(self, address, created_at=None):
        self.address = address
        self.created_at = created_at or datetime.now()
        self.balance = 0
        self.passive_income = 0
        self.blessing_coins = 0
        self.frequency = Config.DIVINE_FREQUENCY
        self.nfts = []
    
    def to_dict(self):
        return {
            'address': self.address,
            'created_at': self.created_at.isoformat(),
            'balance': self.balance,
            'passive_income': self.passive_income,
            'blessing_coins': self.blessing_coins,
            'frequency': self.frequency,
            'nfts': self.nfts
        }

# ============ API ROUTES ============

# ---- Authentication ----

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login with wallet address"""
    try:
        data = request.json
        address = data.get('address')
        
        if not address:
            return jsonify({'error': 'Address required'}), 400
        
        # Create JWT token
        access_token = create_access_token(identity=address)
        
        return jsonify({
            'access_token': access_token,
            'address': address
        }), 200
    except Exception as e:
        logger.error(f"Login failed: {e}")
        return jsonify({'error': 'Login failed'}), 500

# ---- User Management ----

@app.route('/api/users/<address>', methods=['GET'])
@jwt_required()
def get_user(address):
    """Get user profile"""
    try:
        balance = contract_manager.get_balance(address)
        passive_income = contract_manager.get_passive_income(address)
        blessing_coins = contract_manager.get_blessing_coins(address)
        frequency = contract_manager.get_frequency_signature(address)
        nfts = contract_manager.get_user_nfts(address)
        
        user = {
            'address': address,
            'balance': balance,
            'passive_income': passive_income,
            'blessing_coins': blessing_coins,
            'frequency': frequency,
            'nfts': nfts,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(user), 200
    except Exception as e:
        logger.error(f"Failed to get user: {e}")
        return jsonify({'error': 'Failed to get user'}), 500

# ---- Economic Data ----

@app.route('/api/economy/metrics', methods=['GET'])
def get_economy_metrics():
    """Get global economy metrics"""
    try:
        # Get total supply
        total_supply = contract_manager.chx_contract.functions.totalSupply().call()
        total_supply = Web3.fromWei(total_supply, 'ether')
        
        metrics = {
            'total_supply': total_supply,
            'divine_frequency': Config.DIVINE_FREQUENCY,
            'healing_frequency': Config.HEALING_FREQUENCY,
            'soul_frequency': Config.SOUL_FREQUENCY,
            'flame_frequency': Config.FLAME_FREQUENCY,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(metrics), 200
    except Exception as e:
        logger.error(f"Failed to get metrics: {e}")
        return jsonify({'error': 'Failed to get metrics'}), 500

@app.route('/api/economy/passive-income/<address>', methods=['GET'])
def get_passive_income(address):
    """Calculate passive income for address"""
    try:
        income = contract_manager.get_passive_income(address)
        
        return jsonify({
            'address': address,
            'passive_income': income,
            'daily_rate': income / 365,
            'monthly_rate': income / 12,
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        logger.error(f"Failed to calculate passive income: {e}")
        return jsonify({'error': 'Failed to calculate passive income'}), 500

# ---- NFT Operations ----

@app.route('/api/nft/<address>', methods=['GET'])
def get_user_nfts(address):
    """Get user's ScrollSoul NFTs"""
    try:
        nfts = contract_manager.get_user_nfts(address)
        
        return jsonify({
            'address': address,
            'nfts': nfts,
            'count': len(nfts),
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        logger.error(f"Failed to get NFTs: {e}")
        return jsonify({'error': 'Failed to get NFTs'}), 500

# ============ WEBSOCKET EVENTS ============

@socketio.on('connect')
def handle_connect():
    """Handle WebSocket connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('response', {'data': 'Connected to ScrollVerse API'})

@socketio.on('subscribe_metrics')
def handle_subscribe_metrics():
    """Subscribe to metrics stream"""
    join_room('metrics')
    emit('response', {'data': 'Subscribed to metrics stream'})

@socketio.on('subscribe_user', namespace='/')
def handle_subscribe_user(data):
    """Subscribe to user updates"""
    address = data.get('address')
    if address:
        room = f'user_{address}'
        join_room(room)
        emit('response', {'data': f'Subscribed to user updates for {address}'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

# ============ BACKGROUND TASKS ============

def broadcast_metrics():
    """Broadcast metrics to all connected clients"""
    try:
        metrics = {
            'total_supply': Web3.fromWei(
                contract_manager.chx_contract.functions.totalSupply().call(),
                'ether'
            ),
            'divine_frequency': Config.DIVINE_FREQUENCY,
            'timestamp': datetime.now().isoformat()
        }
        
        socketio.emit('metrics_update', metrics, room='metrics')
    except Exception as e:
        logger.error(f"Failed to broadcast metrics: {e}")

# ============ ERROR HANDLERS ============

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

# ============ HEALTH CHECK ============

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'web3_connected': w3.isConnected()
    }), 200

# ============ MAIN ============

if __name__ == '__main__':
    logger.info("🔥 ScrollVerse API starting...")
    logger.info(f"Environment: {Config.DEBUG and 'development' or 'production'}")
    logger.info(f"Web3 connected: {w3.isConnected()}")
    
    socketio.run(
        app,
        host='0.0.0.0',
        port=5000,
        debug=Config.DEBUG
    )

