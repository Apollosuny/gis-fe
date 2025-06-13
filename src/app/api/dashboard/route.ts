import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { donorUtils } from '@/lib/db-utils';

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

    // Get monthly donation data for annual trends chart
    const currentYear = new Date().getFullYear();
    const monthlyDonations = await prisma.$queryRaw<
      Array<{ month: number; total: string }>
    >`
      SELECT
        EXTRACT(MONTH FROM date)::int as month,
        SUM(amount) as total
      FROM donations
      WHERE EXTRACT(YEAR FROM date) = ${currentYear}
      GROUP BY EXTRACT(MONTH FROM date)
      ORDER BY month
    `;

    // Fill in missing months with zeros
    const monthlyDonationData = Array(12).fill(0);
    monthlyDonations.forEach((item) => {
      monthlyDonationData[item.month - 1] = parseFloat(item.total);
    });

    // Calculate monthly targets based on active campaigns' target amounts
    const activeCampaignTargets = activeCampaigns.reduce(
      (sum, campaign) => sum + campaign.target_amount,
      0
    );
    const monthlyTargetData = Array(12).fill(
      Math.round(activeCampaignTargets / 12)
    );

    // Get donation sources data
    const donationsByMethod = await prisma.donation.groupBy({
      by: ['method'],
      _sum: {
        amount: true,
      },
    });

    const totalDonationAmount = donationsByMethod.reduce(
      (sum, item) => sum + (item._sum.amount || 0),
      0
    );

    const donationSources = donationsByMethod.map((item) => ({
      method: item.method,
      amount: item._sum.amount || 0,
      percentage: Math.round(
        ((item._sum.amount || 0) / totalDonationAmount) * 100
      ),
    }));

    // Get project budget data
    const projectBudget = await prisma.projectFinancialRecord.findMany({
      where: {
        type: 'Expense',
      },
      include: {
        project: true,
      },
    });

    // Group project expenses by category
    const expenseCategories = [
      'Admin',
      'Operations',
      'Marketing',
      'Development',
      'Research',
      'Training',
      'Materials',
    ];
    const projectExpensesByCategory = projectBudget.reduce((acc, record) => {
      // For the sake of this example, we'll assign expenses to categories based on description keywords
      // In a real application, this would be determined by a proper category field
      const description = record.description?.toLowerCase() || '';
      let category = 'Admin'; // default category

      if (description.includes('operation') || description.includes('maintain'))
        category = 'Operations';
      else if (
        description.includes('market') ||
        description.includes('advertis')
      )
        category = 'Marketing';
      else if (description.includes('develop') || description.includes('build'))
        category = 'Development';
      else if (
        description.includes('research') ||
        description.includes('study')
      )
        category = 'Research';
      else if (
        description.includes('train') ||
        description.includes('workshop')
      )
        category = 'Training';
      else if (
        description.includes('material') ||
        description.includes('supply')
      )
        category = 'Materials';

      if (!acc[category]) acc[category] = 0;
      acc[category] += record.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array format expected by chart
    const projectExpensesData = expenseCategories.map(
      (category) => projectExpensesByCategory[category] || 0
    );

    // Get monthly donors comparison (current year vs previous year)
    const previousYear = currentYear - 1;

    const currentYearMonthlyDonorCounts = await prisma.$queryRaw<
      Array<{ month: number; count: string }>
    >`
      SELECT
        EXTRACT(MONTH FROM join_date)::int as month,
        COUNT(*) as count
      FROM donors
      WHERE EXTRACT(YEAR FROM join_date) = ${currentYear}
      GROUP BY EXTRACT(MONTH FROM join_date)
      ORDER BY month
    `;

    const previousYearMonthlyDonorCounts = await prisma.$queryRaw<
      Array<{ month: number; count: string }>
    >`
      SELECT
        EXTRACT(MONTH FROM join_date)::int as month,
        COUNT(*) as count
      FROM donors
      WHERE EXTRACT(YEAR FROM join_date) = ${previousYear}
      GROUP BY EXTRACT(MONTH FROM join_date)
      ORDER BY month
    `;

    // Fill in missing months
    const currentYearDonors = Array(12).fill(0);
    const previousYearDonors = Array(12).fill(0);

    currentYearMonthlyDonorCounts.forEach((item) => {
      currentYearDonors[item.month - 1] = parseInt(item.count);
    });

    previousYearMonthlyDonorCounts.forEach((item) => {
      previousYearDonors[item.month - 1] = parseInt(item.count);
    });

    // Get project timeline data
    const projectTimeline = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        start_date: true,
        end_date: true,
        status: true,
      },
      orderBy: {
        start_date: 'asc',
      },
      take: 10,
    });

    // Get recent donors with their donations
    const recentDonors = await prisma.donor.findMany({
      take: 4,
      orderBy: {
        join_date: 'desc',
      },
      include: {
        donations: {
          orderBy: {
            date: 'desc',
          },
          take: 1,
        },
      },
    });

    // Calculate total stats
    const totalDonations = await prisma.donation.aggregate({
      _sum: { amount: true },
    });

    const activeCampaignCount = await prisma.campaign.count({
      where: { status: 'Active' },
    });

    const activeProjectCount = await prisma.project.count({
      where: { status: 'Active' },
    });

    return NextResponse.json({
      stats: {
        totalDonations: totalDonations._sum.amount || 0,
        totalDonors: donorStats.totalDonors,
        activeCampaigns: activeCampaignCount,
        activeProjects: activeProjectCount,
      },
      donorStats,
      campaignsData,
      projectStats: {
        total: totalProjects,
        byStatus: projectsByStatus,
      },
      recentFinancialActivities,
      upcomingTasks,
      chartData: {
        donationTrends: {
          monthly: monthlyDonationData,
          targets: monthlyTargetData,
        },
        donationSources,
        projectBudget: {
          categories: expenseCategories,
          expenses: projectExpensesData,
          // For demo purposes, creating some allocated budget numbers
          allocated: expenseCategories.map((category) =>
            Math.round((projectExpensesByCategory[category] || 0) * 1.1)
          ),
        },
        monthlyDonorsComparison: {
          currentYear,
          previousYear,
          currentYearData: currentYearDonors,
          previousYearData: previousYearDonors,
        },
        projectTimeline,
      },
      recentCampaigns: campaignsData.slice(0, 3), // Top 3 active campaigns
      recentDonors: recentDonors.map((donor) => ({
        id: donor.id,
        name: donor.name,
        joinDate: donor.join_date,
        recentDonation: donor.donations[0]?.amount || 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
