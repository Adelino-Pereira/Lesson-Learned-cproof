const { getDb } = require('./database');

function seedIfEmpty() {
  const db = getDb();

  const typeCount = db.prepare('SELECT COUNT(*) as c FROM master_type').get().c;
  if (typeCount > 0) {
    console.log('[SEED] Data already exists, skipping seed');
    return;
  }

  console.log('[SEED] Seeding database...');

  // --- Master Types ---
  const insertType = db.prepare('INSERT INTO master_type (code, label) VALUES (?, ?)');
  const types = [
    ['DOC', 'Documentation'],     // 1
    ['REC', 'Recommendation'],    // 2
    ['GUI', 'Guide-line'],        // 3
    ['GPR', 'Good-practice'],     // 4
    ['DRU', 'Design-rule'],       // 5
    ['LLE', 'Lessons-learned'],   // 6
  ];
  for (const [code, label] of types) {
    insertType.run(code, label);
  }

  // --- Master Processes ---
  const insertProcess = db.prepare('INSERT INTO master_process (code, label) VALUES (?, ?)');
  const processes = [
    ['INJ', 'Injection'],        // 1
    ['CHR', 'Chrome'],           // 2
    ['PNT', 'Paint'],            // 3
    ['SCR', 'Screen printing'],  // 4
    ['PAD', 'Pad printing'],     // 5
    ['HOT', 'Hotstamping'],      // 6
    ['CST', 'Castforming'],      // 7
    ['WLD', 'Welding'],          // 8
    ['FLM', 'Film'],             // 9
  ];
  for (const [code, label] of processes) {
    insertProcess.run(code, label);
  }

  // --- Knowledge Items ---
  const insertItem = db.prepare(`
    INSERT INTO knowledge_item (title, designation, date, owner, author, type_id, project, plant, visibility_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertItemProcess = db.prepare('INSERT INTO knowledge_item_process (knowledge_item_id, process_id) VALUES (?, ?)');
  const insertFile = db.prepare(`
    INSERT INTO knowledge_item_file (knowledge_item_id, file_kind, filename_original, storage_path)
    VALUES (?, ?, ?, ?)
  `);
  const insertProjectLink = db.prepare('INSERT INTO project_knowledge_item (project, knowledge_item_id) VALUES (?, ?)');

  const items = [
    {
      title: 'Bumper injection mold cooling channel redesign',
      designation: 'LL-INJ-001',
      date: '2026-01-10',
      owner: 'Carlos Silva',
      author: 'Ana Rodrigues',
      type_id: 6, // Lessons-learned
      project: 'Proj-2026/001',
      plant: 'Doureca Portugal',
      status: 'VISIBLE',
      processes: [1], // Injection
    },
    {
      title: 'Chrome adhesion loss on B-pillar trim — root cause',
      designation: 'LL-CHR-001',
      date: '2026-01-18',
      owner: 'Andrei Popescu',
      author: 'Andrei Popescu',
      type_id: 6, // Lessons-learned
      project: 'Proj-2026/002',
      plant: 'Dourdin Romania',
      status: 'VISIBLE',
      processes: [2, 6], // Chrome + Hotstamping
    },
    {
      title: 'Paint booth airflow calibration procedure',
      designation: 'DOC-PNT-001',
      date: '2026-01-25',
      owner: 'Pierre Dumont',
      author: 'Pierre Dumont',
      type_id: 1, // Documentation
      project: 'Proj-2026/003',
      plant: 'Dourdin France',
      status: 'VISIBLE',
      processes: [3], // Paint
    },
    {
      title: 'Grille assembly fixture alignment best practice',
      designation: 'GP-ASM-001',
      date: '2026-02-03',
      owner: 'Mehmet Yilmaz',
      author: 'Mehmet Yilmaz',
      type_id: 4, // Good-practice
      project: 'Proj-2026/004',
      plant: 'Durden Turkey',
      status: 'VISIBLE',
      processes: [7], // Castforming
    },
    {
      title: 'Incoming resin moisture control guideline',
      designation: 'GL-INJ-002',
      date: '2026-02-10',
      owner: 'Ana Rodrigues',
      author: 'Carlos Silva',
      type_id: 3, // Guide-line
      project: 'Proj-2026/001',
      plant: 'Doureca Portugal',
      status: 'VISIBLE',
      processes: [1], // Injection
    },
    {
      title: 'Hexavalent chrome bath contamination incident',
      designation: 'LL-CHR-002',
      date: '2026-02-14',
      owner: 'Andrei Popescu',
      author: 'Elena Stanescu',
      type_id: 6, // Lessons-learned
      project: 'Proj-2026/005',
      plant: 'Dourdin Romania',
      status: 'PENDING',
      processes: [2], // Chrome
    },
    {
      title: 'Basecoat-clearcoat adhesion test recommendation',
      designation: 'REC-PNT-001',
      date: '2026-02-20',
      owner: 'Pierre Dumont',
      author: 'Marie Laurent',
      type_id: 2, // Recommendation
      project: 'Proj-2026/003',
      plant: 'Dourdin France',
      status: 'VISIBLE',
      processes: [3, 4], // Paint + Screen printing
    },
    {
      title: 'Clip insertion force tolerance study',
      designation: 'DOC-ASM-001',
      date: '2026-02-28',
      owner: 'Mehmet Yilmaz',
      author: 'Ayse Demir',
      type_id: 1, // Documentation
      project: 'Proj-2026/004',
      plant: 'Durden Turkey',
      status: 'VISIBLE',
      processes: [7, 8], // Castforming + Welding
    },
    {
      title: 'Weld line visibility reduction on gloss parts',
      designation: 'GP-INJ-001',
      date: '2026-03-05',
      owner: 'Carlos Silva',
      author: 'Ana Rodrigues',
      type_id: 4, // Good-practice
      project: 'Proj-2026/006',
      plant: 'Doureca Portugal',
      status: 'VISIBLE',
      processes: [1, 3], // Injection + Paint
    },
    {
      title: 'Chrome plating thickness uniformity guideline',
      designation: 'GL-CHR-001',
      date: '2026-03-12',
      owner: 'Elena Stanescu',
      author: 'Andrei Popescu',
      type_id: 3, // Guide-line
      project: 'Proj-2026/002',
      plant: 'Dourdin Romania',
      status: 'VISIBLE',
      processes: [2], // Chrome
    },
    {
      title: 'Robotic paint arm collision near-miss report',
      designation: 'LL-PNT-001',
      date: '2026-03-18',
      owner: 'Marie Laurent',
      author: 'Pierre Dumont',
      type_id: 6, // Lessons-learned
      project: 'Proj-2026/007',
      plant: 'Dourdin France',
      status: 'NOT_VISIBLE',
      processes: [3], // Paint
    },
    {
      title: 'Final assembly torque wrench calibration standard',
      designation: 'DOC-ASM-002',
      date: '2026-03-22',
      owner: 'Ayse Demir',
      author: 'Mehmet Yilmaz',
      type_id: 1, // Documentation
      project: 'Proj-2026/004',
      plant: 'Durden Turkey',
      status: 'VISIBLE',
      processes: [8], // Welding
    },
    {
      title: 'Cross-plant quality audit findings Q1 2026',
      designation: 'REC-QTY-001',
      date: '2026-03-28',
      owner: 'Ana Rodrigues',
      author: 'Elena Stanescu',
      type_id: 2, // Recommendation
      project: 'Proj-2026/001',
      plant: 'Doureca Portugal',
      status: 'PENDING',
      processes: [1, 2, 3, 6, 7, 8, 9], // Broad audit across processes
    },
    {
      title: 'UV-stabiliser dosing error on exterior trim',
      designation: 'LL-INJ-003',
      date: '2026-04-02',
      owner: 'Carlos Silva',
      author: 'Carlos Silva',
      type_id: 6, // Lessons-learned
      project: 'Proj-2026/006',
      plant: 'Doureca Portugal',
      status: 'VISIBLE',
      processes: [1, 9], // Injection + Film
    },
    {
      title: 'Chrome jig maintenance schedule recommendation',
      designation: 'REC-CHR-001',
      date: '2026-04-08',
      owner: 'Andrei Popescu',
      author: 'Andrei Popescu',
      type_id: 2, // Recommendation
      project: 'Proj-2026/005',
      plant: 'Dourdin Romania',
      status: 'VISIBLE',
      processes: [2], // Chrome
    },
  ];

  const seedAll = db.transaction(() => {
    for (const item of items) {
      const result = insertItem.run(
        item.title, item.designation, item.date,
        item.owner, item.author, item.type_id,
        item.project, item.plant, item.status
      );
      const itemId = result.lastInsertRowid;

      for (const processId of item.processes) {
        insertItemProcess.run(itemId, processId);
      }

      // Link to project
      insertProjectLink.run(item.project, itemId);
    }

    // Add dummy file attachments
    insertFile.run(1, 'DOCUMENT', 'cooling_channel_report.pdf', 'uploads/cooling_channel_report.pdf');
    insertFile.run(1, 'IMAGE', 'mold_thermal_scan.png', 'uploads/mold_thermal_scan.png');
    insertFile.run(2, 'DOCUMENT', 'chrome_adhesion_analysis.pdf', 'uploads/chrome_adhesion_analysis.pdf');
    insertFile.run(8, 'DOCUMENT', 'clip_force_study.xlsx', 'uploads/clip_force_study.xlsx');
    insertFile.run(13, 'IMAGE', 'audit_findings_chart.png', 'uploads/audit_findings_chart.png');
  });

  seedAll();
  console.log('[SEED] Inserted 15 knowledge items, 6 types, 9 processes');
}

module.exports = { seedIfEmpty };
