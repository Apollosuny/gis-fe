import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { donorUtils, campaignUtils, projectUtils } from '@/lib/db-utils';

export async function GET() {
  try {
    // Get donor statistics
    const donorStats = await donorUtils.getDonorStatistics();

    // Get active campaigns
    const activeCampaigns = await prisma.campaign.findMany({
      where: { status: 'Active' },
      include: {
        donations: true,
      },
    });

    // Calculate total fundraising progress
    const campaignsData = activeCampaigns.map((campaign) => {
      const totalDonated = campaign.donations.reduce(
        (sum, donation) => sum + donation.amount,
        0
      );
      const progressPercentage = (totalDonated / campaign.target_amount) * 100;

      return {
        id: campaign.id,
        name: campaign.name,
        targetAmount: campaign.target_amount,
        raisedAmount: totalDonated,
        progressPercentage: Math.min(progressPercentage, 100),
      };
    });

    // Get project statistics
    const totalProjects = await prisma.project.count();
    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Get recent financial activities
    const recentFinancialActivities = [
      ...(
        await prisma.projectFinancialRecord.findMany({
          take: 5,
          orderBy: { date: 'desc' },
          include: { project: true },
        })
      ).map((record) => ({
        id: record.id,
        date: record.date,
        type: record.type,
        amount: record.amount,
        description: record.description,
        relatedTo: `Project: ${record.project.name}`,
      })),
      ...(
        await prisma.campaignFinancialRecord.findMany({
          take: 5,
          orderBy: { date: 'desc' },
          include: { campaign: true },
        })
      ).map((record) => ({
        id: record.id,
        date: record.date,
        type: record.type,
        amount: record.amount,
        description: record.description,
        relatedTo: `Campaign: ${record.campaign.name}`,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);

    // Get upcoming tasks
    const upcomingTasks = await prisma.task.findMany({
      where: {
        due_date: {
          gte: new Date(),
        },
        status: {
          not: 'Completed',
        },
      },
      take: 5,
      orderBy: {
        due_date: 'asc',
      },
      include: {
        project: true,
        taskStaff: {
          include: {
            staff: true,
          },
        },
      },
    });

    return NextResponse.json({
      donorStats,
      campaignsData,
      projectStats: {
        total: totalProjects,
        byStatus: projectsByStatus,
      },
      recentFinancialActivities,
      upcomingTasks,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
