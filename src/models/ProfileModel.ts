import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  phoneNumber: string;
  dateOfBirth: string;
  displayDob: boolean;
  socialMedia: [];
}

const ProfileSchema = new Schema({
  phoneNumber: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  displayDob: {
    type: Boolean,
    default: true,
  },
  socialMedia: [
    {},
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
});

export default mongoose.model('Profile', ProfileSchema);
