import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const donations = await prisma.donation.findMany({
      include: {
        donor: true,
        campaign: true,
      },
    });

    return NextResponse.json({ donations });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { donor_id, amount, method } = body;
    const { campaign_id } = body;

    if (!donor_id || !amount || !method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify donor exists
    const donor = await prisma.donor.findUnique({
      where: { id: donor_id },
    });

    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 400 });
    }

    // Verify campaign exists if campaign_id is provided
    if (campaign_id) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaign_id },
      });

      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 400 }
        );
      }
    }

    // Create donation
    const newDonation = await prisma.donation.create({
      data: {
        donor_id,
        campaign_id,
        amount: parseFloat(String(amount)),
        method,
        date: body.date ? new Date(body.date) : new Date(),
      },
      include: {
        donor: true,
        campaign: true,
      },
    });

    return NextResponse.json({ donation: newDonation }, { status: 201 });
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    );
  }
}
