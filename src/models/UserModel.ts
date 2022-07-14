import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  role: 'super-admin' | 'user';
  userType: 'author' | 'editor' | 'reader';
  created: Date
  comparePassword: (password: string) => boolean
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
    required: true,
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
  role: {
    type: String,
    default: 'user',
    enum: ['super-admin', 'user'],
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

// eslint-disable-next-line func-names
UserSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compareSync(password, this.password);
};

export default mongoose.model('User', UserSchema);
