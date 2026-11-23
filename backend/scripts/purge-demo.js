import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../src/models/Product.model.js';
import Review from '../src/models/Review.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sakshiclothing';
const hasConfirmFlag = process.argv.includes('--confirm');

async function purge() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to: ${mongoose.connection.host}/${mongoose.connection.name}`);

  // 1. Query for all products marked with isDemo: true
  const demoProducts = await Product.find({ isDemo: true }).select('_id name slug pricing isDemo');
  const demoCount = demoProducts.length;

  console.log(`\nFound ${demoCount} demo products matching query { isDemo: true }.`);

  if (demoCount === 0) {
    console.log('No demo products found in catalog. Nothing to delete.');
    await mongoose.disconnect();
    return;
  }

  // Preview first 5 items
  console.log('\nSample demo products:');
  demoProducts.slice(0, 5).forEach((p, idx) => {
    console.log(`  ${idx + 1}. [DEMO] ${p.name} (₹${p.pricing?.basePrice}) - ID: ${p._id}`);
  });
  if (demoCount > 5) {
    console.log(`  ... and ${demoCount - 5} more items.`);
  }

  // 2. Dry run check
  if (!hasConfirmFlag) {
    console.log('\n====================================================================');
    console.log('⚠️  DRY RUN MODE: No database changes were made.');
    console.log(`To permanently purge all ${demoCount} demo items and their linked data,`);
    console.log('run the command with the --confirm flag:');
    console.log('   node backend/scripts/purge-demo.js --confirm');
    console.log('====================================================================\n');
    await mongoose.disconnect();
    return;
  }

  // 3. Execution on confirmed flag
  console.log('\n⚡ CONFIRMED PURGE: Deleting demo products...');
  const demoIds = demoProducts.map(p => p._id);

  // Clean up any linked mock reviews if present
  try {
    const reviewResult = await Review.deleteMany({ product: { $in: demoIds } });
    console.log(`  ✓ Removed ${reviewResult.deletedCount} linked reviews.`);
  } catch (err) {
    console.warn('  ⚠️ Note on review cleanup:', err.message);
  }

  const deleteResult = await Product.deleteMany({ isDemo: true });
  console.log(`  ✓ Permanently deleted ${deleteResult.deletedCount} demo products.`);

  const remaining = await Product.countDocuments({ isDemo: true });
  console.log(`\n✅ Purge complete. Remaining demo products: ${remaining}`);

  await mongoose.disconnect();
}

purge().catch(err => {
  console.error('Fatal error during purge:', err);
  process.exit(1);
});
