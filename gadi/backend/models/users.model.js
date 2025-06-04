const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SPORTS_CATEGORIES = [
  'Athletics',
  'Swimming',
  'Cricket',
  'Basketball',
  'Football',
  'Tennis',
  'Boxing',
  'Wrestling',
  'Gymnastics',
  'Volleyball'
];

const AGE_GROUPS = ['Under-16', 'Under-18', 'Adult'];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [5, 'Password must be at least 5 characters long']
  },
  age_group: {
    type: String,
    required: [true, 'Age group is required'],
    enum: AGE_GROUPS
  },
  sport: {
    type: String,
    required: [true, 'Sport category is required'],
    enum: SPORTS_CATEGORIES
  },
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }],
  level: {
    type: Number,
    default: 1
  },
  rank: {
    type: Number,
    default: 0
  },
  completed_modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  quiz_scores: {
    type: Map,
    of: Number,
    default: new Map()
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Static method to get available sports categories
userSchema.statics.getSportsCategories = function() {
  return SPORTS_CATEGORIES;
};

// Static method to get available age groups
userSchema.statics.getAgeGroups = function() {
  return AGE_GROUPS;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
  