import {
  EligibilityStatus,
  FixtureStatus,
  PrismaClient,
  Role,
  SquadStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.matchSignature.deleteMany();
  await prisma.medicalReport.deleteMany();
  await prisma.medicalClearance.deleteMany();
  await prisma.disciplinaryCase.deleteMany();
  await prisma.disciplinaryRecord.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.webhookEndpoint.deleteMany();
  await prisma.seasonRegulation.deleteMany();
  await prisma.playerDocument.deleteMany();
  await prisma.guardianLink.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.fixtureChecklist.deleteMany();
  await prisma.seasonRosterEntry.deleteMany();
  await prisma.squadLineup.deleteMany();
  await prisma.squadSubmission.deleteMany();
  await prisma.refereeAssignment.deleteMany();
  await prisma.refereeProfile.deleteMany();
  await prisma.fixture.deleteMany();
  await prisma.round.deleteMany();
  await prisma.division.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.playerRegistration.deleteMany();
  await prisma.seasonClub.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.player.deleteMany();
  await prisma.club.deleteMany();
  await prisma.season.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("demo123", 10);

  const org = await prisma.organization.create({
    data: {
      name: "Премьер-лига Kickoff",
      slug: "demo",
      timezone: "Europe/Moscow",
    },
  });

  const season = await prisma.season.create({
    data: {
      organizationId: org.id,
      name: "2025/26",
      startDate: new Date("2025-08-01"),
      endDate: new Date("2026-06-01"),
      isActive: true,
      squadDeadlineHours: 48,
      maxBench: 7,
    },
  });

  await prisma.seasonRegulation.create({
    data: {
      seasonId: season.id,
      version: 1,
      createdBy: "seed",
      rules: {
        squadDeadlineHours: 48,
        maxBench: 7,
        minStarters: 7,
        yellowBanThreshold: 3,
        yellowBanMatches: 1,
        redBanMatches: 1,
        maxSquadSize: 25,
        pointsWin: 3,
        pointsDraw: 1,
        pointsLoss: 0,
      },
    },
  });

  const competition = await prisma.competition.create({
    data: { seasonId: season.id, name: "Первый дивизион" },
  });

  const division = await prisma.division.create({
    data: { competitionId: competition.id, name: "Группа A" },
  });

  const round = await prisma.round.create({
    data: { divisionId: division.id, number: 12, name: "Тур 12" },
  });

  const clubData = [
    { name: "ФК Динамо", shortName: "DIN", color: "#3d8bfd", venue: "Стадион «Центральный»" },
    { name: "Спартак Юниор", shortName: "SPA", color: "#ff4757", venue: "Стадион «Центральный»" },
    { name: "Зенит-2", shortName: "ZEN", color: "#3d8bfd", venue: "Арена Север" },
    { name: "Локомотив", shortName: "LOK", color: "#00e676", venue: "Арена Север" },
    { name: "Рубин", shortName: "RUB", color: "#00e676", venue: "Стадион «Восток»" },
    { name: "Акрон", shortName: "AKR", color: "#ffb020", venue: "Стадион «Восток»" },
  ];

  const clubs = await Promise.all(
    clubData.map((c) =>
      prisma.club.create({
        data: {
          organizationId: org.id,
          name: c.name,
          shortName: c.shortName,
          primaryColor: c.color,
          venue: c.venue,
        },
      }),
    ),
  );

  for (const club of clubs) {
    await prisma.seasonClub.create({
      data: { seasonId: season.id, clubId: club.id },
    });
  }

  await prisma.user.create({
    data: {
      email: "admin@kickoff.app",
      passwordHash: hash,
      name: "Platform Admin",
      memberships: {
        create: {
          organizationId: org.id,
          role: Role.PLATFORM_ADMIN,
        },
      },
    },
  });

  const operator = await prisma.user.create({
    data: {
      email: "operator@kickoff.app",
      passwordHash: hash,
      name: "Оператор Лиги",
      memberships: {
        create: {
          organizationId: org.id,
          role: Role.LEAGUE_OPERATOR,
        },
      },
    },
  });

  const referee = await prisma.user.create({
    data: {
      email: "referee@kickoff.app",
      passwordHash: hash,
      name: "Иван Судьин",
      memberships: {
        create: {
          organizationId: org.id,
          role: Role.REFEREE_CHIEF,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "coach@kickoff.app",
      passwordHash: hash,
      name: "Тренер Динамо",
      memberships: {
        create: {
          organizationId: org.id,
          role: Role.CLUB_COACH,
          clubId: clubs[0].id,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "delegate@kickoff.app",
      passwordHash: hash,
      name: "Делегат Динамо",
      memberships: {
        create: {
          organizationId: org.id,
          role: Role.CLUB_DELEGATE,
          clubId: clubs[0].id,
        },
      },
    },
  });

  const medical = await prisma.user.create({
    data: {
      email: "medical@kickoff.app",
      passwordHash: hash,
      name: "Врач лиги",
      memberships: {
        create: { organizationId: org.id, role: Role.MEDICAL_LEAGUE },
      },
    },
  });

  void medical;

  await prisma.refereeProfile.create({
    data: {
      userId: referee.id,
      organizationId: org.id,
      category: "FIFA",
      active: true,
    },
  });

  const guardianUser = await prisma.user.create({
    data: {
      email: "parent@kickoff.app",
      passwordHash: hash,
      name: "Родитель Иванов",
      memberships: {
        create: { organizationId: org.id, role: Role.GUARDIAN },
      },
    },
  });

  const playerNames = [
    ["Алексей", "Иванов"],
    ["Дмитрий", "Петров"],
    ["Максим", "Сидоров"],
    ["Никита", "Козлов"],
    ["Артём", "Новиков"],
    ["Илья", "Морозов"],
    ["Кирилл", "Волков"],
    ["Егор", "Соколов"],
    ["Павел", "Лебедев"],
    ["Роман", "Кузнецов"],
    ["Сергей", "Попов"],
    ["Андрей", "Васильев"],
    ["Михаил", "Зайцев"],
    ["Владимир", "Павлов"],
    ["Олег", "Семёнов"],
  ];

  let pIndex = 0;
  for (let ci = 0; ci < clubs.length; ci++) {
    for (let i = 0; i < 5; i++) {
      const [firstName, lastName] = playerNames[pIndex % playerNames.length];
      pIndex++;
      const player = await prisma.player.create({
        data: {
          organizationId: org.id,
          firstName,
          lastName: `${lastName} ${clubs[ci].shortName}`,
          dateOfBirth: new Date(2000 + (i % 8), i, 15),
          nationality: "RU",
        },
      });
      const reg = await prisma.playerRegistration.create({
        data: {
          playerId: player.id,
          clubId: clubs[ci].id,
          seasonId: season.id,
          shirtNumber: i + 1,
          position: i === 0 ? "GK" : "MF",
          eligibility:
            i === 4 && ci === 2
              ? EligibilityStatus.SUSPENDED
              : EligibilityStatus.ELIGIBLE,
        },
      });

      if (ci === 0 && i === 0) {
        await prisma.player.update({
          where: { id: player.id },
          data: { isMinor: true },
        });
        await prisma.guardianLink.create({
          data: { userId: guardianUser.id, playerId: player.id },
        });
      }

      await prisma.playerDocument.create({
        data: {
          playerId: player.id,
          docType: "medical",
          expiresAt: new Date("2027-01-01"),
          verified: true,
        },
      });

      if (ci === 0 && i === 1) {
        void reg;
      }
    }
  }

  const eligibleRegs = await prisma.playerRegistration.findMany({
    where: { seasonId: season.id, eligibility: EligibilityStatus.ELIGIBLE },
  });
  for (const reg of eligibleRegs) {
    await prisma.seasonRosterEntry.create({
      data: {
        seasonId: season.id,
        clubId: reg.clubId,
        registrationId: reg.id,
      },
    });
  }

  const now = new Date();
  const fixtures = await Promise.all([
    prisma.fixture.create({
      data: {
        roundId: round.id,
        homeClubId: clubs[0].id,
        awayClubId: clubs[1].id,
        scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0),
        venue: "Стадион «Центральный»",
        status: FixtureStatus.LIVE,
        homeScore: 2,
        awayScore: 1,
      },
    }),
    prisma.fixture.create({
      data: {
        roundId: round.id,
        homeClubId: clubs[2].id,
        awayClubId: clubs[3].id,
        scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 30),
        venue: "Арена Север",
        status: FixtureStatus.SQUADS_OPEN,
      },
    }),
    prisma.fixture.create({
      data: {
        roundId: round.id,
        homeClubId: clubs[4].id,
        awayClubId: clubs[5].id,
        scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0),
        status: FixtureStatus.SCHEDULED,
      },
    }),
    prisma.fixture.create({
      data: {
        roundId: round.id,
        homeClubId: clubs[1].id,
        awayClubId: clubs[2].id,
        scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 14, 0),
        status: FixtureStatus.CLOSED,
        homeScore: 1,
        awayScore: 1,
      },
    }),
  ]);

  await prisma.refereeAssignment.create({
    data: { fixtureId: fixtures[0].id, userId: referee.id, slot: "CHIEF" },
  });

  const dinamoRegs = await prisma.playerRegistration.findMany({
    where: { clubId: clubs[0].id, seasonId: season.id },
    take: 11,
  });

  const spartakRegs = await prisma.playerRegistration.findMany({
    where: { clubId: clubs[1].id, seasonId: season.id },
    take: 11,
  });

  const homeSquad = await prisma.squadSubmission.create({
    data: {
      fixtureId: fixtures[0].id,
      clubId: clubs[0].id,
      status: SquadStatus.LOCKED,
      submittedAt: new Date(),
    },
  });

  const awaySquad = await prisma.squadSubmission.create({
    data: {
      fixtureId: fixtures[0].id,
      clubId: clubs[1].id,
      status: SquadStatus.LOCKED,
      submittedAt: new Date(),
    },
  });

  for (let i = 0; i < dinamoRegs.length; i++) {
    await prisma.squadLineup.create({
      data: {
        submissionId: homeSquad.id,
        registrationId: dinamoRegs[i].id,
        isStarter: i < 11,
        isCaptain: i === 0,
        sortOrder: i,
      },
    });
  }

  for (let i = 0; i < spartakRegs.length; i++) {
    await prisma.squadLineup.create({
      data: {
        submissionId: awaySquad.id,
        registrationId: spartakRegs[i].id,
        isStarter: i < 11,
        isCaptain: i === 0,
        sortOrder: i,
      },
    });
  }

  await prisma.matchEvent.createMany({
    data: [
      {
        fixtureId: fixtures[0].id,
        type: "GOAL",
        minute: 12,
        teamClubId: clubs[0].id,
        registrationId: dinamoRegs[1]?.id,
        createdById: referee.id,
      },
      {
        fixtureId: fixtures[0].id,
        type: "GOAL",
        minute: 34,
        teamClubId: clubs[1].id,
        registrationId: spartakRegs[2]?.id,
        createdById: referee.id,
      },
      {
        fixtureId: fixtures[0].id,
        type: "GOAL",
        minute: 67,
        teamClubId: clubs[0].id,
        registrationId: dinamoRegs[3]?.id,
        createdById: referee.id,
      },
      {
        fixtureId: fixtures[0].id,
        type: "YELLOW",
        minute: 55,
        teamClubId: clubs[1].id,
        registrationId: spartakRegs[4]?.id,
        createdById: referee.id,
      },
    ],
  });

  await prisma.medicalReport.create({
    data: {
      fixtureId: fixtures[0].id,
      summary: "Матч без серьёзных инцидентов",
      injuries: "55' — лёгкое повреждение, игрок продолжил",
    },
  });

  await prisma.matchSignature.create({
    data: {
      fixtureId: fixtures[0].id,
      role: "REFEREE",
      userId: referee.id,
    },
  });

  console.log("Seed OK — demo123 для всех:");
  console.log("  operator@kickoff.app  — лига");
  console.log("  referee@kickoff.app   — судья");
  console.log("  coach@kickoff.app     — клуб");
  console.log("  delegate@kickoff.app  — делегат");
  console.log("  medical@kickoff.app   — врач");
  console.log("  parent@kickoff.app    — опекун");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
