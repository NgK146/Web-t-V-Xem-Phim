import User from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc  Lấy danh sách tất cả người dùng (Admin)
 * @route GET /api/users
 * @access Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(new ApiResponse(200, { users, total, page: Number(page), limit: Number(limit) }, 'Lấy danh sách người dùng thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Lấy thông tin một người dùng
 * @route GET /api/users/:id
 * @access Admin
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) throw new ApiError(404, 'Không tìm thấy người dùng');
    res.json(new ApiResponse(200, user, 'Lấy thông tin người dùng thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Cập nhật role của người dùng
 * @route PATCH /api/users/:id/role
 * @access Admin
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) throw new ApiError(400, 'Role không hợp lệ');

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password -refreshToken' }
    );
    if (!user) throw new ApiError(404, 'Không tìm thấy người dùng');

    res.json(new ApiResponse(200, user, `Đã cập nhật role thành ${role}`));
  } catch (err) { next(err); }
};

/**
 * @desc  Khoá / Mở khoá tài khoản
 * @route PATCH /api/users/:id/ban
 * @access Admin
 */
export const toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'Không tìm thấy người dùng');

    user.isBanned = !user.isBanned;
    await user.save({ validateBeforeSave: false });

    const msg = user.isBanned ? 'Đã khoá tài khoản' : 'Đã mở khoá tài khoản';
    res.json(new ApiResponse(200, { isBanned: user.isBanned }, msg));
  } catch (err) { next(err); }
};

/**
 * @desc  Xoá người dùng
 * @route DELETE /api/users/:id
 * @access Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new ApiError(404, 'Không tìm thấy người dùng');
    res.json(new ApiResponse(200, null, 'Đã xoá người dùng'));
  } catch (err) { next(err); }
};
