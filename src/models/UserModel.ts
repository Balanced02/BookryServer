import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { IProfile } from './ProfileModel';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  userType: 'author' | 'editor' | 'reader';
  profile: IProfile['_id'];
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
