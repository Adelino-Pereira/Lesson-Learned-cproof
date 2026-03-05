/**
 * seed.js — Seeds the database with initial demo data on first startup.
 * Inserts master types, processes, projects, and sample knowledge items.
 * Idempotent: only runs if master_type table is empty.
 * To reset data, delete backend/data.db and restart the server.
 */

const { getDb } = require('./database');

function seedIfEmpty() {
  const db = getDb();

  // Skip seeding if data already exists (idempotent check)
  const typeCount = db.prepare('SELECT COUNT(*) as c FROM master_type').get().c;
  if (typeCount > 0) {
    console.log('[SEED] Data already exists, skipping seed');
    return;
  }

  console.log('[SEED] Seeding database...');

  // --- Master Types (6 categories for classifying knowledge items) ---
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

  // --- Master Processes (9 manufacturing processes used across plants) ---
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

  // --- Master Projects (12 automotive projects across 4 OEMs) ---
  const insertProject = db.prepare(
    'INSERT INTO master_project (designation, name, description, customer, vehicle) VALUES (?, ?, ?, ?, ?)'
  );
  const projects = [
    ['Proj-2026/001', 'C3 Aircross Facelift', 'MY2027 facelift - new front grille and bumper', 'Stellantis', 'Citroen C3 Aircross'],
    ['Proj-2026/002', '2008 II Chrome Pack', 'Chrome exterior trim package for Peugeot 2008 II', 'Stellantis', 'Peugeot 2008'],
    ['Proj-2026/003', 'Megane E-Tech Bumper', 'Rear bumper assembly for Megane E-Tech electric', 'Renault', 'Renault Megane E-Tech'],
    ['Proj-2026/004', 'Golf IX Grille', 'Front grille and lower air intake assembly', 'Volkswagen', 'Volkswagen Golf'],
    ['Proj-2026/005', 'Duster III Trim', 'Interior B-pillar and C-pillar trim', 'Renault', 'Dacia Duster'],
    ['Proj-2026/006', '308 III Exterior Trim', 'Side mouldings and wheel arch trims', 'Stellantis', 'Peugeot 308'],
    ['Proj-2026/007', 'Clio VI Front End', 'Front bumper, fog lamp bezels, and DRL housing', 'Renault', 'Renault Clio'],
    ['Proj-2026/008', 'X1 U11 Rear Bumper', 'Painted rear bumper with PDC integration', 'BMW', 'BMW X1'],
    ['Proj-2026/009', 'Captur III Mirror Caps', 'Chrome and body-coloured mirror cap variants', 'Renault', 'Renault Captur'],
    ['Proj-2026/010', 'T-Roc Facelift Grille', 'Active shutter grille assembly', 'Volkswagen', 'Volkswagen T-Roc'],
    ['Proj-2025/015', 'Corsa F Door Handles', 'Flush door handle assemblies with chrome finish', 'Stellantis', 'Opel Corsa'],
    ['Proj-2025/018', 'ID.4 Charge Port', 'Charge port door with illuminated ring', 'Volkswagen', 'Volkswagen ID.4'],
  ];
  for (const [designation, name, description, customer, vehicle] of projects) {
    insertProject.run(designation, name, description, customer, vehicle);
  }

  // --- Knowledge Items (16 sample items with mixed statuses and types) ---
  const insertItem = db.prepare(`
    INSERT INTO knowledge_item (title, designation, date, owner, author, type_id, project_id, plant, document_link, visibility_status, derived_from_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertItemProcess = db.prepare('INSERT INTO knowledge_item_process (knowledge_item_id, process_id) VALUES (?, ?)');
  const insertFile = db.prepare(`
    INSERT INTO knowledge_item_file (knowledge_item_id, file_kind, filename_original, storage_path)
    VALUES (?, ?, ?, ?)
  `);
  // Links items to projects for the "Documents Used" feature
  const insertProjectLink = db.prepare('INSERT INTO project_knowledge_item (project_id, knowledge_item_id) VALUES (?, ?)');

  const items = [
    {
      title: 'Bumper injection mold cooling channel redesign',
      designation: 'LL-INJ-001',
      date: '2026-01-10',
      owner: 'Carlos Silva',
      author: 'Ana Rodrigues',
      type_id: 6, // Lessons-learned
      project_id: 1,
      plant: 'Doureca Portugal',
      document_link: 'https://docs.dourdin.com/ll/inj-001-cooling-redesign',
      status: 'APPROVED',
      processes: [1], // Injection
    },
    {
      title: 'Chrome adhesion loss on B-pillar trim — root cause',
      designation: 'LL-CHR-001',
      date: '2026-01-18',
      owner: 'Andrei Popescu',
      author: 'Andrei Popescu',
      type_id: 6, // Lessons-learned
      project_id: 2,
      plant: 'Dourdin Romania',
      document_link: 'https://docs.dourdin.com/ll/chr-001-adhesion-loss',
      status: 'APPROVED',
      processes: [2, 6], // Chrome + Hotstamping
    },
    {
      title: 'Paint booth airflow calibration procedure',
      designation: 'DOC-PNT-001',
      date: '2026-01-25',
      owner: 'Pierre Dumont',
      author: 'Pierre Dumont',
      type_id: 1, // Documentation
      project_id: 3,
      plant: 'Dourdin France',
      document_link: 'https://docs.dourdin.com/doc/pnt-001-airflow-calibration',
      status: 'APPROVED',
      processes: [3], // Paint
    },
    {
      title: 'Grille assembly fixture alignment best practice',
      designation: 'GP-ASM-001',
      date: '2026-02-03',
      owner: 'Mehmet Yilmaz',
      author: 'Mehmet Yilmaz',
      type_id: 4, // Good-practice
      project_id: 4,
      plant: 'Durden Turkey',
      document_link: null,
      status: 'APPROVED',
      processes: [7], // Castforming
    },
    {
      title: 'Incoming resin moisture control guideline',
      designation: 'GL-INJ-002',
      date: '2026-02-10',
      owner: 'Ana Rodrigues',
      author: 'Carlos Silva',
      type_id: 3, // Guide-line
      project_id: 1,
      plant: 'Doureca Portugal',
      document_link: 'https://docs.dourdin.com/gl/inj-002-resin-moisture',
      status: 'APPROVED',
      processes: [1], // Injection
    },
    {
      title: 'Hexavalent chrome bath contamination incident',
      designation: 'LL-CHR-002',
      date: '2026-02-14',
      owner: 'Andrei Popescu',
      author: 'Elena Stanescu',
      type_id: 6, // Lessons-learned
      project_id: 5,
      plant: 'Dourdin Romania',
      document_link: null,
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
      project_id: 3,
      plant: 'Dourdin France',
      document_link: null,
      status: 'APPROVED',
      processes: [3, 4], // Paint + Screen printing
    },
    {
      title: 'Clip insertion force tolerance study',
      designation: 'DOC-ASM-001',
      date: '2026-02-28',
      owner: 'Mehmet Yilmaz',
      author: 'Ayse Demir',
      type_id: 1, // Documentation
      project_id: 4,
      plant: 'Durden Turkey',
      document_link: 'https://docs.dourdin.com/doc/asm-001-clip-force',
      status: 'APPROVED',
      processes: [7, 8], // Castforming + Welding
    },
    {
      title: 'Weld line visibility reduction on gloss parts',
      designation: 'GP-INJ-001',
      date: '2026-03-05',
      owner: 'Carlos Silva',
      author: 'Ana Rodrigues',
      type_id: 4, // Good-practice
      project_id: 6,
      plant: 'Doureca Portugal',
      document_link: null,
      status: 'APPROVED',
      processes: [1, 3], // Injection + Paint
    },
    {
      title: 'Chrome plating thickness uniformity guideline',
      designation: 'GL-CHR-001',
      date: '2026-03-12',
      owner: 'Elena Stanescu',
      author: 'Andrei Popescu',
      type_id: 3, // Guide-line
      project_id: 2,
      plant: 'Dourdin Romania',
      document_link: null,
      status: 'APPROVED',
      processes: [2], // Chrome
    },
    {
      title: 'Robotic paint arm collision near-miss report',
      designation: 'LL-PNT-001',
      date: '2026-03-18',
      owner: 'Marie Laurent',
      author: 'Pierre Dumont',
      type_id: 6, // Lessons-learned
      project_id: 7,
      plant: 'Dourdin France',
      document_link: null,
      status: 'REJECTED',
      processes: [3], // Paint
    },
    {
      title: 'Final assembly torque wrench calibration standard',
      designation: 'DOC-ASM-002',
      date: '2026-03-22',
      owner: 'Ayse Demir',
      author: 'Mehmet Yilmaz',
      type_id: 1, // Documentation
      project_id: 4,
      plant: 'Durden Turkey',
      document_link: null,
      status: 'APPROVED',
      processes: [8], // Welding
    },
    {
      title: 'Cross-plant quality audit findings Q1 2026',
      designation: 'REC-QTY-001',
      date: '2026-03-28',
      owner: 'Ana Rodrigues',
      author: 'Elena Stanescu',
      type_id: 2, // Recommendation
      project_id: 1,
      plant: 'Doureca Portugal',
      document_link: null,
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
      project_id: 6,
      plant: 'Doureca Portugal',
      document_link: null,
      status: 'APPROVED',
      processes: [1, 9], // Injection + Film
    },
    {
      title: 'Chrome jig maintenance schedule recommendation',
      designation: 'REC-CHR-001',
      date: '2026-04-08',
      owner: 'Andrei Popescu',
      author: 'Andrei Popescu',
      type_id: 2, // Recommendation
      project_id: 5,
      plant: 'Dourdin Romania',
      document_link: null,
      status: 'APPROVED',
      processes: [2], // Chrome
    },
    {
      title: 'Cooling channel design standard for bumper molds',
      designation: 'GP-INJ-002',
      date: '2026-04-15',
      owner: 'Carlos Silva',
      author: 'Ana Rodrigues',
      type_id: 4, // Good-practice (derived from LL-INJ-001, item 1)
      project_id: 1,
      plant: 'Doureca Portugal',
      document_link: 'https://docs.dourdin.com/gp/inj-002-cooling-standard',
      status: 'APPROVED',
      processes: [1], // Injection
      derived_from_id: 1, // Derived from item 1 (LL-INJ-001)
    },
  ];

  // Run all inserts inside a transaction for atomicity and performance
  const seedAll = db.transaction(() => {
    for (const item of items) {
      // Insert the knowledge item and get its auto-generated ID
      const result = insertItem.run(
        item.title, item.designation, item.date,
        item.owner, item.author, item.type_id,
        item.project_id, item.plant, item.document_link, item.status,
        item.derived_from_id || null
      );
      const itemId = result.lastInsertRowid;

      // Link this item to its associated manufacturing processes (M2M)
      for (const processId of item.processes) {
        insertItemProcess.run(itemId, processId);
      }

      // Also link the item to its project for the "Documents Used" feature
      if (item.project_id) {
        insertProjectLink.run(item.project_id, itemId);
      }
    }

    // Add sample file attachment metadata (files don't physically exist in demo)
    insertFile.run(1, 'DOCUMENT', 'cooling_channel_report.pdf', 'uploads/cooling_channel_report.pdf');
    insertFile.run(1, 'IMAGE', 'mold_thermal_scan.png', 'uploads/mold_thermal_scan.png');
    insertFile.run(2, 'DOCUMENT', 'chrome_adhesion_analysis.pdf', 'uploads/chrome_adhesion_analysis.pdf');
    insertFile.run(8, 'DOCUMENT', 'clip_force_study.xlsx', 'uploads/clip_force_study.xlsx');
    insertFile.run(13, 'IMAGE', 'audit_findings_chart.png', 'uploads/audit_findings_chart.png');
  });

  seedAll();
  console.log('[SEED] Inserted 12 projects, 16 knowledge items, 6 types, 9 processes');
}

module.exports = { seedIfEmpty };
