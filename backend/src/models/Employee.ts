import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  userId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  role: string;
  certifications: {
    name: string;
    issuedDate: Date;
    expiryDate: Date;
    status: string;
    documentUrl?: string;
  }[];
  status: string;
}

const EmployeeSchema = new Schema<IEmployee>({
  userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  businessId: { type: Schema.Types.ObjectId, ref: 'Business' },
  name:       { type: String, required: true },
  email:      { type: String },
  phone:      { type: String },
  role:       { type: String, default: 'Staff' },
  certifications: [{
    name:        { type: String, required: true },
    issuedDate:  { type: Date },
    expiryDate:  { type: Date, required: true },
    status:      { type: String, default: 'active' },
    documentUrl: { type: String },
  }],
  status: { type: String, default: 'active' },
}, { timestamps: true });

export default mongoose.models.Employee ||
  mongoose.model<IEmployee>('Employee', EmployeeSchema);