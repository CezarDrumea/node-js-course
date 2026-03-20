import { ZodError } from "zod";
import prisma from "../lib/prisma.js";

async function loadCategories(options) {
  if (options.categories && options.categories.length > 0) {
    return options.categories;
  }
  return await prisma.category.findMany();
}
export const validate = (schema, options = {}) => {
  return async (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = Array.isArray(error.issues) ? error.issues : [];
        const formattedErrors = {};
        issues.forEach(e => {
          if (e.path && e.path.length > 0) {
            formattedErrors[e.path[0]] = e.message;
          } else {
            formattedErrors.form = e.message;
          }
        });
        const categories = await loadCategories(options);
        
        const eventData = { 
          ...req.body
        };
        
        if (options.isEdit && req.params.id) {
          eventData.id = req.params.id;
        }
        
        return res.status(400).render("eventForm", {
          event: eventData,
          errors: formattedErrors,
          categories,
          isEdit: options.isEdit || false,
          title: options.isEdit ? "Editează Eveniment" : "Adaugă Eveniment"
        });
      }
      next(error);
    }
  };
};

export const validateImage = (options = {}) => {
  return async (req, res, next) => {
    if (req.file) {
      const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowed.includes(req.file.mimetype)) {
        const isEdit = options.isEdit || req.originalUrl.includes("/edit");
        const categories = await loadCategories(options);
        
        const eventData = { 
          ...req.body
        };
        
        if (isEdit && req.params.id) {
          eventData.id = req.params.id;
        }
        
        return res.status(400).render("eventForm", {
          event: eventData,
          errors: { image: "Imaginea trebuie să fie JPG, PNG sau WEBP." },
          categories,
          isEdit,
          title: isEdit ? "Editează Eveniment" : "Adaugă Eveniment"
        });
      }
    }
    next();
  };
};