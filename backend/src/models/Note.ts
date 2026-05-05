import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

noteSchema.post('save', async function() {
  await mongoose.model('Lead').findByIdAndUpdate(this.leadId, { updatedAt: new Date() });
});

export default mongoose.model('Note', noteSchema);
