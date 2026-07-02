import Address from '../models/Address.model.js';

class AddressRepository {
  async create(data) {
    const address = new Address(data);
    return await address.save();
  }

  async findById(id) {
    return await Address.findById(id);
  }

  async findByUser(userId) {
    return await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async update(id, userId, data) {
    return await Address.findOneAndUpdate(
      { _id: id, user: userId },
      data,
      { new: true, runValidators: true }
    );
  }

  async delete(id, userId) {
    return await Address.findOneAndDelete({ _id: id, user: userId });
  }

  async clearDefault(userId) {
    return await Address.updateMany({ user: userId }, { isDefault: false });
  }

  async setDefault(id, userId) {
    return await Address.findOneAndUpdate(
      { _id: id, user: userId },
      { isDefault: true },
      { new: true }
    );
  }
}

export default new AddressRepository();
