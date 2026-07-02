import addressRepository from '../repositories/address.repository.js';
import { ApiError } from '../utils/ApiError.js';

class AddressService {
  async addAddress(userId, addressData) {
    if (addressData.isDefault) {
      await addressRepository.clearDefault(userId);
    } else {
      const existing = await addressRepository.findByUser(userId);
      if (existing.length === 0) {
        addressData.isDefault = true;
      }
    }
    addressData.user = userId;
    return await addressRepository.create(addressData);
  }

  async getUserAddresses(userId) {
    return await addressRepository.findByUser(userId);
  }

  async updateAddress(id, userId, addressData) {
    if (addressData.isDefault) {
      await addressRepository.clearDefault(userId);
    }
    const updated = await addressRepository.update(id, userId, addressData);
    if (!updated) throw new ApiError(404, 'Address not found or unauthorized');
    return updated;
  }

  async deleteAddress(id, userId) {
    const deleted = await addressRepository.delete(id, userId);
    if (!deleted) throw new ApiError(404, 'Address not found or unauthorized');

    // If we deleted the default, set a new default
    if (deleted.isDefault) {
      const remaining = await addressRepository.findByUser(userId);
      if (remaining.length > 0) {
        await addressRepository.setDefault(remaining[0]._id, userId);
      }
    }
    return deleted;
  }

  async setDefaultAddress(id, userId) {
    await addressRepository.clearDefault(userId);
    const updated = await addressRepository.setDefault(id, userId);
    if (!updated) throw new ApiError(404, 'Address not found or unauthorized');
    return updated;
  }
}

export default new AddressService();
