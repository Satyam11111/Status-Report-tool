const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');

dotenv.config();

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  tlsAllowInvalidCertificates: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err,"mongo not connected"));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
