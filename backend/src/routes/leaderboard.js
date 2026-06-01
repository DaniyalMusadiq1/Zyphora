import express from 'express';
import Score from '../models/Score.js';
import User from '../models/User.js';
import Referral from '../models/Referral.js';
import { protect } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/leaderboard
// @desc    Get global leaderboard
// @access  Public/Private
router.get('/', async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get top users by total points
    const scores = await Score.find()
      .sort({ totalPoints: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username displayName');

    const leaderboard = scores.map((score, index) => ({
      rank: skip + index + 1,
      user_id: score.user?._id,
      username: score.user?.username || 'Anonymous',
      displayName: score.user?.displayName || '',
      total_points: score.totalPoints,
      today_points: score.todayPoints,
    }));

    res.json({
      success: true,
      leaderboard,
      total: scores.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    logger.error(`Get leaderboard error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/leaderboard/friends
// @desc    Get friends leaderboard
// @access  Private
router.get('/friends', protect, async (req, res) => {
  try {
    // Get users who referred or were referred by current user
    const referrals = await Referral.find({
      $or: [
        { referrer: req.user.id },
        { referred: req.user.id },
      ],
    });

    const userIds = referrals.map(r => [r.referrer, r.referred]).flat();
    const uniqueUserIds = [...new Set(userIds.map(id => id.toString()))];

    const scores = await Score.find({ user: { $in: uniqueUserIds } })
      .sort({ totalPoints: -1 })
      .populate('user', 'username displayName');

    const leaderboard = scores.map((score, index) => ({
      rank: index + 1,
      user_id: score.user?._id,
      username: score.user?.username || 'Anonymous',
      displayName: score.user?.displayName || '',
      total_points: score.totalPoints,
      is_current_user: score.user._id.toString() === req.user.id,
    }));

    res.json({
      success: true,
      leaderboard,
      total: leaderboard.length,
    });
  } catch (error) {
    logger.error(`Get friends leaderboard error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   GET /api/leaderboard/rank
// @desc    Get current user's rank
// @access  Private
router.get('/rank', protect, async (req, res) => {
  try {
    const userScore = await Score.findOne({ user: req.user.id });
    
    if (!userScore) {
      return res.json({
        success: true,
        rank: null,
        total_users: 0,
      });
    }

    // Count users with higher scores
    const higherScores = await Score.countDocuments({
      totalPoints: { $gt: userScore.totalPoints },
    });

    const totalUsers = await Score.countDocuments();

    res.json({
      success: true,
      rank: higherScores + 1,
      total_users: totalUsers,
      my_score: userScore.totalPoints,
      percentile: ((totalUsers - higherScores) / totalUsers * 100).toFixed(2),
    });
  } catch (error) {
    logger.error(`Get rank error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

export default router;
