import express from 'express';
import Score from '../models/Score.js';
import Streak from '../models/Streak.js';
import { protect } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/score
// @desc    Get user's score
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let score = await Score.findOne({ user: req.user.id });
    
    if (!score) {
      score = await Score.create({ user: req.user.id });
    }
    
    // Reset daily points if it's a new day
    score.resetDailyPoints();
    await score.save();
    
    res.json({
      success: true,
      score: {
        ps_total: score.totalPoints,
        today_points: score.todayPoints,
        momentum_m: score.momentum,
        multiplier: score.multiplier,
        ads_watched: score.adsWatchedToday,
      },
    });
  } catch (error) {
    logger.error(`Get score error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/score/add
// @desc    Add points to user's score
// @access  Private
router.post('/add', protect, async (req, res) => {
  try {
    const { points, type } = req.body;
    
    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid points value',
      });
    }
    
    let score = await Score.findOne({ user: req.user.id });
    
    if (!score) {
      score = await Score.create({ user: req.user.id });
    }
    
    score.resetDailyPoints();
    score.totalPoints += points;
    score.todayPoints += points;
    
    if (type === 'ad') {
      score.adsWatchedToday = (score.adsWatchedToday || 0) + 1;
      score.lastAdWatchDate = new Date();
    }
    
    await score.save();
    
    logger.info(`Added ${points} points for user ${req.user.id}, type: ${type}`);
    
    res.json({
      success: true,
      message: 'Points added successfully',
      score: {
        ps_total: score.totalPoints,
        today_points: score.todayPoints,
      },
    });
  } catch (error) {
    logger.error(`Add score error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

export default router;
