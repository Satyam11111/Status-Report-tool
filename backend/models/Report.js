const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scrumTeam: { type: String },
  art: { type: String },
  productOwner: { type: String },
  scrumMaster: { type: String },
  currentSprint: { type: String },
  taskTitle:{type:String},   //cpa or vbbu
  area:{type:String}, // dev or QA
  workSummary: { type: String },
  taskStatus: { type: String },
  leaves: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', ReportSchema);
module.exports = Report;
