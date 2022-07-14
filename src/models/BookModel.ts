import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IBook extends Document {
  title: string
  status: 'published' | 'pending' | 'reviewing'
  user: Schema.Types.ObjectId
  description?: string
  coverImage?: string
  chapters?: Schema.Types.ObjectId[]
  rating?: number
  price?: number
  created: Date
}

const BookSchema = new Schema<IBook>({
  status: {
    type: String,
    enum: ['published', 'pending', 'reviewing'],
    default: 'pending',
  },
  price: {
    type: String,
    default: 0,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    trim: true,
    required: true,
    minLength: 4
  },
  description: {
    type: String,
    trim: true,
    minLength: 25
  },
  coverImage: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    required: true,
  },
  chapters: {
    type: Array<Schema.Types.ObjectId>,
    ref: 'Chapter'
  },
  created: {
    type: Date,
    default: Date.now,
  },
});


export default mongoose.model('Book', BookSchema);
