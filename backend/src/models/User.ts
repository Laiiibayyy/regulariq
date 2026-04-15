import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  businessId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  businessId: { type: Schema.Types.ObjectId, ref: 'Business' },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);