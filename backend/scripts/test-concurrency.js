import mongoose from 'mongoose';
import dotenv from 'dotenv';
import OrderService from '../src/services/order.service.js';
import Product from '../src/models/Product.model.js';
import User from '../src/models/User.model.js';
import orderRepository from '../src/repositories/order.repository.js';
import addressRepository from '../src/repositories/address.repository.js';

dotenv.config();

const MONGODB_URI = 'mongodb://127.0.0.1:27018/sakshiclothing_staging?replicaSet=rs0';

const runTests = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Replica Set');

    // Setup Test Data
    let user = await User.findOne({ email: 'test_concurrency@example.com' });
    if (!user) {
      user = await User.create({
        clerkUserId: 'fake_clerk_id_' + Date.now(),
        email: 'test_concurrency@example.com',
        fullName: 'Test Concurrency',
        role: 'user'
      });
    }

    const address = await addressRepository.create({
      user: user._id,
      fullName: 'Test User',
      phone: '1234567890',
      pincode: '123456',
      state: 'Test State',
      city: 'Test City',
      houseNumber: '123',
      street: 'Test Street',
      area: 'Test Area'
    });

    // =========================================================================
    // PHASE 4: INVENTORY CONCURRENCY (STOCK = 1, 2 Requests)
    // =========================================================================
    console.log('\n--- STARTING CONCURRENCY TEST (Stock=1) ---');
    const product1 = await Product.create({
      name: 'Concurrency Test Product 1',
      slug: 'concurrency-test-product-1',
      description: 'Testing race conditions',
      category: new mongoose.Types.ObjectId(),
      brand: new mongoose.Types.ObjectId(),
      pricing: { basePrice: 100 },
      variants: [{ sku: 'TEST-SKU-1', size: 'M', stock: 1, price: 100 }],
      isActive: true
    });
    
    const checkoutReq1 = OrderService.createCheckoutOrder(user._id, [{
      productId: product1._id, variantId: product1.variants[0]._id, quantity: 1
    }], address._id);

    const checkoutReq2 = OrderService.createCheckoutOrder(user._id, [{
      productId: product1._id, variantId: product1.variants[0]._id, quantity: 1
    }], address._id);

    const results1 = await Promise.allSettled([checkoutReq1, checkoutReq2]);
    let successCount1 = results1.filter(r => r.status === 'fulfilled').length;
    let failureCount1 = results1.filter(r => r.status === 'rejected').length;

    const finalProduct1 = await Product.findById(product1._id);
    const finalStock1 = finalProduct1.variants[0].stock;
    
    console.log(`Expected Success: 1 | Actual: ${successCount1}`);
    console.log(`Expected Failure: 1 | Actual: ${failureCount1}`);
    console.log(`Expected Final Stock: 0 | Actual: ${finalStock1}`);

    // =========================================================================
    // PHASE 4: INVENTORY CONCURRENCY (STOCK = 5, 10 Requests)
    // =========================================================================
    console.log('\n--- STARTING CONCURRENCY TEST (Stock=5, 10 Requests) ---');
    const product5 = await Product.create({
      name: 'Concurrency Test Product 5',
      slug: 'concurrency-test-product-5',
      description: 'Testing race conditions heavy load',
      category: new mongoose.Types.ObjectId(),
      brand: new mongoose.Types.ObjectId(),
      pricing: { basePrice: 100 },
      variants: [{ sku: 'TEST-SKU-5', size: 'L', stock: 5, price: 100 }],
      isActive: true
    });

    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(OrderService.createCheckoutOrder(user._id, [{
        productId: product5._id, variantId: product5.variants[0]._id, quantity: 1
      }], address._id));
    }

    const results5 = await Promise.allSettled(requests);
    let successCount5 = results5.filter(r => r.status === 'fulfilled').length;
    let failureCount5 = results5.filter(r => r.status === 'rejected').length;

    const finalProduct5 = await Product.findById(product5._id);
    const finalStock5 = finalProduct5.variants[0].stock;

    console.log(`Expected Success: 5 | Actual: ${successCount5}`);
    console.log(`Expected Failure: 5 | Actual: ${failureCount5}`);
    console.log(`Expected Final Stock: 0 | Actual: ${finalStock5}`);

    // =========================================================================
    // PHASE 5: TRANSACTION ROLLBACK
    // =========================================================================
    console.log('\n--- STARTING TRANSACTION ROLLBACK TEST ---');
    const productRollback = await Product.create({
      name: 'Rollback Test Product',
      slug: 'rollback-test-product',
      description: 'Testing transaction rollback',
      category: new mongoose.Types.ObjectId(),
      brand: new mongoose.Types.ObjectId(),
      pricing: { basePrice: 100 },
      variants: [{ sku: 'TEST-SKU-R', size: 'S', stock: 10, price: 100 }],
      isActive: true
    });

    // Monkey-patch orderRepository.create to throw an error intentionally to trigger rollback
    const originalCreate = orderRepository.create;
    orderRepository.create = async () => {
      throw new Error('INTENTIONAL_ROLLBACK_ERROR');
    };

    let rollbackError = null;
    try {
      await OrderService.createCheckoutOrder(user._id, [{
        productId: productRollback._id, variantId: productRollback.variants[0]._id, quantity: 2
      }], address._id);
    } catch (e) {
      rollbackError = e.message;
    }

    // Restore original method
    orderRepository.create = originalCreate;

    const finalProductRollback = await Product.findById(productRollback._id);
    const finalStockRollback = finalProductRollback.variants[0].stock;

    console.log(`Rollback Error Received: ${rollbackError}`);
    console.log(`Expected Stock After Rollback: 10 | Actual: ${finalStockRollback}`);
    if (rollbackError === 'INTENTIONAL_ROLLBACK_ERROR' && finalStockRollback === 10) {
      console.log('✅ Phase 5 (Transaction Rollback) - PASSED');
    } else {
      console.log('❌ Phase 5 (Transaction Rollback) - FAILED');
    }

    // Cleanup
    await Product.deleteMany({ _id: { $in: [product1._id, product5._id, productRollback._id] } });
    await addressRepository.delete(address._id);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runTests();
