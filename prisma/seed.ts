import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Sample data seeding

  // Create a donor
  const donor = await prisma.donor.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      type: 'Individual',
    },
  });

  // Create a campaign
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Education for All',
      description: 'Campaign to support education initiatives',
      start_date: new Date('2025-01-01'),
      end_date: new Date('2025-12-31'),
      target_amount: 100000,
      status: 'Active',
    },
  });

  // Create a donation
  await prisma.donation.create({
    data: {
      donor_id: donor.id,
      campaign_id: campaign.id,
      amount: 1000,
      method: 'Bank Transfer',
    },
  });

  // Create a project
  const project = await prisma.project.create({
    data: {
      name: 'School Building Project',
      description: 'Building a new school in the community',
      campaign_id: campaign.id,
      start_date: new Date('2025-02-01'),
      end_date: new Date('2025-10-31'),
      status: 'Active',
    },
  });

  // Create a beneficiary
  const beneficiary = await prisma.beneficiary.create({
    data: {
      name: 'Local Community School',
      demographic_info: {
        region: 'North',
        communitySize: 1200,
        primaryAgeChildren: 300,
      },
      contact_info: {
        email: 'contact@localcommunityschool.org',
        phone: '+10987654321',
        address: '123 Community St',
      },
    },
  });

  // Link project and beneficiary
  await prisma.projectBeneficiary.create({
    data: {
      project_id: project.id,
      beneficiary_id: beneficiary.id,
    },
  });

  // Add financial record for project
  await prisma.projectFinancialRecord.create({
    data: {
      project_id: project.id,
      type: 'Expense',
      amount: 5000,
      description: 'Initial construction materials',
    },
  });

  // Add financial record for campaign
  await prisma.campaignFinancialRecord.create({
    data: {
      campaign_id: campaign.id,
      type: 'Income',
      amount: 2500,
      description: 'Corporate sponsor donation',
    },
  });

  // Add KPI
  await prisma.kPI.create({
    data: {
      project_id: project.id,
      name: 'Construction Progress',
      target_value: 100,
      current_value: 10,
      unit: 'percentage',
    },
  });

  // Add staff member
  const staff = await prisma.staff.create({
    data: {
      name: 'Jane Smith',
      email: 'jane.smith@organization.org',
      role: 'Project Manager',
    },
  });

  // Add task
  const task = await prisma.task.create({
    data: {
      project_id: project.id,
      description: 'Complete foundation work',
      due_date: new Date('2025-03-15'),
      status: 'In Progress',
    },
  });

  // Assign task to staff
  await prisma.taskStaff.create({
    data: {
      task_id: task.id,
      staff_id: staff.id,
    },
  });

  // Add project report
  await prisma.projectReport.create({
    data: {
      project_id: project.id,
      title: 'Initial Progress Report',
      created_by: staff.name,
      content: 'The project has started with the foundation work in progress.',
    },
  });

  // Add campaign report
  await prisma.campaignReport.create({
    data: {
      campaign_id: campaign.id,
      title: 'First Quarter Fundraising Report',
      created_by: staff.name,
      content:
        'The campaign has reached 25% of its target amount in the first quarter.',
    },
  });

  console.log('Database has been seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
