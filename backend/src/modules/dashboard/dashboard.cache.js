import redis from "../../config/redis.js";

const DASHBOARD_TTL_SECONDS = 300;

// ==================== CACHE KEY ====================

function getDashboardCacheKey(userId) {
  return `orivox:dashboard:${userId}`;
}

// ==================== GET CACHE ====================

export async function getCachedDashboard(userId) {
  try {
    return await redis.get(
      getDashboardCacheKey(userId)
    );
  } catch (error) {
    console.error(
      "Dashboard cache read failed:",
      error.message
    );

    return null;
  }
}

// ==================== SET CACHE ====================

export async function setDashboardCache(
  userId,
  data
) {
  try {
    await redis.set(
      getDashboardCacheKey(userId),
      data,
      {
        ex: DASHBOARD_TTL_SECONDS,
      }
    );
  } catch (error) {
    console.error(
      "Dashboard cache write failed:",
      error.message
    );
  }
}

// ==================== INVALIDATE CACHE ====================

export async function invalidateDashboardCache(
  userId
) {
  if (!userId) return;

  try {
    await redis.del(
      getDashboardCacheKey(userId)
    );
  } catch (error) {
    console.error(
      "Dashboard cache invalidation failed:",
      error.message
    );
  }
}