import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastCheckIn: {
    type: Date,
  },
  checkInHistory: [{
    date: Date,
    points: Number,
  }],
}, {
  timestamps: true,
});

// Check if streak is broken and update accordingly
streakSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (!this.lastCheckIn) {
    // First check-in
    this.currentStreak = 1;
  } else {
    const lastCheckInDate = new Date(this.lastCheckIn);
    lastCheckInDate.setHours(0, 0, 0, 0);
    
    if (lastCheckInDate.getTime() === today.getTime()) {
      // Already checked in today
      return this;
    } else if (lastCheckInDate.getTime() === yesterday.getTime()) {
      // Consecutive day
      this.currentStreak += 1;
    } else {
      // Streak broken
      this.currentStreak = 1;
    }
  }
  
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  this.lastCheckIn = new Date();
  return this;
};

const Streak = mongoose.model('Streak', streakSchema);

export default Streak;
