import PointHistory from '../models/PointHistory.js';
import { ApiError } from '../utils/ApiError.js';

export const updateMembership = (totalPoints) => {
  if (totalPoints >= 1000) return "Platinum";
  if (totalPoints >= 500) return "Gold";
  if (totalPoints >= 200) return "Silver";
  return "Bronze";
};

export const earnPoints = async (user, amountSpent, description = "Earn points from booking") => {
  const earned = Math.floor(amountSpent / 1000); // 1000 VND = 1 point

  if (earned <= 0) return user;

  user.points = (user.points || 0) + earned;
  user.totalAccumulatedPoints = (user.totalAccumulatedPoints || 0) + earned;
  user.membership = updateMembership(user.totalAccumulatedPoints);
  
  // Update Profile metrics
  user.totalSpent = (user.totalSpent || 0) + amountSpent;
  if (user.totalSpent >= 5000000) user.tier = 'VVIP Gold';
  else if (user.totalSpent >= 1000000) user.tier = 'VIP Silver';
  else user.tier = 'Member';

  await user.save();

  await PointHistory.create({
    user: user._id,
    type: "EARN",
    points: earned,
    description,
  });

  return user;
};

export const redeemPoints = async (user, pointsToRedeem, description = "Redeem points") => {
  if ((user.points || 0) < pointsToRedeem) {
    throw new ApiError(400, "Không đủ điểm để đổi thưởng");
  }

  user.points -= pointsToRedeem;
  await user.save();

  await PointHistory.create({
    user: user._id,
    type: "REDEEM",
    points: pointsToRedeem,
    description,
  });

  return user;
};
