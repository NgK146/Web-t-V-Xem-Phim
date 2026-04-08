import PointHistory from '../models/PointHistory.js';

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
  user.membership = updateMembership(user.points);
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
    throw new Error("Không đủ điểm để đổi thưởng");
  }

  user.points -= pointsToRedeem;
  user.membership = updateMembership(user.points);
  await user.save();

  await PointHistory.create({
    user: user._id,
    type: "REDEEM",
    points: pointsToRedeem,
    description,
  });

  return user;
};
