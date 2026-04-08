import User from '../models/User.js';
import Discount from '../models/Discount.js';
import PointHistory from '../models/PointHistory.js';
import { redeemPoints } from '../services/loyalty.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const generateVoucherCode = () => {
  return "LOYALTY-" + Math.random().toString(36).substring(2, 10).toUpperCase();
};

// GET /api/loyalty/me
export const getMyLoyalty = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("name email points totalAccumulatedPoints membership");
    const history = await PointHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const availableVouchers = await Discount.find({
      createdFor: req.user._id,
      isActive: true,
      endDate: { $gte: new Date() },
      $expr: { $lt: ['$usedCount', '$usageLimit'] }
    }).sort({ createdAt: -1 });

    const usedVouchers = await Discount.find({
      createdFor: req.user._id,
      $or: [
        { isActive: false },
        { endDate: { $lt: new Date() } },
        { $expr: { $gte: ['$usedCount', '$usageLimit'] } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, { user, history, availableVouchers, usedVouchers }));
  } catch (error) {
    next(error);
  }
};

// POST /api/loyalty/redeem
export const redeemReward = async (req, res, next) => {
  try {
    const { rewardType } = req.body;

    const rewardMap = {
      voucher10k: { points: 100, value: 10000, label: "Voucher giảm 10.000đ" },
      voucher20k: { points: 200, value: 20000, label: "Voucher giảm 20.000đ" },
      voucher50k: { points: 500, value: 50000, label: "Voucher giảm 50.000đ" },
    };

    const reward = rewardMap[rewardType];

    if (!reward) {
       throw new ApiError(400, "Phần thưởng không hợp lệ");
    }

    const user = await User.findById(req.user._id);

    await redeemPoints(user, reward.points, `Redeem ${reward.label}`);

    const code = generateVoucherCode();

    const discount = await Discount.create({
      code,
      type: "fixed",
      value: reward.value,
      minOrder: 0,
      usageLimit: 1,
      usedCount: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
      createdFor: user._id,
    });

    res.status(200).json(new ApiResponse(200, {
      code: discount.code,
      value: discount.value,
      endDate: discount.endDate,
      pointsLeft: user.points,
      membership: user.membership,
    }, `Đổi thưởng thành công: ${reward.label}`));
  } catch (error) {
    next(error);
  }
};
