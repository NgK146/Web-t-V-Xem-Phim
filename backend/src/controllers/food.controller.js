import Food from '../models/Food.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import cloudinary from '../config/cloudinary.js';

/**
 * Upload a file buffer directly to Cloudinary (compatible with multer v2 memoryStorage)
 */
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'cinema_foods', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * @desc  Lấy danh sách tất cả món ăn/combo đang kích hoạt (Cho người mua)
 * @route GET /api/foods
 * @access Public
 */
export const getActiveFoods = async (req, res, next) => {
  try {
    const foods = await Food.find({ isActive: true }).sort('-createdAt');
    res.json(new ApiResponse(200, foods));
  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Lấy danh sách TẤT CẢ món ăn/combo (Cho Admin quản lý)
 * @route GET /api/foods/admin
 * @access Private/Admin
 */
export const getAllFoodsAdmin = async (req, res, next) => {
  try {
    const foods = await Food.find().sort('-createdAt');
    res.json(new ApiResponse(200, foods));
  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Tạo món ăn/combo mới
 * @route POST /api/foods
 * @access Private/Admin
 */
export const createFood = async (req, res, next) => {
  try {
    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    }
    const food = await Food.create({ ...req.body, image: imageUrl });
    res.status(201).json(new ApiResponse(201, food, 'Tạo món thành công'));
  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Cập nhật món ăn/combo
 * @route PUT /api/foods/:id
 * @access Private/Admin
 */
export const updateFood = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    }
    const food = await Food.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!food) throw new ApiError(404, 'Không tìm thấy món ăn');
    res.json(new ApiResponse(200, food, 'Cập nhật thành công'));
  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Xóa món ăn (Thay vì xóa mềm, ta có thể xóa cứng hoặc dùng isActive)
 * @route DELETE /api/foods/:id
 * @access Private/Admin
 */
export const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) throw new ApiError(404, 'Không tìm thấy món ăn');
    res.json(new ApiResponse(200, null, 'Đã xóa món ăn'));
  } catch (err) {
    next(err);
  }
};
