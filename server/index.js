const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('../config/database');

// Conectar a la base de datos
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Language Consultancy API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});