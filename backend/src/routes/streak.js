import express from 'express';
import Streak from '../models/Streak.js';
import Score from '../models/Score.js';
import { protect } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/streak
// @desc    Get user's streak
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let streak = await Streak.findOne({ user: req.user.id });

    if (!streak) {
      streak = await Streak.create({ user: req.user.id });
    }

    res.json({
      success: true,
      data: {
        current_streak: streak.currentStreak,
        longest_streak: streak.longestStreak,
        last_check_in: streak.lastCheckIn,
      },
    });
  } catch (error) {
    logger.error(`Get streak error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/streak/checkin
// @desc    Check in for daily streak
// @access  Private
router.post('/checkin', protect, async (req, res) => {
  try {
    let streak = await Streak.findOne({ user: req.user.id });

    if (!streak) {
      streak = new Streak({ user: req.user.id });
    }

    // Update streak
    streak.updateStreak();
    await streak.save();

    // Award points for check-in
    let score = await Score.findOne({ user: req.user.id });
    if (!score) {
      score = await Score.create({ user: req.user.id });
    }

    const basePoints = 10;
    const streakBonus = Math.min(streak.currentStreak * 2, 50);
    const totalPoints = basePoints + streakBonus;

    score.totalPoints += totalPoints;
    score.todayPoints += totalPoints;
    await score.save();

    logger.info(`Streak check-in by user ${req.user.id}: ${streak.currentStreak} days, points: ${totalPoints}`);

    res.json({
      success: true,
      message: 'Daily check-in successful!',
      data: {
        current_streak: streak.currentStreak,
        longest_streak: streak.longestStreak,
        points_earned: totalPoints,
        base_points: basePoints,
        streak_bonus: streakBonus,
        total_points: score.totalPoints,
        today_points: score.todayPoints,
      },
    });
  } catch (error) {
    logger.error(`Streak check-in error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during check-in',
    });
  }
});

export default router;
