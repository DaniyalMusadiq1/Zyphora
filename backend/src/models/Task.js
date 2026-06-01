import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  points: {
    type: Number,
    required: true,
    default: 0,
  },
  category: {
    type: String,
    enum: ['social', 'learning', 'daily', 'special', 'referral'],
    default: 'daily',
  },
  type: {
    type: String,
    enum: ['one_time', 'daily', 'weekly'],
    default: 'one_time',
  },
  icon: {
    type: String,
    default: 'task',
  },
  active: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: Number,
    default: 0,
  },
  multipleCompletions: {
    type: Boolean,
    default: false,
  },
  metadata: {
    type: Object,
  },
}, {
  timestamps: true,
});

taskSchema.index({ category: 1, active: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;

// User Task completion tracking schema
const userTaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  attempts: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

userTaskSchema.index({ user: 1, task: 1 }, { unique: true });

const UserTask = mongoose.model('UserTask', userTaskSchema);

export { UserTask };
