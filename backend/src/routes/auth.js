import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Score from '../models/Score.js';
import Streak from '../models/Streak.js';
import Referral from '../models/Referral.js';
import { registerValidator, loginValidator } from './validators.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidator, validate, async (req, res) => {
  try {
    const { email, password, username, referral_code, device_id } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        errors: { email: 'Email already registered' },
      });
    }

    // Check if username is taken
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          errors: { username: 'Username already taken' },
        });
      }
    }

    // Find referrer if referral code provided
    let referrer = null;
    if (referral_code) {
      referrer = await User.findOne({ referralCode: referral_code.toUpperCase() });
    }

    // Create user
    user = new User({
      email,
      password,
      username,
      deviceId: device_id,
      referredBy: referrer?._id,
    });

    await user.save();

    // Create score and streak records
    await Score.create({ user: user._id });
    await Streak.create({ user: user._id });

    // Create referral record if referred
    if (referrer) {
      await Referral.create({
        referrer: referrer._id,
        referred: user._id,
        referralCode: referral_code.toUpperCase(),
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user_id: user._id,
      referral_code: user.referralCode,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
});

// @route   POST /api/auth/login-email
// @desc    Login with email and password
// @access  Public
router.post('/login-email', loginValidator, validate, async (req, res) => {
  try {
    const { email, password, device_id } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update device ID if provided
    if (device_id) {
      user.deviceId = device_id;
      await user.save();
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user_id: user._id,
      referral_code: user.referralCode,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.displayName || user.username,
        username: user.username,
        referral_code: user.referralCode,
        kyc_status: user.kycStatus,
      },
    });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.post('/update-profile', protect, async (req, res) => {
  try {
    const { displayName, username } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (displayName) {
      user.displayName = displayName;
    }
    
    if (username) {
      // Check if username is taken by another user
      const existing = await User.findOne({ username });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          errors: { username: 'Username already taken' },
        });
      }
      user.username = username;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.displayName || user.username,
        username: user.username,
      },
    });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

export default router;
