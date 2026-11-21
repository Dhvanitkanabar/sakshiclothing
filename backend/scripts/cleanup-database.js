/**
 * Sakshi Clothing — Safe Database Cleanup Script
 * Scans MongoDB for dummy, mock, and test content:
 * - Test products (e.g. matching /test|dummy|sample/i in name, slug, or tags)
 * - Dummy customer reviews (e.g. matching /test|dummy|lorem/i in comment)
 * - Test orders (e.g. matching /TEST/i in orderNumber or customer email)
 * - Test coupons (e.g. matching /TEST|DUMMY|SAMPLE/i in code)
 *
 * SAFETY RULES:
 * - DEFAULTS TO DRY RUN! It does NOT mutate or delete anything by default.
 * - To execute live deletion, you must explicitly pass:
 *     node cleanup-database.js --confirm-delete
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isLiveExecution = process.argv.includes('--confirm-delete');

const TEST_PATTERNS = {
  names: /test|dummy|sample|placeholder|lorem\s+ipsum/i,
  coupons: /^TEST|^DUMMY|^SAMPLE|^MOCK/i,
  emails: /test@|dummy@|example\.com|sakshi_test/i
};

async function runCleanup() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/sakshiclothing';
  console.log('------------------------------------------------------------');
  console.log('   Sakshi Clothing — Safe Database Audit & Cleanup Script   ');
  console.log('------------------------------------------------------------');
  console.log(`Mode: ${isLiveExecution ? '🚨 LIVE DELETION MODE (--confirm-delete detected)' : '🛡️ DRY RUN MODE (Safe Audit Only - No mutations)'}`);
  console.log(`Connecting to database: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}...`);

  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB successfully.\n');

  const db = mongoose.connection.db;

  // 1. Scan Products Collection
  const productsColl = db.collection('products');
  const dummyProducts = await productsColl.find({
    $or: [
      { name: { $regex: TEST_PATTERNS.names } },
      { slug: { $regex: TEST_PATTERNS.names } },
      { tags: { $in: ['test', 'dummy', 'sample', 'mock'] } },
      { 'images.url': { $regex: /placeholder|dummyimage/i } }
    ]
  }).toArray();

  console.log(`[Products] Found ${dummyProducts.length} dummy/test products:`);
  dummyProducts.forEach((p, idx) => {
    console.log(`   ${idx + 1}. [${p._id}] "${p.name}" (Slug: ${p.slug})`);
  });

  // 2. Scan Reviews Collection
  const reviewsColl = db.collection('reviews');
  const dummyReviews = await reviewsColl.find({
    $or: [
      { comment: { $regex: TEST_PATTERNS.names } },
      { title: { $regex: TEST_PATTERNS.names } }
    ]
  }).toArray();

  console.log(`\n[Reviews] Found ${dummyReviews.length} dummy/test reviews:`);
  dummyReviews.forEach((r, idx) => {
    console.log(`   ${idx + 1}. [${r._id}] Rating: ${r.rating}★ "${r.title || ''}" - ${r.comment?.slice(0, 50)}...`);
  });

  // 3. Scan Orders Collection
  const ordersColl = db.collection('orders');
  const dummyOrders = await ordersColl.find({
    $or: [
      { orderNumber: { $regex: /TEST/i } },
      { 'shippingAddress.fullName': { $regex: TEST_PATTERNS.names } },
      { 'shippingAddress.phone': { $regex: /0000000000|1234567890/ } }
    ]
  }).toArray();

  console.log(`\n[Orders] Found ${dummyOrders.length} test orders:`);
  dummyOrders.forEach((o, idx) => {
    console.log(`   ${idx + 1}. [${o._id}] #${o.orderNumber} - ₹${o.totals?.grandTotal || o.totalAmount || 0} (${o.orderStatus})`);
  });

  // 4. Scan Coupons Collection
  const couponsColl = db.collection('coupons');
  const dummyCoupons = await couponsColl.find({
    $or: [
      { code: { $regex: TEST_PATTERNS.coupons } },
      { description: { $regex: TEST_PATTERNS.names } }
    ]
  }).toArray();

  console.log(`\n[Coupons] Found ${dummyCoupons.length} dummy/test coupons:`);
  dummyCoupons.forEach((c, idx) => {
    console.log(`   ${idx + 1}. [${c._id}] Code: "${c.code}" (${c.discountPercentage || c.discountAmount}% off)`);
  });

  console.log('\n------------------------------------------------------------');
  console.log('AUDIT SUMMARY:');
  console.log(`• Dummy Products: ${dummyProducts.length}`);
  console.log(`• Dummy Reviews:  ${dummyReviews.length}`);
  console.log(`• Test Orders:    ${dummyOrders.length}`);
  console.log(`• Test Coupons:   ${dummyCoupons.length}`);
  console.log('------------------------------------------------------------');

  if (!isLiveExecution) {
    console.log('\n🛡️ DRY RUN COMPLETE. No data was modified or deleted.');
    console.log('To execute deletions, re-run with:');
    console.log('   node cleanup-database.js --confirm-delete\n');
  } else {
    console.log('\n🚨 EXECUTING PERMANENT DELETIONS...');
    if (dummyProducts.length > 0) {
      const pIds = dummyProducts.map(p => p._id);
      const resP = await productsColl.deleteMany({ _id: { $in: pIds } });
      console.log(`✓ Deleted ${resP.deletedCount} products.`);
    }
    if (dummyReviews.length > 0) {
      const rIds = dummyReviews.map(r => r._id);
      const resR = await reviewsColl.deleteMany({ _id: { $in: rIds } });
      console.log(`✓ Deleted ${resR.deletedCount} reviews.`);
    }
    if (dummyOrders.length > 0) {
      const oIds = dummyOrders.map(o => o._id);
      const resO = await ordersColl.deleteMany({ _id: { $in: oIds } });
      console.log(`✓ Deleted ${resO.deletedCount} orders.`);
    }
    if (dummyCoupons.length > 0) {
      const cIds = dummyCoupons.map(c => c._id);
      const resC = await couponsColl.deleteMany({ _id: { $in: cIds } });
      console.log(`✓ Deleted ${resC.deletedCount} coupons.`);
    }
    console.log('✓ Live database cleanup finished successfully.\n');
  }

  await mongoose.disconnect();
  console.log('Database connection closed.');
}

runCleanup().catch(err => {
  console.error('Database cleanup error:', err);
  process.exit(1);
});
