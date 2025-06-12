import { PrismaClient } from '../src/generated/prisma/index';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Helper functions for generating random data
const randomDate = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const randomEnum = <T extends Record<string, unknown>>(
  anEnum: T
): T[keyof T] => {
  const enumValues = Object.values(anEnum);
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex] as T[keyof T];
};

// Define enums for consistent data
const DonorType = {
  Individual: 'Individual',
  Corporate: 'Corporate',
  NonProfit: 'Non-Profit',
  Government: 'Government',
} as const;

const CampaignStatus = {
  Active: 'Active',
  Completed: 'Completed',
  Planned: 'Planned',
  OnHold: 'On Hold',
} as const;

const ProjectStatus = {
  Active: 'Active',
  Completed: 'Completed',
  Planning: 'Planning',
  OnHold: 'On Hold',
  Cancelled: 'Cancelled',
} as const;

const StaffRole = {
  ProjectManager: 'Project Manager',
  FieldOfficer: 'Field Officer',
  Coordinator: 'Coordinator',
  FinanceOfficer: 'Finance Officer',
  Administrator: 'Administrator',
  Executive: 'Executive',
  Volunteer: 'Volunteer',
} as const;

const TaskStatus = {
  NotStarted: 'Not Started',
  InProgress: 'In Progress',
  Completed: 'Completed',
  OnHold: 'On Hold',
  Cancelled: 'Cancelled',
} as const;

const TransactionType = {
  Income: 'Income',
  Expense: 'Expense',
  Budget: 'Budget',
  Transfer: 'Transfer',
} as const;

const DonationMethod = {
  CreditCard: 'Credit Card',
  BankTransfer: 'Bank Transfer',
  Check: 'Check',
  Cash: 'Cash',
  Mobile: 'Mobile Payment',
  Crypto: 'Cryptocurrency',
} as const;

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

  // Generate donors (50)
  const donors = [];

  // Individual donors (30)
  for (let i = 0; i < 30; i++) {
    donors.push(
      await prisma.donor.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          type: DonorType.Individual,
          join_date: randomDate(new Date('2023-01-01'), new Date('2025-05-01')),
        },
      })
    );
  }

  // Corporate donors (10)
  for (let i = 0; i < 10; i++) {
    donors.push(
      await prisma.donor.create({
        data: {
          name: faker.company.name(),
          email: faker.internet.email({ provider: 'company.com' }),
          phone: faker.phone.number(),
          type: DonorType.Corporate,
          join_date: randomDate(new Date('2023-01-01'), new Date('2025-05-01')),
        },
      })
    );
  }

  // Non-profit and government donors (10)
  for (let i = 0; i < 5; i++) {
    donors.push(
      await prisma.donor.create({
        data: {
          name: faker.company.name() + ' Foundation',
          email: faker.internet.email({ provider: 'foundation.org' }),
          phone: faker.phone.number(),
          type: DonorType.NonProfit,
          join_date: randomDate(new Date('2023-01-01'), new Date('2025-05-01')),
        },
      })
    );
  }

  for (let i = 0; i < 5; i++) {
    donors.push(
      await prisma.donor.create({
        data: {
          name: faker.location.country() + ' Government Aid',
          email: faker.internet.email({ provider: 'gov.org' }),
          phone: faker.phone.number(),
          type: DonorType.Government,
          join_date: randomDate(new Date('2023-01-01'), new Date('2025-05-01')),
        },
      })
    );
  }

  console.log(`Created ${donors.length} donors`);

  // Generate campaigns (10)
  const campaignThemes = [
    'Education for All',
    'Health Initiative',
    'Clean Water Access',
    'Sustainable Agriculture',
    'Women Empowerment',
    'Digital Literacy',
    'Disaster Relief',
    'Environmental Conservation',
    'Youth Leadership',
    'Community Development',
  ];

  const campaigns = [];

  for (let i = 0; i < 10; i++) {
    const startDate = randomDate(
      new Date('2024-01-01'),
      new Date('2025-01-01')
    );
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);

    campaigns.push(
      await prisma.campaign.create({
        data: {
          name: campaignThemes[i],
          description: faker.lorem.paragraph(),
          start_date: startDate,
          end_date: endDate,
          target_amount:
            Math.round(faker.number.float({ min: 50000, max: 500000 }) / 1000) *
            1000, // Round to nearest thousand
          status: randomEnum(CampaignStatus),
        },
      })
    );
  }

  console.log(`Created ${campaigns.length} campaigns`);

  // Generate donations (200)
  const donations = [];

  for (let i = 0; i < 200; i++) {
    const donor = donors[Math.floor(Math.random() * donors.length)];
    const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];

    donations.push(
      await prisma.donation.create({
        data: {
          donor_id: donor.id,
          campaign_id: campaign.id,
          amount: faker.number.float({
            min: 100,
            max: 50000,
            fractionDigits: 2,
          }),
          date: randomDate(new Date('2024-01-01'), new Date('2025-06-01')),
          method: randomEnum(DonationMethod),
        },
      })
    );
  }

  console.log(`Created ${donations.length} donations`);

  // Generate projects (20)
  const projectNames = [
    'School Building - Northern Region',
    'School Building - Southern Region',
    'Community Library Initiative',
    'Digital Classroom Project',
    'Medical Clinic - Eastern Region',
    'Mobile Health Unit',
    'Water Purification System',
    'Well Drilling Project',
    'Sustainable Farming Initiative',
    'Agricultural Training Center',
    "Women's Vocational Center",
    'Girls Education Support',
    'Computer Literacy Program',
    'Internet Access Points',
    'Flood Relief Operations',
    'Emergency Housing Construction',
    'Reforestation Initiative',
    'Wildlife Habitat Protection',
    'Youth Leadership Academy',
    'Community Center Construction',
  ];

  const projects = [];

  for (let i = 0; i < 20; i++) {
    const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
    const startDate = randomDate(
      new Date(campaign.start_date),
      new Date(campaign.end_date)
    );
    const endDate = randomDate(startDate, new Date(campaign.end_date));

    projects.push(
      await prisma.project.create({
        data: {
          name: projectNames[i],
          description: faker.lorem.paragraph(),
          campaign_id: campaign.id,
          start_date: startDate,
          end_date: endDate,
          status: randomEnum(ProjectStatus),
        },
      })
    );
  }

  console.log(`Created ${projects.length} projects`);

  // Generate beneficiaries (30)
  const beneficiaryTypes = [
    'School',
    'Community',
    'Hospital',
    'Village',
    'Orphanage',
    'Elderly Care Center',
  ];

  const beneficiaries = [];

  for (let i = 0; i < 30; i++) {
    const type =
      beneficiaryTypes[Math.floor(Math.random() * beneficiaryTypes.length)];
    const region = faker.location.state();

    beneficiaries.push(
      await prisma.beneficiary.create({
        data: {
          name: type + ' of ' + faker.location.city(),
          demographic_info: {
            region: region,
            communitySize: faker.number.int({ min: 100, max: 10000 }),
            beneficiaryCount: faker.number.int({ min: 50, max: 5000 }),
            primaryAgeGroup: faker.helpers.arrayElement([
              'Children',
              'Youth',
              'Adults',
              'Elderly',
              'Mixed',
            ]),
            ethnicComposition: faker.lorem.words(3),
            economicStatus: faker.helpers.arrayElement([
              'Low Income',
              'Mixed Income',
              'Very Low Income',
            ]),
            challenges: faker.lorem.words(5),
          },
          contact_info: {
            contactPerson: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            address:
              faker.location.streetAddress() +
              ', ' +
              faker.location.city() +
              ', ' +
              region,
            coordinates: {
              latitude: faker.location.latitude(),
              longitude: faker.location.longitude(),
            },
          },
        },
      })
    );
  }

  console.log(`Created ${beneficiaries.length} beneficiaries`);

  // Link projects to beneficiaries (random assignment)
  const projectBeneficiaries = [];

  // Sử dụng for...of thay vì forEach để hỗ trợ await
  for (const project of projects) {
    // Assign 1-3 beneficiaries to each project
    const numBeneficiaries = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...beneficiaries].sort(() => 0.5 - Math.random());
    const selectedBeneficiaries = shuffled.slice(0, numBeneficiaries);

    for (const beneficiary of selectedBeneficiaries) {
      projectBeneficiaries.push(
        await prisma.projectBeneficiary.create({
          data: {
            project_id: project.id,
            beneficiary_id: beneficiary.id,
          },
        })
      );
    }
  }

  console.log(
    `Created ${projectBeneficiaries.length} project-beneficiary links`
  );

  // Generate staff members (40)
  const staff = [];

  for (let i = 0; i < 40; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    staff.push(
      await prisma.staff.create({
        data: {
          name: firstName + ' ' + lastName,
          email: faker.internet.email({ firstName, lastName }),
          role: randomEnum(StaffRole),
        },
      })
    );
  }

  console.log(`Created ${staff.length} staff members`);

  // Generate tasks (100)
  const taskDescriptions = [
    'Initial site assessment',
    'Stakeholder meeting',
    'Procurement of materials',
    'Contractor selection',
    'Foundation work',
    'Construction phase 1',
    'Construction phase 2',
    'Equipment installation',
    'Staff training',
    'Beneficiary registration',
    'Community outreach',
    'Progress evaluation',
    'Financial audit',
    'Report preparation',
    'Media documentation',
    'Final handover',
  ];

  const tasks = [];

  for (let i = 0; i < 100; i++) {
    const project = projects[Math.floor(Math.random() * projects.length)];
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    const dueDate = randomDate(startDate, endDate);

    tasks.push(
      await prisma.task.create({
        data: {
          project_id: project.id,
          description:
            taskDescriptions[
              Math.floor(Math.random() * taskDescriptions.length)
            ] +
            ' - ' +
            faker.lorem.sentence(4),
          due_date: dueDate,
          status: randomEnum(TaskStatus),
        },
      })
    );
  }

  console.log(`Created ${tasks.length} tasks`);

  // Assign tasks to staff (random assignment)
  const taskStaffAssignments = [];

  // Sử dụng for...of thay vì forEach để hỗ trợ await
  for (const task of tasks) {
    // Assign 1-3 staff members to each task
    const numStaff = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...staff].sort(() => 0.5 - Math.random());
    const selectedStaff = shuffled.slice(0, numStaff);

    for (const staffMember of selectedStaff) {
      taskStaffAssignments.push(
        await prisma.taskStaff.create({
          data: {
            task_id: task.id,
            staff_id: staffMember.id,
          },
        })
      );
    }
  }

  console.log(`Created ${taskStaffAssignments.length} task-staff assignments`);

  // Generate financial records for projects (150)
  const projectFinancialRecords = [];

  // Each project gets multiple financial records
  for (const project of projects) {
    // Budget record
    projectFinancialRecords.push(
      await prisma.projectFinancialRecord.create({
        data: {
          project_id: project.id,
          type: 'Budget',
          amount: faker.number.float({
            min: 10000,
            max: 200000,
            fractionDigits: 2,
          }),
          description: 'Total project budget',
          date: new Date(project.start_date),
        },
      })
    );

    // 5-10 expense/income records per project
    const numRecords = Math.floor(Math.random() * 6) + 5;
    for (let i = 0; i < numRecords; i++) {
      const recordDate = randomDate(new Date(project.start_date), new Date());
      projectFinancialRecords.push(
        await prisma.projectFinancialRecord.create({
          data: {
            project_id: project.id,
            type: Math.random() > 0.8 ? 'Income' : 'Expense', // 80% expense, 20% income
            amount: faker.number.float({
              min: 500,
              max: 50000,
              fractionDigits: 2,
            }),
            description:
              faker.commerce.productName() +
              ' - ' +
              faker.commerce.productDescription().substring(0, 50),
            date: recordDate,
          },
        })
      );
    }
  }

  console.log(
    `Created ${projectFinancialRecords.length} project financial records`
  );

  // Generate financial records for campaigns (50)
  const campaignFinancialRecords = [];

  // Each campaign gets multiple financial records
  for (const campaign of campaigns) {
    // 3-7 financial records per campaign
    const numRecords = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < numRecords; i++) {
      const recordDate = randomDate(new Date(campaign.start_date), new Date());
      campaignFinancialRecords.push(
        await prisma.campaignFinancialRecord.create({
          data: {
            campaign_id: campaign.id,
            type: Math.random() > 0.3 ? 'Income' : 'Expense', // 70% income, 30% expense
            amount: faker.number.float({
              min: 1000,
              max: 75000,
              fractionDigits: 2,
            }),
            description: faker.finance.transactionDescription(),
            date: recordDate,
          },
        })
      );
    }
  }

  console.log(
    `Created ${campaignFinancialRecords.length} campaign financial records`
  );

  // Generate project reports (60)
  const projectReports = [];

  // Each project gets multiple reports
  for (const project of projects) {
    // 2-4 reports per project
    const numReports = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numReports; i++) {
      const reportDate = randomDate(new Date(project.start_date), new Date());
      const randomStaff = staff[Math.floor(Math.random() * staff.length)];

      projectReports.push(
        await prisma.projectReport.create({
          data: {
            project_id: project.id,
            title:
              faker.helpers.arrayElement([
                'Progress Report',
                'Status Update',
                'Implementation Review',
                'Impact Assessment',
                'Challenges and Solutions',
                'Milestone Achievement',
              ]) +
              ' - ' +
              reportDate.toLocaleDateString(),
            created_by: randomStaff.name,
            created_date: reportDate,
            content: faker.lorem.paragraphs(3),
            attachment_link:
              Math.random() > 0.5
                ? `https://storage.example.com/reports/${faker.string.uuid()}.pdf`
                : null,
          },
        })
      );
    }
  }

  console.log(`Created ${projectReports.length} project reports`);

  // Generate campaign reports (25)
  const campaignReports = [];

  // Each campaign gets multiple reports
  for (const campaign of campaigns) {
    // 2-3 reports per campaign
    const numReports = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < numReports; i++) {
      const reportDate = randomDate(new Date(campaign.start_date), new Date());
      const randomStaff = staff[Math.floor(Math.random() * staff.length)];

      campaignReports.push(
        await prisma.campaignReport.create({
          data: {
            campaign_id: campaign.id,
            title:
              faker.helpers.arrayElement([
                'Fundraising Update',
                'Donor Report',
                'Quarterly Review',
                'Impact Summary',
                'Annual Report',
                'Financial Overview',
              ]) +
              ' - ' +
              reportDate.toLocaleDateString(),
            created_by: randomStaff.name,
            created_date: reportDate,
            content: faker.lorem.paragraphs(3),
            attachment_link:
              Math.random() > 0.5
                ? `https://storage.example.com/campaign-reports/${faker.string.uuid()}.pdf`
                : null,
          },
        })
      );
    }
  }

  console.log(`Created ${campaignReports.length} campaign reports`);

  // Generate KPIs (60)
  const kpis = [];

  // Each project gets multiple KPIs
  for (const project of projects) {
    // Standard KPIs for all projects
    kpis.push(
      await prisma.kPI.create({
        data: {
          project_id: project.id,
          name: 'Progress',
          target_value: 100,
          current_value: faker.number.float({
            min: 0,
            max: 100,
            fractionDigits: 1,
          }),
          unit: 'percentage',
        },
      })
    );

    kpis.push(
      await prisma.kPI.create({
        data: {
          project_id: project.id,
          name: 'Beneficiaries Reached',
          target_value: faker.number.int({ min: 100, max: 5000 }),
          current_value: faker.number.int({ min: 0, max: 3000 }),
          unit: 'people',
        },
      })
    );

    kpis.push(
      await prisma.kPI.create({
        data: {
          project_id: project.id,
          name: 'Communities Served',
          target_value: faker.number.int({ min: 1, max: 10 }),
          current_value: faker.number.int({ min: 0, max: 7 }),
          unit: 'count',
        },
      })
    );
  }

  console.log(`Created ${kpis.length} KPIs`);

  console.log('Database has been seeded successfully with enhanced data');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
