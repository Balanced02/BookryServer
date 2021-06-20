import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  userType: 'author' | 'editor' | 'reader';
  phoneNumber: string;
  dateOfBirth: string;
}

const UserSchema = new Schema<IUser>({
  fullName: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
  },
  password: {
    type: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  userType: {
    type: String,
    default: 'reader',
    enum: ['author', 'editor', 'reader'],
  },
  phoneNumber: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
  socialMedia: [
    {
      facebook: String,
    },
  ],
  created: {
    type: Date,
    default: Date.now,
  },
});

// eslint-disable-next-line func-names
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

export default mongoose.model('User', UserSchema);
