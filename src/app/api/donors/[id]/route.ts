import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;

    const donor = await prisma.donor.findUnique({
      where: { id },
      include: {
        donations: true,
      },
    });

    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    return NextResponse.json({ donor });
  } catch (error) {
    console.error('Error fetching donor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate required fields
    const { name, email, phone, type } = body;

    if (!name && !email && !phone && !type) {
      return NextResponse.json(
        { error: 'At least one field must be provided to update' },
        { status: 400 }
      );
    }

    // Check if donor exists
    const existingDonor = await prisma.donor.findUnique({
      where: { id },
    });

    if (!existingDonor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    // Check for duplicate email if email is being updated
    if (email && email !== existingDonor.email) {
      const duplicateEmail = await prisma.donor.findUnique({
        where: { email },
      });

      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'A donor with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Update donor
    const updatedDonor = await prisma.donor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(type && { type }),
      },
    });

    return NextResponse.json({ donor: updatedDonor });
  } catch (error) {
    console.error('Error updating donor:', error);
    return NextResponse.json(
      { error: 'Failed to update donor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;

    // Check if donor exists
    const existingDonor = await prisma.donor.findUnique({
      where: { id },
      include: { donations: true },
    });

    if (!existingDonor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    // Check for related donations
    if (existingDonor.donations.length > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete donor with related donations. Remove the donations first.',
        },
        { status: 400 }
      );
    }

    // Delete donor
    await prisma.donor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting donor:', error);
    return NextResponse.json(
      { error: 'Failed to delete donor' },
      { status: 500 }
    );
  }
}
