import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String
  },
  password: {
    type: String,
    // Only required if not using OAuth
    required: function() {
      return !this.provider;
    }
  },
  provider: {
    type: String,
    enum: ['google', 'github', null],
    default: null
  },
  providerId: {
    type: String
  },
  role: {
    type: String,
    required: true,
    enum: ['Doctor', 'Nurse', 'Specialist', 'Admin'],
  },
  department: String,
  specialization: String,
  licenseNumber: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = new Date();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema); 