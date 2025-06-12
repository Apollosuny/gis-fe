import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { campaignUtils } from '@/lib/db-utils';

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const campaign = await campaignUtils.getCampaignById(id);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;
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

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: {
        name,
        description,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        target_amount: parseFloat(String(target_amount)),
        status,
      },
    });

    return NextResponse.json({ campaign: updatedCampaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        projects: true,
        donations: true,
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if campaign has associated projects or donations
    if (
      existingCampaign.projects.length > 0 ||
      existingCampaign.donations.length > 0
    ) {
      return NextResponse.json(
        {
          error: 'Cannot delete campaign with associated projects or donations',
          projects: existingCampaign.projects.length,
          donations: existingCampaign.donations.length,
        },
        { status: 400 }
      );
    }

    // Delete campaign
    await prisma.campaign.delete({
      where: { id },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
