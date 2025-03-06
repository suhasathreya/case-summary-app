import mongoose, { Document } from 'mongoose';

export interface INote extends Document {
  patientId: mongoose.Types.ObjectId;
  content: string;
  visitDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new mongoose.Schema<INote>({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  visitDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Visit date is required']
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
noteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Note = mongoose.models.Note || mongoose.model<INote>('Note', noteSchema); 