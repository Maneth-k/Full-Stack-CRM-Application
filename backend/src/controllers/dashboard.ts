import { Request, Response } from 'express';
import Lead from '../models/Lead';

export const getStats = async (req: Request, res: Response) => {
  try {
    const totalLeads = await Lead.countDocuments();
    
    const statusCounts = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const activePipeline = await Lead.aggregate([
      { $match: { status: { $in: ['New', 'Contacted', 'Qualified', 'Proposal Sent'] } } },
      { $group: { _id: null, totalValue: { $sum: '$dealValue' } } }
    ]);

    const totalRevenue = await Lead.aggregate([
      { $match: { status: 'Won' } },
      { $group: { _id: null, totalValue: { $sum: '$dealValue' } } }
    ]);

    res.json({
      totalLeads,
      statusCounts: statusCounts.reduce((acc: any, curr: any) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      pipelineValue: activePipeline[0]?.totalValue || 0,
      totalRevenue: totalRevenue[0]?.totalValue || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
