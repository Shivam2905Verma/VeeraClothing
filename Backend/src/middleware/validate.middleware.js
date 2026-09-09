export const zodValidateData = (schema, source = "body") => {
  return (req, res, next) => {
    console.log(req.body);

    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    req[source] = result.data;
    next();
  };
};
