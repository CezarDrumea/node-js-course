import { ZodError } from "zod";

export const validateForm = (schema, view) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = Array.isArray(error.issues) ? error.issues : [];
        const formattedErrors = {};
        issues.forEach(e => {
          if (e.path && e.path[0]) {
            formattedErrors[e.path[0]] = e.message;
          } else {
            formattedErrors.form = e.message;
          }
        });

        console.log("Form validation errors:", formattedErrors);
        
        return res.status(400).render(view, {
          formData: req.body,
          errors: formattedErrors
        });
      }
      next(error);
    }
  };
};
