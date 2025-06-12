import { NextResponse } from 'next/server';
import { projectUtils } from '@/lib/db-utils';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const projects = await projectUtils.getAllProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, description, start_date, end_date, status, campaign_id } =
      body;

    if (!name || !start_date || !end_date || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If campaign_id is provided, verify it exists
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

    // Create new project
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status,
        campaign_id,
      },
    });

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
