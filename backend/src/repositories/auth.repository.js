import User from '../models/User.model.js';

class AuthRepository {
  async createUser(userData) {
    return await User.create(userData);
  }

  async findUserByEmail(email, selectPassword = false) {
    let query = User.findOne({ email });
    if (selectPassword) {
      query = query.select('+password');
    }
    return await query.exec();
  }

  async findUserById(id) {
    return await User.findById(id);
  }

  async updateRefreshToken(userId, refreshToken) {
    return await User.findByIdAndUpdate(userId, { refreshToken }, { new: true });
  }

  async removeRefreshToken(userId) {
    return await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  async updatePassword(userId, password) {
    const user = await User.findById(userId);
    user.password = password; // pre-save hook will hash it
    return await user.save();
  }
}

export default new AuthRepository();
