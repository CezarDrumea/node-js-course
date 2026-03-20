import { ZodError } from "zod";
import prisma from "../lib/prisma.js";

export const validateChangePassword = (schema, view = "profile") => {
  return async (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = Array.isArray(err.issues)
          ? err.issues
          : Array.isArray(err.errors)
            ? err.errors
            : [];

        const formatted = {};
        issues.forEach(issue => {
          const key = Array.isArray(issue.path) && issue.path.length ? issue.path[0] : "_form";

          if (!formatted[key]) {
            formatted[key] = issue.message;
          }
        });

        console.log("Validation errors:", formatted);
        
        const events = await prisma.event.findMany({
          where: { userId: req.user.id },
          include: { category: true },
          orderBy: { createdAt: "desc" }
        });

        return res.status(400).render(view, {
          title: "Profilul meu",
          user: req.user,
          events,
          errors: formatted,
          success: null,
          formData: req.body
        });
      }

      return next(err);
    }
  };
};
