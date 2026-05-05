import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  source: { type: String, enum: ['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Event'] },
  status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'], default: 'New' },
  dealValue: { type: Number, default: 0 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
