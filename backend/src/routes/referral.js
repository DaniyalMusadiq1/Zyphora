import express from 'express';
import Referral from '../models/Referral.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/referrals
// @desc    Get user's referrals
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user.id })
      .populate('referred', 'username email displayName')
      .sort({ createdAt: -1 });

    const formattedReferrals = referrals.map(ref => ({
      id: ref._id,
      username: ref.referred?.username || 'Unknown',
      email: ref.referred?.email || '',
      displayName: ref.referred?.displayName || '',
      joinedAt: ref.createdAt,
      status: 'active',
    }));

    res.json({
      success: true,
      referrals: formattedReferrals,
      total: formattedReferrals.length,
    });
  } catch (error) {
    logger.error(`Get referrals error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/referrals/stats
// @desc    Get referral statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const totalReferrals = await Referral.countDocuments({ referrer: req.user.id });
    
    // Calculate total bonus earned from referrals
    const referralBonus = totalReferrals * 100; // Assuming 100 points per referral
    
    res.json({
      success: true,
      stats: {
        total_referrals: totalReferrals,
        referral_code: user.referralCode,
        bonus_earned: referralBonus,
        referral_link: `https://zyphora.app/join/${user.referralCode}`,
      },
    });
  } catch (error) {
    logger.error(`Get referral stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

export default router;
