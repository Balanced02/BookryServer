import mongoose, { Schema, Document } from 'mongoose';

export interface IChapter extends Document {
  title: string
  description: string
  body: string
  created: Date
}

const ChaptersSchema = new Schema<IChapter>({
  title: {
    type: String,
    trim: true,
    required: true,
    minLength: 4,
  },
  description: {
    type: String,
    trim: true,
    required: true,
    minLength: 25,
  },
  body: {
    type: String,
    trim: true,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Chapter', ChaptersSchema);
