import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader?.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token =
      authHeader.split(" ")[1];

    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (
      !payload.userId ||
      !payload.sessionId
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid access token",
      });
    }

    req.user = {
      id: payload.userId,
      sessionId: payload.sessionId,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired access token",
    });
  }
};