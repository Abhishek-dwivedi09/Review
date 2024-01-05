const validation = (err, req, res, next) => {
    if (err) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: err.details.body && err.details.body.length ? err.details.body[0].message.replace(/"/g, ""): "Validation Error",
      });
    }
  
    return next();
  };
  
  export default validation ;