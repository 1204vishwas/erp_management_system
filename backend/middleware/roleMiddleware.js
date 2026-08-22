/**
 * Role-based access control.
 * Usage: router.get("/", protect, authorize("Admin", "Sales"), handler)
 * Admin is always allowed.
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }
    if (req.user.role === "Admin" || allowedRoles.includes(req.user.role)) {
      return next();
    }
    res.status(403);
    throw new Error(
      `Access denied. Requires role: ${allowedRoles.join(", ")}`
    );
  };
};
