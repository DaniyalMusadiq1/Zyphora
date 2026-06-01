import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referralCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'rewarded'],
    default: 'pending',
  },
  rewardEarned: {
    type: Number,
    default: 0,
  },
  qualityScore: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

referralSchema.index({ referrer: 1, referred: 1 }, { unique: true });

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;
