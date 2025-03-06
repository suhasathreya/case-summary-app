import mongoose, { Document } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  reasonForAdmission: string;
  status: 'open' | 'discharged' | 'closed';
  dischargeDate?: Date;
  caseSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new mongoose.Schema<IPatient>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: 'Gender must be either Male, Female, or Other'
    }
  },
  reasonForAdmission: {
    type: String,
    required: [true, 'Reason for admission is required'],
    trim: true
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['open', 'discharged', 'closed'],
      message: 'Status must be either open, discharged, or closed'
    },
    default: 'open'
  },
  dischargeDate: {
    type: Date
  },
  caseSummary: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
patientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Patient = mongoose.models.Patient || mongoose.model<IPatient>('Patient', patientSchema); 