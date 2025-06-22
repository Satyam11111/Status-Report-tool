const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  
  let token = req.headers['authorization'];
  // console.log("token:",token);
  if(token==undefined)
  token=req.headers.token;
  // console.log("token:",token);
  if (!token) return res.status(401).json({'msg':'Access Denied'});
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = decoded;
    next();
  });
};

const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({'msg':'Access Denied'});
  next();
};

module.exports = { authenticate, authorize };
