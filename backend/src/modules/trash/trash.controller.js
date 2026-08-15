import {
  listTrashSchema,
} from "./trash.validator.js";

import {
  listTrash,
} from "./trash.service.js";

import {
  asyncHandler,
} from "../../utils/asyncHandler.js";

import {
  AppError,
} from "../../utils/AppError.js";

export const listTrashController = asyncHandler(async (req, res) => {
    const result =
      listTrashSchema.safeParse(
        req.query
      );

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        400
      );
    }

    const data =
      await listTrash({
        userId:
          req.user.id,

        ...result.data,
      });

    return res.status(200).json({
      success: true,
      data,
    });
  });