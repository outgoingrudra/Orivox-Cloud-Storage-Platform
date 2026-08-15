import {
  getDashboard,
} from "./dashboard.service.js";

import {
  asyncHandler,
} from "../../utils/asyncHandler.js";

// ==================== GET DASHBOARD ====================

export const getDashboardController =
  asyncHandler(async (req, res) => {
    const data =
      await getDashboard(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data,
    });
  });