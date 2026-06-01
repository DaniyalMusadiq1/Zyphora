import express from 'express';
import Task from '../models/Task.js';
import UserTask from '../models/UserTask.js';
import Score from '../models/Score.js';
import { protect } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all available tasks for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, status } = req.query;
    
    let query = { active: true };
    
    if (category) {
      query.category = category;
    }
    
    const tasks = await Task.find(query).sort({ priority: -1, createdAt: -1 });
    
    // Get user's completed tasks
    const userTasks = await UserTask.find({ user: req.user.id });
    const completedTaskIds = userTasks
      .filter(ut => ut.completed)
      .map(ut => ut.task.toString());
    
    const formattedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      points: task.points,
      category: task.category,
      type: task.type,
      icon: task.icon,
      completed: completedTaskIds.includes(task._id.toString()),
      completedAt: userTasks.find(ut => ut.task.toString() === task._id.toString())?.completedAt,
    }));
    
    res.json({
      success: true,
      tasks: formattedTasks,
    });
  } catch (error) {
    logger.error(`Get tasks error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/tasks/:id/complete
// @desc    Mark a task as complete and award points
// @access  Private
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    
    if (!task.active) {
      return res.status(400).json({
        success: false,
        message: 'This task is no longer available',
      });
    }
    
    // Check if already completed
    let userTask = await UserTask.findOne({ 
      user: req.user.id, 
      task: req.params.id 
    });
    
    if (userTask && userTask.completed) {
      // Check if task can be completed multiple times
      if (!task.multipleCompletions) {
        return res.status(400).json({
          success: false,
          message: 'Task already completed',
        });
      }
    }
    
    // Create or update user task
    if (!userTask) {
      userTask = new UserTask({
        user: req.user.id,
        task: req.params.id,
        completed: true,
        completedAt: new Date(),
      });
    } else {
      userTask.completed = true;
      userTask.completedAt = new Date();
    }
    
    await userTask.save();
    
    // Award points
    let score = await Score.findOne({ user: req.user.id });
    if (!score) {
      score = await Score.create({ user: req.user.id });
    }
    
    score.totalPoints += task.points;
    score.todayPoints += task.points;
    await score.save();
    
    logger.info(`Task completed by user ${req.user.id}: ${task.title}, points: ${task.points}`);
    
    res.json({
      success: true,
      message: 'Task completed successfully',
      points_earned: task.points,
      total_points: score.totalPoints,
      today_points: score.todayPoints,
    });
  } catch (error) {
    logger.error(`Complete task error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

export default router;
