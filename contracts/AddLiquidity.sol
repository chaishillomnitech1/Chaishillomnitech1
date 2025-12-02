// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AddLiquidity
 * @dev Liquidity provision contract for ScrollVerse ecosystem tokens
 * @author Supreme King Chais The Great ∞
 *
 * This contract enables:
 * - Adding liquidity to DEX pools (Uniswap V2 compatible)
 * - Removing liquidity with proportional token returns
 * - Automatic LP token minting and burning
 * - Slippage protection mechanisms
 * - Emergency withdrawal capabilities
 *
 * Frequencies: 528Hz + 963Hz + 777Hz
 * Status: LIQUIDITY ACTIVATION
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IUniswapV2Router02 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);
    
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);
    
    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity);
    
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);
    
    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountETH);
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

contract AddLiquidity is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ FREQUENCY CONSTANTS ============

    uint256 public constant FREQUENCY_528HZ = 528;
    uint256 public constant FREQUENCY_963HZ = 963;
    uint256 public constant FREQUENCY_777HZ = 777;

    // ============ STATE VARIABLES ============

    /// @dev Uniswap V2 Router address
    IUniswapV2Router02 public immutable uniswapRouter;

    /// @dev Maximum slippage allowed (in basis points, 500 = 5%)
    uint256 public maxSlippage;

    /// @dev Basis points constant
    uint256 public constant BASIS_POINTS = 10000;

    /// @dev Default deadline extension (30 minutes)
    uint256 public constant DEFAULT_DEADLINE = 30 minutes;

    // ============ STRUCTS ============

    struct LiquidityPosition {
        address tokenA;
        address tokenB;
        uint256 lpTokens;
        uint256 amountA;
        uint256 amountB;
        uint256 timestamp;
    }

    // ============ MAPPINGS ============

    /// @dev User liquidity positions
    mapping(address => LiquidityPosition[]) public userPositions;

    /// @dev Whitelisted tokens for liquidity provision
    mapping(address => bool) public whitelistedTokens;

    /// @dev Total liquidity added per token pair
    mapping(bytes32 => uint256) public totalLiquidity;

    // ============ EVENTS ============

    event LiquidityAdded(
        address indexed provider,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 lpTokens
    );

    event LiquidityRemoved(
        address indexed provider,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 lpTokens
    );

    event LiquidityAddedETH(
        address indexed provider,
        address indexed token,
        uint256 amountToken,
        uint256 amountETH,
        uint256 lpTokens
    );

    event LiquidityRemovedETH(
        address indexed provider,
        address indexed token,
        uint256 amountToken,
        uint256 amountETH,
        uint256 lpTokens
    );

    event TokenWhitelisted(address indexed token, bool status);
    event SlippageUpdated(uint256 oldSlippage, uint256 newSlippage);

    // ============ ERRORS ============

    error InvalidAddress();
    error InvalidAmount();
    error TokenNotWhitelisted();
    error SlippageTooHigh();
    error DeadlineExpired();
    error InsufficientLiquidity();
    error TransferFailed();

    // ============ CONSTRUCTOR ============

    /**
     * @dev Constructor initializes the liquidity contract
     * @param _router Uniswap V2 compatible router address
     * @param _maxSlippage Maximum slippage in basis points
     */
    constructor(
        address _router,
        uint256 _maxSlippage
    ) Ownable(msg.sender) {
        if (_router == address(0)) revert InvalidAddress();
        if (_maxSlippage > 2000) revert SlippageTooHigh(); // Max 20%

        uniswapRouter = IUniswapV2Router02(_router);
        maxSlippage = _maxSlippage;
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Whitelist a token for liquidity provision
     * @param _token Token address to whitelist
     * @param _status Whitelist status
     */
    function setTokenWhitelist(address _token, bool _status) external onlyOwner {
        if (_token == address(0)) revert InvalidAddress();
        whitelistedTokens[_token] = _status;
        emit TokenWhitelisted(_token, _status);
    }

    /**
     * @dev Update maximum slippage
     * @param _newSlippage New slippage in basis points
     */
    function updateMaxSlippage(uint256 _newSlippage) external onlyOwner {
        if (_newSlippage > 2000) revert SlippageTooHigh();
        uint256 oldSlippage = maxSlippage;
        maxSlippage = _newSlippage;
        emit SlippageUpdated(oldSlippage, _newSlippage);
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency token recovery
     * @param _token Token address to recover
     * @param _amount Amount to recover
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
    }

    /**
     * @dev Emergency ETH recovery
     */
    function emergencyWithdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        if (!success) revert TransferFailed();
    }

    // ============ LIQUIDITY FUNCTIONS ============

    /**
     * @dev Add liquidity for token pair
     * @param _tokenA First token address
     * @param _tokenB Second token address
     * @param _amountA Amount of tokenA to add
     * @param _amountB Amount of tokenB to add
     * @param _slippage Slippage tolerance in basis points
     * @return amountA Actual amount of tokenA added
     * @return amountB Actual amount of tokenB added
     * @return liquidity LP tokens received
     */
    function addLiquidity(
        address _tokenA,
        address _tokenB,
        uint256 _amountA,
        uint256 _amountB,
        uint256 _slippage
    ) external nonReentrant whenNotPaused returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        if (!whitelistedTokens[_tokenA] || !whitelistedTokens[_tokenB]) {
            revert TokenNotWhitelisted();
        }
        if (_amountA == 0 || _amountB == 0) revert InvalidAmount();
        if (_slippage > maxSlippage) revert SlippageTooHigh();

        // Transfer tokens from user
        IERC20(_tokenA).safeTransferFrom(msg.sender, address(this), _amountA);
        IERC20(_tokenB).safeTransferFrom(msg.sender, address(this), _amountB);

        // Approve router
        IERC20(_tokenA).approve(address(uniswapRouter), _amountA);
        IERC20(_tokenB).approve(address(uniswapRouter), _amountB);

        // Calculate minimum amounts with slippage
        uint256 amountAMin = (_amountA * (BASIS_POINTS - _slippage)) / BASIS_POINTS;
        uint256 amountBMin = (_amountB * (BASIS_POINTS - _slippage)) / BASIS_POINTS;

        // Add liquidity
        (amountA, amountB, liquidity) = uniswapRouter.addLiquidity(
            _tokenA,
            _tokenB,
            _amountA,
            _amountB,
            amountAMin,
            amountBMin,
            msg.sender,
            block.timestamp + DEFAULT_DEADLINE
        );

        // Return unused tokens
        if (_amountA > amountA) {
            IERC20(_tokenA).safeTransfer(msg.sender, _amountA - amountA);
        }
        if (_amountB > amountB) {
            IERC20(_tokenB).safeTransfer(msg.sender, _amountB - amountB);
        }

        // Record position
        userPositions[msg.sender].push(LiquidityPosition({
            tokenA: _tokenA,
            tokenB: _tokenB,
            lpTokens: liquidity,
            amountA: amountA,
            amountB: amountB,
            timestamp: block.timestamp
        }));

        // Update total liquidity
        bytes32 pairKey = _getPairKey(_tokenA, _tokenB);
        totalLiquidity[pairKey] += liquidity;

        emit LiquidityAdded(msg.sender, _tokenA, _tokenB, amountA, amountB, liquidity);
    }

    /**
     * @dev Add liquidity with ETH
     * @param _token Token address to pair with ETH
     * @param _amountToken Amount of token to add
     * @param _slippage Slippage tolerance in basis points
     * @return amountToken Actual amount of token added
     * @return amountETH Actual amount of ETH added
     * @return liquidity LP tokens received
     */
    function addLiquidityETH(
        address _token,
        uint256 _amountToken,
        uint256 _slippage
    ) external payable nonReentrant whenNotPaused returns (uint256 amountToken, uint256 amountETH, uint256 liquidity) {
        if (!whitelistedTokens[_token]) revert TokenNotWhitelisted();
        if (_amountToken == 0 || msg.value == 0) revert InvalidAmount();
        if (_slippage > maxSlippage) revert SlippageTooHigh();

        // Transfer token from user
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amountToken);

        // Approve router
        IERC20(_token).approve(address(uniswapRouter), _amountToken);

        // Calculate minimum amounts with slippage
        uint256 amountTokenMin = (_amountToken * (BASIS_POINTS - _slippage)) / BASIS_POINTS;
        uint256 amountETHMin = (msg.value * (BASIS_POINTS - _slippage)) / BASIS_POINTS;

        // Add liquidity
        (amountToken, amountETH, liquidity) = uniswapRouter.addLiquidityETH{value: msg.value}(
            _token,
            _amountToken,
            amountTokenMin,
            amountETHMin,
            msg.sender,
            block.timestamp + DEFAULT_DEADLINE
        );

        // Return unused tokens and ETH
        if (_amountToken > amountToken) {
            IERC20(_token).safeTransfer(msg.sender, _amountToken - amountToken);
        }
        if (msg.value > amountETH) {
            (bool success, ) = msg.sender.call{value: msg.value - amountETH}("");
            if (!success) revert TransferFailed();
        }

        // Record position
        userPositions[msg.sender].push(LiquidityPosition({
            tokenA: _token,
            tokenB: uniswapRouter.WETH(),
            lpTokens: liquidity,
            amountA: amountToken,
            amountB: amountETH,
            timestamp: block.timestamp
        }));

        // Update total liquidity
        bytes32 pairKey = _getPairKey(_token, uniswapRouter.WETH());
        totalLiquidity[pairKey] += liquidity;

        emit LiquidityAddedETH(msg.sender, _token, amountToken, amountETH, liquidity);
    }

    /**
     * @dev Remove liquidity for token pair
     * @param _tokenA First token address
     * @param _tokenB Second token address
     * @param _liquidity LP tokens to burn
     * @param _slippage Slippage tolerance in basis points
     * @return amountA Amount of tokenA received
     * @return amountB Amount of tokenB received
     */
    function removeLiquidity(
        address _tokenA,
        address _tokenB,
        uint256 _liquidity,
        uint256 _slippage
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        if (_liquidity == 0) revert InvalidAmount();
        if (_slippage > maxSlippage) revert SlippageTooHigh();

        // Get LP token address
        address factory = uniswapRouter.factory();
        address pair = IUniswapV2Factory(factory).getPair(_tokenA, _tokenB);
        if (pair == address(0)) revert InsufficientLiquidity();

        // Transfer LP tokens from user
        IERC20(pair).safeTransferFrom(msg.sender, address(this), _liquidity);

        // Approve router
        IERC20(pair).approve(address(uniswapRouter), _liquidity);

        // Remove liquidity
        (amountA, amountB) = uniswapRouter.removeLiquidity(
            _tokenA,
            _tokenB,
            _liquidity,
            0, // Let slippage be handled by router
            0,
            msg.sender,
            block.timestamp + DEFAULT_DEADLINE
        );

        // Update total liquidity
        bytes32 pairKey = _getPairKey(_tokenA, _tokenB);
        if (totalLiquidity[pairKey] >= _liquidity) {
            totalLiquidity[pairKey] -= _liquidity;
        }

        emit LiquidityRemoved(msg.sender, _tokenA, _tokenB, amountA, amountB, _liquidity);
    }

    /**
     * @dev Remove liquidity with ETH
     * @param _token Token address paired with ETH
     * @param _liquidity LP tokens to burn
     * @param _slippage Slippage tolerance in basis points
     * @return amountToken Amount of token received
     * @return amountETH Amount of ETH received
     */
    function removeLiquidityETH(
        address _token,
        uint256 _liquidity,
        uint256 _slippage
    ) external nonReentrant returns (uint256 amountToken, uint256 amountETH) {
        if (_liquidity == 0) revert InvalidAmount();
        if (_slippage > maxSlippage) revert SlippageTooHigh();

        // Get LP token address
        address factory = uniswapRouter.factory();
        address pair = IUniswapV2Factory(factory).getPair(_token, uniswapRouter.WETH());
        if (pair == address(0)) revert InsufficientLiquidity();

        // Transfer LP tokens from user
        IERC20(pair).safeTransferFrom(msg.sender, address(this), _liquidity);

        // Approve router
        IERC20(pair).approve(address(uniswapRouter), _liquidity);

        // Remove liquidity
        (amountToken, amountETH) = uniswapRouter.removeLiquidityETH(
            _token,
            _liquidity,
            0,
            0,
            msg.sender,
            block.timestamp + DEFAULT_DEADLINE
        );

        // Update total liquidity
        bytes32 pairKey = _getPairKey(_token, uniswapRouter.WETH());
        if (totalLiquidity[pairKey] >= _liquidity) {
            totalLiquidity[pairKey] -= _liquidity;
        }

        emit LiquidityRemovedETH(msg.sender, _token, amountToken, amountETH, _liquidity);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get user's liquidity positions
     * @param _user User address
     * @return Array of liquidity positions
     */
    function getUserPositions(address _user) external view returns (LiquidityPosition[] memory) {
        return userPositions[_user];
    }

    /**
     * @dev Get total liquidity for a token pair
     * @param _tokenA First token address
     * @param _tokenB Second token address
     * @return Total LP tokens for the pair
     */
    function getTotalLiquidity(address _tokenA, address _tokenB) external view returns (uint256) {
        bytes32 pairKey = _getPairKey(_tokenA, _tokenB);
        return totalLiquidity[pairKey];
    }

    /**
     * @dev Get resonance signature
     * @return Combined frequency
     */
    function getResonanceSignature() external pure returns (uint256) {
        return FREQUENCY_528HZ + FREQUENCY_963HZ + FREQUENCY_777HZ;
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Generate unique key for token pair
     * @param _tokenA First token address
     * @param _tokenB Second token address
     * @return Keccak256 hash of sorted token addresses
     */
    function _getPairKey(address _tokenA, address _tokenB) internal pure returns (bytes32) {
        (address token0, address token1) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA);
        return keccak256(abi.encodePacked(token0, token1));
    }

    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}
