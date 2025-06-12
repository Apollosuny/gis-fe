import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get all financial records (both campaign and project)
    const campaignFinancialRecords =
      await prisma.campaignFinancialRecord.findMany({
        include: {
          campaign: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      });

    const projectFinancialRecords =
      await prisma.projectFinancialRecord.findMany({
        include: {
          project: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      });

    // Calculate total income, expenses and balance
    let totalIncome = 0;
    let totalExpenses = 0;

    // Process campaign financial records
    campaignFinancialRecords.forEach((record) => {
      if (record.type === 'Income') {
        totalIncome += record.amount;
      } else if (record.type === 'Expense') {
        totalExpenses += record.amount;
      }
    });

    // Process project financial records
    projectFinancialRecords.forEach((record) => {
      if (record.type === 'Income') {
        totalIncome += record.amount;
      } else if (record.type === 'Expense') {
        totalExpenses += record.amount;
      }
    });

    // Calculate balance
    const totalBalance = totalIncome - totalExpenses;

    // Get financial data by month for trends
    const monthlyData = await getMonthlyFinancialData();

    // Format all financial records for display
    const allFinancialRecords = [
      ...campaignFinancialRecords.map((record) => ({
        id: record.id,
        date: record.date,
        type: record.type,
        amount: record.amount,
        description: record.description,
        source: `Campaign: ${record.campaign.name}`,
        sourceId: record.campaign_id,
        sourceType: 'campaign',
      })),
      ...projectFinancialRecords.map((record) => ({
        id: record.id,
        date: record.date,
        type: record.type,
        amount: record.amount,
        description: record.description,
        source: `Project: ${record.project.name}`,
        sourceId: record.project_id,
        sourceType: 'project',
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Return financial data
    return NextResponse.json({
      totalIncome,
      totalExpenses,
      totalBalance,
      monthlyData,
      recentTransactions: allFinancialRecords.slice(0, 10),
      allTransactions: allFinancialRecords,
    });
  } catch (error) {
    console.error('Error fetching finance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch finance data' },
      { status: 500 }
    );
  }
}

async function getMonthlyFinancialData() {
  const now = new Date();
  const monthsToShow = 12;
  const monthlyData = [];

  // Generate data for the last 12 months
  for (let i = 0; i < monthsToShow; i++) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    // Get campaign financial records for this month
    const campaignRecords = await prisma.campaignFinancialRecord.findMany({
      where: {
        date: {
          gte: month,
          lte: monthEnd,
        },
      },
    });

    // Get project financial records for this month
    const projectRecords = await prisma.projectFinancialRecord.findMany({
      where: {
        date: {
          gte: month,
          lte: monthEnd,
        },
      },
    });

    // Calculate income and expenses for this month
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    [...campaignRecords, ...projectRecords].forEach((record) => {
      if (record.type === 'Income') {
        monthlyIncome += record.amount;
      } else if (record.type === 'Expense') {
        monthlyExpenses += record.amount;
      }
    });

    monthlyData.unshift({
      month: month.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      income: monthlyIncome,
      expenses: monthlyExpenses,
      balance: monthlyIncome - monthlyExpenses,
    });
  }

  return monthlyData;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { sourceType, sourceId, type, amount, description, date } = data;

    let result;

    if (sourceType === 'campaign') {
      result = await prisma.campaignFinancialRecord.create({
        data: {
          campaign_id: sourceId,
          type,
          amount,
          description,
          date: date ? new Date(date) : new Date(),
        },
      });
    } else if (sourceType === 'project') {
      result = await prisma.projectFinancialRecord.create({
        data: {
          project_id: sourceId,
          type,
          amount,
          description,
          date: date ? new Date(date) : new Date(),
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid source type. Must be "campaign" or "project".' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating financial record:', error);
    return NextResponse.json(
      { error: 'Failed to create financial record' },
      { status: 500 }
    );
  }
}
