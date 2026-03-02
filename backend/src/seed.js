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
    ['DOC', 'Documentation'],
    ['REC', 'Recommendation'],
    ['GUI', 'Guideline'],
    ['GPR', 'Good Practice'],
    ['LLE', 'Lessons Learned'],
  ];
  for (const [code, label] of types) {
    insertType.run(code, label);
  }

  // --- Master Processes ---
  const insertProcess = db.prepare('INSERT INTO master_process (code, label) VALUES (?, ?)');
  const processes = [
    ['INJ', 'Injection'],
    ['CHR', 'Chrome'],
    ['PNT', 'Paint'],
    ['ASM', 'Assembly'],
    ['QTY', 'Quality'],
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
      title: 'Injection mold temperature guidelines',
      designation: 'GL-INJ-001',
      date: '2025-06-15',
      owner: 'Carlos Silva',
      author: 'Ana Rodrigues',
      type_id: 3, // Guideline
      project: 'PRJ-ALPHA',
      plant: 'Leiria',
      status: 'VISIBLE',
      processes: [1], // Injection
    },
    {
      title: 'Chrome plating defect root cause analysis',
      designation: 'LL-CHR-001',
      date: '2025-07-20',
      owner: 'Miguel Costa',
      author: 'Miguel Costa',
      type_id: 5, // Lessons Learned
      project: 'PRJ-ALPHA',
      plant: 'Leiria',
      status: 'VISIBLE',
      processes: [2, 5], // Chrome + Quality (multiple processes)
    },
    {
      title: 'Paint booth humidity control best practice',
      designation: 'GP-PNT-001',
      date: '2025-08-01',
      owner: 'Sofia Fernandes',
      author: 'João Martins',
      type_id: 4, // Good Practice
      project: 'PRJ-BETA',
      plant: 'Marinha Grande',
      status: 'VISIBLE',
      processes: [3], // Paint
    },
    {
      title: 'Assembly line torque specification update',
      designation: 'DOC-ASM-001',
      date: '2025-08-10',
      owner: 'Pedro Almeida',
      author: 'Pedro Almeida',
      type_id: 1, // Documentation
      project: 'PRJ-BETA',
      plant: 'Marinha Grande',
      status: 'PENDING',
      processes: [4], // Assembly
    },
    {
      title: 'Quality inspection checklist for chrome parts',
      designation: 'REC-QTY-001',
      date: '2025-09-05',
      owner: 'Ana Rodrigues',
      author: 'Carlos Silva',
      type_id: 2, // Recommendation
      project: 'PRJ-ALPHA',
      plant: 'Leiria',
      status: 'VISIBLE',
      processes: [2, 5], // Chrome + Quality
    },
    {
      title: 'Injection cycle time optimization findings',
      designation: 'LL-INJ-002',
      date: '2025-09-18',
      owner: 'Carlos Silva',
      author: 'Sofia Fernandes',
      type_id: 5, // Lessons Learned
      project: 'PRJ-ALPHA',
      plant: 'Leiria',
      status: 'VISIBLE',
      processes: [1, 5], // Injection + Quality
    },
    {
      title: 'Paint adhesion failure on textured surfaces',
      designation: 'LL-PNT-001',
      date: '2025-10-02',
      owner: 'João Martins',
      author: 'João Martins',
      type_id: 5, // Lessons Learned
      project: 'PRJ-BETA',
      plant: 'Marinha Grande',
      status: 'NOT_VISIBLE',
      processes: [3], // Paint
    },
    {
      title: 'Standard work instructions for assembly station 3',
      designation: 'DOC-ASM-002',
      date: '2025-10-15',
      owner: 'Pedro Almeida',
      author: 'Miguel Costa',
      type_id: 1, // Documentation
      project: 'PRJ-BETA',
      plant: 'Marinha Grande',
      status: 'VISIBLE',
      processes: [4], // Assembly
    },
    {
      title: 'Chrome bath chemical concentration monitoring',
      designation: 'GP-CHR-001',
      date: '2025-11-01',
      owner: 'Miguel Costa',
      author: 'Ana Rodrigues',
      type_id: 4, // Good Practice
      project: 'PRJ-ALPHA',
      plant: 'Leiria',
      status: 'PENDING',
      processes: [2], // Chrome
    },
    {
      title: 'Cross-process contamination prevention guide',
      designation: 'GUI-QTY-001',
      date: '2025-11-20',
      owner: 'Sofia Fernandes',
      author: 'Carlos Silva',
      type_id: 3, // Guideline
      project: 'PRJ-ALPHA',
      plant: 'Leiria',
      status: 'VISIBLE',
      processes: [1, 3, 5], // Injection + Paint + Quality
    },
    {
      title: 'Recommended packing standards for chrome parts',
      designation: 'REC-ASM-001',
      date: '2025-12-03',
      owner: 'Pedro Almeida',
      author: 'Pedro Almeida',
      type_id: 2, // Recommendation
      project: 'PRJ-BETA',
      plant: 'Marinha Grande',
      status: 'VISIBLE',
      processes: [4, 5], // Assembly + Quality
    },
    {
      title: 'Mold maintenance schedule documentation',
      designation: 'DOC-INJ-001',
      date: '2025-12-10',
      owner: 'Carlos Silva',
      author: 'Ana Rodrigues',
      type_id: 1, // Documentation
      project: 'PRJ-ALPHA',
      plant: 'Leiria',
      status: 'VISIBLE',
      processes: [1], // Injection
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

    // Add dummy file attachments to item 1 and item 2
    insertFile.run(1, 'DOCUMENT', 'injection_guidelines_v2.pdf', 'uploads/injection_guidelines_v2.pdf');
    insertFile.run(1, 'IMAGE', 'mold_diagram.png', 'uploads/mold_diagram.png');
    insertFile.run(2, 'DOCUMENT', 'chrome_defect_analysis.pdf', 'uploads/chrome_defect_analysis.pdf');
  });

  seedAll();
  console.log('[SEED] Inserted 12 knowledge items, 5 types, 5 processes');
}

module.exports = { seedIfEmpty };
