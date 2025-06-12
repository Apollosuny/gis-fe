import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get all staff members
    const staff = await prisma.staff.findMany({
      include: {
        taskStaff: {
          include: {
            task: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    });

    // Get staff statistics
    const totalStaff = staff.length;

    // Count staff by role
    const staffByRole = staff.reduce((acc: Record<string, number>, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {});

    // Format staff data with task counts and active projects
    const staffData = staff.map((member) => {
      const tasks = member.taskStaff.map((ts) => ts.task);
      const activeTasks = tasks.filter((task) => task.status !== 'Completed');
      const projects = new Set(tasks.map((task) => task.project.name));

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        totalTasks: tasks.length,
        activeTasks: activeTasks.length,
        projects: Array.from(projects),
      };
    });

    // Get tasks grouped by status
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Get recent tasks
    const recentTasks = await prisma.task.findMany({
      take: 10,
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

    const formattedRecentTasks = recentTasks.map((task) => {
      return {
        id: task.id,
        description: task.description,
        dueDate: task.due_date,
        status: task.status,
        project: task.project.name,
        projectId: task.project.id,
        assignedStaff: task.taskStaff.map((ts) => ({
          id: ts.staff.id,
          name: ts.staff.name,
        })),
      };
    });

    // Return HR data
    return NextResponse.json({
      stats: {
        totalStaff,
        staffByRole,
      },
      staffData,
      tasksByStatus,
      recentTasks: formattedRecentTasks,
    });
  } catch (error) {
    console.error('Error fetching HR data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch HR data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (data.type === 'staff') {
      // Create new staff member
      const { name, email, role } = data;
      const newStaff = await prisma.staff.create({
        data: {
          name,
          email,
          role,
        },
      });
      return NextResponse.json(newStaff);
    } else if (data.type === 'task') {
      // Create new task and assign staff
      const { projectId, description, dueDate, status, staffIds } = data;

      const newTask = await prisma.task.create({
        data: {
          project_id: projectId,
          description,
          due_date: new Date(dueDate),
          status,
          taskStaff: {
            create: staffIds.map((staffId: string) => ({
              staff: {
                connect: { id: staffId },
              },
            })),
          },
        },
      });

      return NextResponse.json(newTask);
    } else if (data.type === 'task_assignment') {
      // Assign staff to existing task
      const { taskId, staffId } = data;

      const taskStaff = await prisma.taskStaff.create({
        data: {
          task_id: taskId,
          staff_id: staffId,
        },
      });

      return NextResponse.json(taskStaff);
    }

    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing HR request:', error);
    return NextResponse.json(
      { error: 'Failed to process HR request' },
      { status: 500 }
    );
  }
}
