import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  kpis: {
    enrollments: { value: { type: String, default: '1,240' }, change: { type: String, default: '+5%' } },
    successRate: { value: { type: String, default: '92.4%' }, change: { type: String, default: '+1.2%' } },
    attendance: { value: { type: String, default: '95.4%' }, change: { type: String, default: '-0.5%' } },
    budget: { value: { type: String, default: '78%' }, change: { type: String, default: 'Normal' } }
  },
  academicStats: [
    {
      subject: { type: String },
      scores: [{ type: Number }],
      color: { type: String }
    }
  ],
  departmentStats: [
    {
      label: { type: String },
      val: { type: Number },
      color: { type: String }
    }
  ],
  attendanceTrends: {
    months: [{ type: String }],
    dataPoints: [{ type: String }] // we'll use a comma-separated list of points or simulate SVG
  },
  financeStats: {
    q4Target: { value: { type: String, default: '85%' }, change: { type: String, default: '↑ 4.2%' } },
    yearEndRev: { value: { type: String, default: '5.8M' } }
  }
}, { timestamps: true });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
