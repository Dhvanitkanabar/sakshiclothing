import CategoryRepository from '../repositories/category.repository.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

class CategoryService {
  async createCategory(data) {
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    // Clean parentCategory
    if (!data.parentCategory || data.parentCategory === '' || data.parentCategory === 'null') {
      data.parentCategory = null;
    }

    // Auto-suffix slug if duplicate found to prevent collision
    let candidateSlug = data.slug;
    const existing = await CategoryRepository.findBySlug(candidateSlug);
    if (existing) {
      candidateSlug = `${candidateSlug}-${Date.now().toString(36).slice(-4)}`;
    }
    data.slug = candidateSlug;

    return await CategoryRepository.create(data);
  }

  async updateCategory(id, data) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
    }

    if (!data.parentCategory || data.parentCategory === '' || data.parentCategory === 'null') {
      data.parentCategory = null;
    }

    if (data.slug) {
      const existing = await CategoryRepository.findBySlug(data.slug);
      if (existing && existing._id.toString() !== id) {
        data.slug = `${data.slug}-${Date.now().toString(36).slice(-4)}`;
      }
    }

    return await CategoryRepository.updateById(id, data);
  }

  async getCategoryById(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
    }
    return category;
  }

  async getAllCategories(role = 'user') {
    const query = role === 'admin' ? {} : { isActive: true };
    return await CategoryRepository.findAll(query);
  }

  async getCategoryTree() {
    return await CategoryRepository.findTree();
  }

  async deleteCategory(id) {
    try {
      return await CategoryRepository.deleteById(id);
    } catch (err) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, err.message);
    }
  }

  async softDeleteCategory(id) {
    return await CategoryRepository.softDelete(id);
  }

  async restoreCategory(id) {
    return await CategoryRepository.restore(id);
  }

  async seedDefaultCategories() {
    const defaultData = [
      {
        name: 'Women',
        slug: 'women',
        description: 'Haute couture bridal lehengas, handloom sarees, and couture anarkalis.',
        displayOrder: 1,
        subs: [
          { name: 'Bridal Lehengas', slug: 'women-bridal-lehengas' },
          { name: 'Heritage Sarees', slug: 'women-heritage-sarees' },
          { name: 'Couture Anarkalis', slug: 'women-couture-anarkalis' },
          { name: 'Artisanal Sets', slug: 'women-artisanal-sets' },
          { name: 'Bangles', slug: 'women-bangles' }
        ]
      },
      {
        name: 'Men',
        slug: 'men',
        description: 'Imperial brocade sherwanis, Jodhpur bandhgalas, and handspun silk kurtas.',
        displayOrder: 2,
        subs: [
          { name: 'Heritage Sherwanis', slug: 'men-heritage-sherwanis' },
          { name: 'Suits & Jackets', slug: 'men-suits-jackets' },
          { name: 'Modern Kurtas', slug: 'men-modern-kurtas' }
        ]
      },
      {
        name: 'Bridal',
        slug: 'bridal',
        description: 'The Royal Bridal Trousseau 2026. Handcrafted zardozi, dabka, and gossamer veils.',
        displayOrder: 3,
        subs: [
          { name: 'Royal Bridal Trousseau', slug: 'bridal-trousseau' },
          { name: 'Gossamer Veils', slug: 'bridal-veils' },
          { name: 'Reception Gowns', slug: 'bridal-reception-gowns' }
        ]
      },
      {
        name: 'Jewellery',
        slug: 'jewellery',
        description: 'Heirloom Jadau, Polki, and Kundan bridal jewelry suites.',
        displayOrder: 4,
        subs: [
          { name: 'Bangles & Kadas', slug: 'jewellery-bangles' },
          { name: 'Chokers & Necklaces', slug: 'jewellery-necklaces' },
          { name: 'Earrings & Jhumkas', slug: 'jewellery-earrings' },
          { name: 'Polki & Jadau', slug: 'jewellery-polki-jadau' }
        ]
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Handcrafted luxury accessories, potlis, and royal belts.',
        displayOrder: 5,
        subs: [
          { name: 'Handbags & Potlis', slug: 'accessories-handbags' },
          { name: 'Royal Belts & Kamarbands', slug: 'accessories-belts' }
        ]
      },
      {
        name: 'Footwear',
        slug: 'footwear',
        description: 'Hand-embroidered mojaris, juttis, and couture bridal footwear.',
        displayOrder: 6,
        subs: [
          { name: 'Juttis & Mojaris', slug: 'footwear-juttis' },
          { name: 'Embellished Heels', slug: 'footwear-heels' }
        ]
      }
    ];

    const results = [];
    for (const cat of defaultData) {
      let parent = await CategoryRepository.findBySlug(cat.slug);
      if (!parent) {
        parent = await CategoryRepository.create({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          displayOrder: cat.displayOrder,
          isActive: true
        });
      }

      for (const sub of cat.subs) {
        let existingSub = await CategoryRepository.findBySlug(sub.slug);
        if (!existingSub) {
          existingSub = await CategoryRepository.create({
            name: sub.name,
            slug: sub.slug,
            parentCategory: parent._id,
            isActive: true
          });
        }
      }
      results.push(parent);
    }

    return results;
  }
}

export default new CategoryService();

