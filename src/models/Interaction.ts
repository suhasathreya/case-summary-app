import mongoose, { Document } from 'mongoose';

export interface IInteraction extends Document {
  patientId: mongoose.Types.ObjectId;
  type: string;
  date: Date;
  notes: string;
  diagnosis?: string;
  prescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const interactionSchema = new mongoose.Schema<IInteraction>({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    required: true,
    trim: true
  },
  diagnosis: {
    type: String,
    trim: true
  },
  prescription: {
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
interactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Interaction = mongoose.models.Interaction || mongoose.model<IInteraction>('Interaction', interactionSchema); 