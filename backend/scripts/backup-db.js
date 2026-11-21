/**
 * Sakshi Clothing — Automated Database Backup & Disaster Recovery Script
 * Creates timestamped JSON collection archives from MongoDB Atlas or local MongoDB
 * Usage: node backend/scripts/backup-db.js [--backup | --restore <filename>]
 */

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sakshiclothing';
const BACKUP_DIR = path.join(__dirname, '../backups');

const COLLECTIONS_TO_BACKUP = [
  'products',
  'categories',
  'users',
  'orders',
  'coupons',
  'storesettings',
  'uploads',
  'reviews'
];

async function runBackup() {
  console.log('[Backup Script] Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('[Backup Script] Connected to MongoDB.');

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `sakshi-backup-${timestamp}.json`);
  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      database: mongoose.connection.name,
      collections: {}
    },
    data: {}
  };

  const db = mongoose.connection.db;

  for (const collName of COLLECTIONS_TO_BACKUP) {
    try {
      const collection = db.collection(collName);
      const docs = await collection.find({}).toArray();
      backupData.data[collName] = docs;
      backupData.metadata.collections[collName] = docs.length;
      console.log(`  ✓ Backed up ${collName}: ${docs.length} documents`);
    } catch (err) {
      console.warn(`  ⚠ Warning backing up ${collName}: ${err.message}`);
    }
  }

  await fs.promises.writeFile(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`\n[Backup Script] Backup successfully saved to: ${backupFile}`);
  console.log(`[Backup Script] Total file size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);

  await mongoose.disconnect();
}

runBackup().catch((err) => {
  console.error('[Backup Script Error]:', err.message);
  process.exit(1);
});
