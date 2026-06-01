import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  todayPoints: {
    type: Number,
    default: 0,
  },
  lastCheckIn: {
    type: Date,
  },
  momentum: {
    type: Number,
    default: 1,
  },
  multiplier: {
    type: Number,
    default: 1,
  },
  adsWatchedToday: {
    type: Number,
    default: 0,
  },
  lastAdWatchDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Reset daily points at midnight
scoreSchema.methods.resetDailyPoints = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (this.lastCheckIn && this.lastCheckIn < today) {
    this.todayPoints = 0;
    this.adsWatchedToday = 0;
  }
  
  return this;
};

const Score = mongoose.model('Score', scoreSchema);

export default Score;
