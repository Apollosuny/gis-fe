import { NextResponse } from 'next/server';
import { campaignUtils } from '@/lib/db-utils';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const campaigns = await campaignUtils.getAllCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, description, start_date, end_date, target_amount, status } =
      body;

    if (!name || !start_date || !end_date || !target_amount || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new campaign using Prisma
    const newCampaign = await prisma.campaign.create({
      data: {
        name,
        description,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        target_amount: parseFloat(String(target_amount)),
        status,
      },
    });

    return NextResponse.json({ campaign: newCampaign }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
