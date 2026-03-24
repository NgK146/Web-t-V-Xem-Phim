import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { sendEmail } from '../services/email.service.js';

/**
 * Tạo access token và refresh token
 * @param {string} id - User ID
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokens = (id) => ({
  accessToken: jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  }),
  refreshToken: jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  }),
});

/**
 * @desc  Đăng ký tài khoản mới
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ApiError(400, 'Email đã được sử dụng');

    const user = await User.create({ name, email, password, phone });
    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Tạm tắt gửi email để test register
    // await sendEmail({
    //   to: email,
    //   subject: 'Chào mừng đến CinemaHub!',
    //   template: 'welcome',
    //   data: { name },
    // });

    res.status(201).json(
      new ApiResponse(
        201,
        {
          user: { id: user._id, name, email, role: user.role },
          accessToken,
          refreshToken,
        },
        'Đăng ký thành công'
      )
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Đăng nhập
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Email hoặc mật khẩu không đúng');
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json(new ApiResponse(200, {
      user: { id: user._id, name: user.name, email, role: user.role, avatar: user.avatar },
      accessToken,
      refreshToken,
    }, 'Đăng nhập thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Làm mới access token
 * @route POST /api/auth/refresh-token
 * @access Public
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new ApiError(401, 'Không có refresh token');

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw new ApiError(401, 'Refresh token không hợp lệ');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }));
  } catch (err) { next(err); }
};

/**
 * @desc  Yêu cầu reset mật khẩu
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) throw new ApiError(404, 'Email không tồn tại trong hệ thống');

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 phút
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Đặt lại mật khẩu',
      template: 'resetPassword',
      data: { name: user.name, resetUrl },
    });

    res.json(new ApiResponse(200, null, 'Email đặt lại mật khẩu đã được gửi'));
  } catch (err) { next(err); }
};

/**
 * @desc  Đặt lại mật khẩu
 * @route PATCH /api/auth/reset-password/:token
 * @access Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) throw new ApiError(400, 'Token không hợp lệ hoặc đã hết hạn');

    user.password = req.body.password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json(new ApiResponse(200, null, 'Mật khẩu đã được đặt lại thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Đăng xuất
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    res.json(new ApiResponse(200, null, 'Đăng xuất thành công'));
  } catch (err) { next(err); }
};
