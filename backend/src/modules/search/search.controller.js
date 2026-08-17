import {
  searchQuerySchema,
} from "./search.validator.js";

import {
  globalSearch,
} from "./search.service.js";

import {
  asyncHandler,
} from "../../utils/asyncHandler.js";

import {
  AppError,
} from "../../utils/AppError.js";

export const globalSearchController =
  asyncHandler(async (req, res) => {
    const result =
      searchQuerySchema.safeParse(
        req.query
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const data =
      await globalSearch({
        userId:
          req.user.id,

        ...result.data,
      });

    return res.status(200).json({
      success: true,
      data,
    });
  });