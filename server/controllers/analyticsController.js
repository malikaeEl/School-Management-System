import Analytics from '../models/Analytics.js';

// Default initial data for the database
const defaultAnalyticsData = {
  kpis: {
    enrollments: { value: '0', change: '0%' },
    successRate: { value: '0%', change: '0%' },
    attendance: { value: '0%', change: '0%' },
    budget: { value: '0%', change: '0%' }
  },
  academicStats: [
    { subject: 'Matière 1', scores: [0, 0, 0, 0, 0, 0, 0], color: 'bg-moroccan-green' },
    { subject: 'Matière 2', scores: [0, 0, 0, 0, 0, 0, 0], color: 'bg-moroccan-gold' },
    { subject: 'Matière 3', scores: [0, 0, 0, 0, 0, 0, 0], color: 'bg-moroccan-red' }
  ],
  departmentStats: [
    { label: 'Département 1', val: 0, color: 'bg-moroccan-green' },
    { label: 'Département 2', val: 0, color: 'bg-moroccan-gold' }
  ],
  attendanceTrends: {
    months: ['Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    dataPoints: ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0'] // Simple representation config
  },
  financeStats: {
    q4Target: { value: '0', change: '0%' },
    yearEndRev: { value: '0' }
  }
};

// ── GET /api/analytics ───────────────────────────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    let analytics = await Analytics.findOne();
    if (!analytics) {
      analytics = await Analytics.create(defaultAnalyticsData);
    }
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/analytics ───────────────────────────────────────────────────
export const updateAnalytics = async (req, res) => {
  try {
    let analytics = await Analytics.findOne();
    if (!analytics) {
      analytics = await Analytics.create(req.body);
    } else {
      analytics = await Analytics.findOneAndUpdate({}, req.body, { new: true });
    }
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
