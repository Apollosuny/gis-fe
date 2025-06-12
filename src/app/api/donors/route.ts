import { NextResponse } from 'next/server';
import { donorUtils } from '@/lib/db-utils';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const donors = await donorUtils.getAllDonorsWithTotalDonations();
    return NextResponse.json({ donors });
  } catch (error) {
    console.error('Error fetching donors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, email, phone, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Check for duplicate email if provided
    if (email) {
      const existingDonor = await prisma.donor.findUnique({
        where: { email },
      });

      if (existingDonor) {
        return NextResponse.json(
          { error: 'A donor with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Create new donor
    const newDonor = await prisma.donor.create({
      data: {
        name,
        email,
        phone,
        type,
      },
    });

    return NextResponse.json({ donor: newDonor }, { status: 201 });
  } catch (error) {
    console.error('Error creating donor:', error);
    return NextResponse.json(
      { error: 'Failed to create donor' },
      { status: 500 }
    );
  }
}
