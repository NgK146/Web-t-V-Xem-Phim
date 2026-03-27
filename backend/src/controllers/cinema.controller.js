import Cinema from '../models/Cinema.js';
import Room from '../models/Room.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc  Lấy danh sách rạp
 * @route GET /api/cinemas
 * @access Public
 */
export const getCinemas = async (req, res, next) => {
  try {
    const { city } = req.query;
    const filter = {};
    if (city) filter.city = city;

    const cinemas = await Cinema.find(filter).sort('name');
    res.json(new ApiResponse(200, cinemas));
  } catch (err) { next(err); }
};

/**
 * @desc  Lấy chi tiết rạp
 * @route GET /api/cinemas/:id
 * @access Public
 */
export const getCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) throw new ApiError(404, 'Không tìm thấy rạp');
    res.json(new ApiResponse(200, cinema));
  } catch (err) { next(err); }
};

/**
 * @desc  Tạo rạp mới (admin)
 * @route POST /api/cinemas
 * @access Admin
 */
export const createCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.create(req.body);
    res.status(201).json(new ApiResponse(201, cinema, 'Tạo rạp thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Cập nhật rạp (admin)
 * @route PUT /api/cinemas/:id
 * @access Admin
 */
export const updateCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cinema) throw new ApiError(404, 'Không tìm thấy rạp');
    res.json(new ApiResponse(200, cinema, 'Cập nhật rạp thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Xóa rạp (admin)
 * @route DELETE /api/cinemas/:id
 * @access Admin
 */
export const deleteCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) throw new ApiError(404, 'Không tìm thấy rạp');
    // Xoá tất cả phòng của rạp này
    await Room.deleteMany({ cinema: cinema._id });
    res.json(new ApiResponse(200, null, 'Xóa rạp thành công'));
  } catch (err) { next(err); }
};

// --- ROOM MANAGEMENT ---

/**
 * @desc  Lấy danh sách phòng của rạp
 * @route GET /api/cinemas/:cinemaId/rooms
 * @access Public
 */
export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ cinema: req.params.cinemaId }).sort('name');
    res.json(new ApiResponse(200, rooms));
  } catch (err) { next(err); }
};

/**
 * @desc  Thêm phòng cho rạp (admin)
 * @route POST /api/cinemas/:cinemaId/rooms
 * @access Admin
 */
export const createRoom = async (req, res, next) => {
  try {
    const { cinemaId } = req.params;
    const { name, type, rows, cols } = req.body;

    // Tự động tạo ghế nếu có rows và cols
    const seats = [];
    if (rows && cols) {
      const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      for (let i = 0; i < rows; i++) {
        for (let j = 1; j <= cols; j++) {
          seats.push({
            row: rowLabels[i],
            number: j,
            type: (rowLabels[i] === 'G' || rowLabels[i] === 'H') ? 'vip' : 'standard', // Ví dụ mặc định hàng G, H là VIP
          });
        }
      }
    }

    const room = await Room.create({
      cinema: cinemaId,
      name,
      type,
      totalSeats: seats.length > 0 ? seats.length : req.body.totalSeats,
      seats: seats.length > 0 ? seats : req.body.seats,
    });

    res.status(201).json(new ApiResponse(201, room, 'Tạo phòng thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Cập nhật phòng (admin)
 * @route PUT /api/cinemas/rooms/:id
 * @access Admin
 */
export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) throw new ApiError(404, 'Không tìm thấy phòng');
    res.json(new ApiResponse(200, room, 'Cập nhật phòng thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Xóa phòng (admin)
 * @route DELETE /api/cinemas/rooms/:id
 * @access Admin
 */
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) throw new ApiError(404, 'Không tìm thấy phòng');
    res.json(new ApiResponse(200, null, 'Xóa phòng thành công'));
  } catch (err) { next(err); }
};
