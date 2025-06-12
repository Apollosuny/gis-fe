import { prisma } from './db';
import {
  Donor,
  Campaign,
  Project,
  Staff,
  Beneficiary,
  KPI,
} from '../../src/generated/prisma';

// Donor utilities
export const donorUtils = {
  // Get all donors with their total donation amount
  async getAllDonorsWithTotalDonations() {
    return prisma.donor.findMany({
      include: {
        donations: true,
      },
    });
  },

  // Get donor statistics
  async getDonorStatistics() {
    const donorCount = await prisma.donor.count();
    const totalDonated = await prisma.donation.aggregate({
      _sum: {
        amount: true,
      },
    });

    const recentDonors = await prisma.donor.findMany({
      take: 5,
      orderBy: {
        join_date: 'desc',
      },
      include: {
        donations: true,
      },
    });

    return {
      totalDonors: donorCount,
      totalDonated: totalDonated._sum.amount || 0,
      recentDonors,
    };
  },
};

// Campaign utilities
export const campaignUtils = {
  // Get all campaigns with their donations and projects
  async getAllCampaigns() {
    return prisma.campaign.findMany({
      include: {
        donations: true,
        projects: true,
        campaignReports: true,
        campaignFinancialRecords: true,
      },
    });
  },

  // Get campaign by ID with all related data
  async getCampaignById(id: string) {
    return prisma.campaign.findUnique({
      where: { id },
      include: {
        donations: {
          include: {
            donor: true,
          },
        },
        projects: true,
        campaignReports: true,
        campaignFinancialRecords: true,
      },
    });
  },

  // Get campaign financial summary
  async getCampaignFinancialSummary(id: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        donations: true,
        campaignFinancialRecords: true,
      },
    });

    if (!campaign) return null;

    const totalDonations = campaign.donations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    );

    const expenses = campaign.campaignFinancialRecords
      .filter((record) => record.type === 'Expense')
      .reduce((sum, record) => sum + record.amount, 0);

    const income = campaign.campaignFinancialRecords
      .filter((record) => record.type === 'Income')
      .reduce((sum, record) => sum + record.amount, 0);

    return {
      campaign,
      totalDonations,
      totalExpenses: expenses,
      totalIncome: income + totalDonations,
      netBalance: income + totalDonations - expenses,
      progress: ((income + totalDonations) / campaign.target_amount) * 100,
    };
  },
};

// Project utilities
export const projectUtils = {
  // Get all projects with their related data
  async getAllProjects() {
    return prisma.project.findMany({
      include: {
        campaign: true,
        projectBeneficiaries: {
          include: {
            beneficiary: true,
          },
        },
        kpis: true,
        projectReports: true,
        tasks: {
          include: {
            taskStaff: {
              include: {
                staff: true,
              },
            },
          },
        },
      },
    });
  },

  // Get project by ID with all related data
  async getProjectById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        campaign: true,
        projectBeneficiaries: {
          include: {
            beneficiary: true,
          },
        },
        kpis: true,
        projectReports: true,
        tasks: {
          include: {
            taskStaff: {
              include: {
                staff: true,
              },
            },
          },
        },
        projectFinancialRecords: true,
      },
    });
  },

  // Get project KPIs
  async getProjectKPIs(projectId: string) {
    return prisma.kPI.findMany({
      where: {
        project_id: projectId,
      },
    });
  },

  // Get project tasks with assigned staff
  async getProjectTasks(projectId: string) {
    return prisma.task.findMany({
      where: {
        project_id: projectId,
      },
      include: {
        taskStaff: {
          include: {
            staff: true,
          },
        },
      },
    });
  },
};

// Staff utilities
export const staffUtils = {
  // Get all staff with their assigned tasks
  async getAllStaffWithTasks() {
    return prisma.staff.findMany({
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
  },

  // Get staff by ID with assigned tasks
  async getStaffById(id: string) {
    return prisma.staff.findUnique({
      where: { id },
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
  },
};

// Beneficiary utilities
export const beneficiaryUtils = {
  // Get all beneficiaries with their projects
  async getAllBeneficiaries() {
    return prisma.beneficiary.findMany({
      include: {
        projectBeneficiaries: {
          include: {
            project: true,
          },
        },
      },
    });
  },
};
