//zod middleware {validate middleware}:- payload validation

const validate = (schema) => async (req, res, next) => {
    try {
      const parseBody = await schema.parseAsync(req.body);
      req.body = parseBody;
      next();
    } catch (error) {
      // Log the error to understand what went wrong
      console.error("Validation error:", error);
      let errmsg="";
      
      for(let i=0;i<error.errors.length;i++){
        errmsg+=error.errors[i].message+'\n';
      }
      
      res.status(400).json({
        message: errmsg,
        status: 400,
        error: error.errors ? error.errors : error.message, 
      });
    }
  };
  
  module.exports = validate;
  