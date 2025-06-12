import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.$transaction([
    prisma.taskStaff.deleteMany({}),
    prisma.task.deleteMany({}),
    prisma.projectReport.deleteMany({}),
    prisma.projectFinancialRecord.deleteMany({}),
    prisma.kPI.deleteMany({}),
    prisma.projectBeneficiary.deleteMany({}),
    prisma.staff.deleteMany({}),
    prisma.beneficiary.deleteMany({}),
    prisma.project.deleteMany({}),
    prisma.campaignFinancialRecord.deleteMany({}),
    prisma.campaignReport.deleteMany({}),
    prisma.donation.deleteMany({}),
    prisma.campaign.deleteMany({}),
    prisma.donor.deleteMany({}),
  ]);

  console.log('Database cleared. Starting to seed...');

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

  // Create more donors
  const donor2 = await prisma.donor.create({
    data: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1987654321',
      type: 'Individual',
    },
  });

  const corporateDonor = await prisma.donor.create({
    data: {
      name: 'ABC Corporation',
      email: 'donations@abccorp.com',
      phone: '+1122334455',
      type: 'Corporate',
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

  // Create another campaign
  const healthCampaign = await prisma.campaign.create({
    data: {
      name: 'Health Initiative',
      description: 'Campaign to support health services',
      start_date: new Date('2025-02-15'),
      end_date: new Date('2025-11-30'),
      target_amount: 75000,
      status: 'Active',
    },
  });

  // Create donations
  await prisma.donation.create({
    data: {
      donor_id: donor.id,
      campaign_id: campaign.id,
      amount: 1000,
      method: 'Bank Transfer',
    },
  });

  await prisma.donation.create({
    data: {
      donor_id: donor2.id,
      campaign_id: campaign.id,
      amount: 750,
      method: 'Credit Card',
    },
  });

  await prisma.donation.create({
    data: {
      donor_id: corporateDonor.id,
      campaign_id: healthCampaign.id,
      amount: 15000,
      method: 'Bank Transfer',
    },
  });

  // Create projects
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

  const libraryProject = await prisma.project.create({
    data: {
      name: 'Community Library',
      description: 'Establishing a library with educational resources',
      campaign_id: campaign.id,
      start_date: new Date('2025-03-15'),
      end_date: new Date('2025-08-30'),
      status: 'Active',
    },
  });

  const clinicProject = await prisma.project.create({
    data: {
      name: 'Medical Clinic',
      description: 'Building a medical clinic for underserved communities',
      campaign_id: healthCampaign.id,
      start_date: new Date('2025-04-01'),
      end_date: new Date('2025-11-15'),
      status: 'Planning',
    },
  });

  const completedProject = await prisma.project.create({
    data: {
      name: 'Computer Lab',
      description: 'Setting up a computer lab with educational software',
      campaign_id: campaign.id,
      start_date: new Date('2025-01-15'),
      end_date: new Date('2025-04-30'),
      status: 'Completed',
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
      type: 'Budget',
      amount: 45000,
      description: 'Total project budget',
    },
  });

  await prisma.projectFinancialRecord.create({
    data: {
      project_id: project.id,
      type: 'Expense',
      amount: 5000,
      description: 'Initial construction materials',
    },
  });

  await prisma.projectFinancialRecord.create({
    data: {
      project_id: project.id,
      type: 'Expense',
      amount: 8000,
      description: 'Labor costs - Month 1',
    },
  });

  // Add financial records for library project
  await prisma.projectFinancialRecord.create({
    data: {
      project_id: libraryProject.id,
      type: 'Budget',
      amount: 25000,
      description: 'Total library project budget',
    },
  });

  await prisma.projectFinancialRecord.create({
    data: {
      project_id: libraryProject.id,
      type: 'Expense',
      amount: 3500,
      description: 'Books and shelving',
    },
  });

  // Add financial records for clinic project
  await prisma.projectFinancialRecord.create({
    data: {
      project_id: clinicProject.id,
      type: 'Budget',
      amount: 60000,
      description: 'Total clinic project budget',
    },
  });

  // No expenses yet for planning stage project

  // Add financial records for completed computer lab project
  await prisma.projectFinancialRecord.create({
    data: {
      project_id: completedProject.id,
      type: 'Budget',
      amount: 15000,
      description: 'Total computer lab budget',
    },
  });

  await prisma.projectFinancialRecord.create({
    data: {
      project_id: completedProject.id,
      type: 'Expense',
      amount: 9000,
      description: 'Computer equipment',
    },
  });

  await prisma.projectFinancialRecord.create({
    data: {
      project_id: completedProject.id,
      type: 'Expense',
      amount: 3500,
      description: 'Software licenses',
    },
  });

  await prisma.projectFinancialRecord.create({
    data: {
      project_id: completedProject.id,
      type: 'Expense',
      amount: 2500,
      description: 'Installation and setup',
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

  // Add more financial records
  await prisma.projectFinancialRecord.create({
    data: {
      project_id: libraryProject.id,
      type: 'Expense',
      amount: 3000,
      description: 'Books and educational materials',
    },
  });

  await prisma.projectFinancialRecord.create({
    data: {
      project_id: clinicProject.id,
      type: 'Expense',
      amount: 20000,
      description: 'Medical equipment and supplies',
    },
  });

  await prisma.campaignFinancialRecord.create({
    data: {
      campaign_id: healthCampaign.id,
      type: 'Income',
      amount: 10000,
      description: 'Donation from health awareness event',
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

  // Add beneficiary KPI
  await prisma.kPI.create({
    data: {
      project_id: project.id,
      name: 'Beneficiaries',
      target_value: 500,
      current_value: 0,
      unit: 'people',
    },
  });

  // Add community KPI
  await prisma.kPI.create({
    data: {
      project_id: project.id,
      name: 'Communities Served',
      target_value: 5,
      current_value: 1,
      unit: 'count',
    },
  });

  // Add KPIs for library project
  await prisma.kPI.create({
    data: {
      project_id: libraryProject.id,
      name: 'Setup Progress',
      target_value: 100,
      current_value: 35,
      unit: 'percentage',
    },
  });

  await prisma.kPI.create({
    data: {
      project_id: libraryProject.id,
      name: 'Beneficiaries',
      target_value: 1200,
      current_value: 0,
      unit: 'people',
    },
  });

  await prisma.kPI.create({
    data: {
      project_id: libraryProject.id,
      name: 'Communities Served',
      target_value: 3,
      current_value: 0,
      unit: 'count',
    },
  });

  // Add KPIs for clinic project
  await prisma.kPI.create({
    data: {
      project_id: clinicProject.id,
      name: 'Planning Progress',
      target_value: 100,
      current_value: 70,
      unit: 'percentage',
    },
  });

  await prisma.kPI.create({
    data: {
      project_id: clinicProject.id,
      name: 'Beneficiaries',
      target_value: 2500,
      current_value: 0,
      unit: 'people',
    },
  });

  await prisma.kPI.create({
    data: {
      project_id: clinicProject.id,
      name: 'Communities Served',
      target_value: 8,
      current_value: 0,
      unit: 'count',
    },
  });

  // Add KPIs for completed computer lab project
  await prisma.kPI.create({
    data: {
      project_id: completedProject.id,
      name: 'Beneficiaries',
      target_value: 350,
      current_value: 280,
      unit: 'people',
    },
  });

  await prisma.kPI.create({
    data: {
      project_id: completedProject.id,
      name: 'Communities Served',
      target_value: 1,
      current_value: 1,
      unit: 'count',
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
