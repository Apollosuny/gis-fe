import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { projectUtils } from '@/lib/db-utils';

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;

    const project = await projectUtils.getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate required fields
    const { name, description, start_date, end_date, status, campaign_id } =
      body;

    if (!name && !description && !start_date && !end_date && !status) {
      return NextResponse.json(
        { error: 'At least one field must be provided to update' },
        { status: 400 }
      );
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
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

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(start_date && { start_date: new Date(start_date) }),
        ...(end_date && { end_date: new Date(end_date) }),
        ...(status && { status }),
        ...(campaign_id !== undefined && { campaign_id }),
      },
    });

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: true,
        projectBeneficiaries: true,
        projectReports: true,
        projectFinancialRecords: true,
        kpis: true,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check for related records
    const hasRelations =
      existingProject.tasks.length > 0 ||
      existingProject.projectBeneficiaries.length > 0 ||
      existingProject.projectReports.length > 0 ||
      existingProject.projectFinancialRecords.length > 0 ||
      existingProject.kpis.length > 0;

    if (hasRelations) {
      return NextResponse.json(
        {
          error:
            'Cannot delete project with related records. Remove the related records first.',
        },
        { status: 400 }
      );
    }

    // Delete project
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
