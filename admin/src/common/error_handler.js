const errorHandler = (res, error) => {
    console.log("error.....",error);
    return res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message ? error.message : ( error.error && (error.error.description == "Amount exceeds maximum amount allowed.")) ?  "Maximum amount per transaction is 5,00,000 INR in our app payment flow." : "Unexpected error occure."
    });
  };
  
  export default {
    errorHandler,
  };