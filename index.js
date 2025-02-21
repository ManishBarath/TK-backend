const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize the Supabase client
const supabaseUrl = process.env.SUPABASE_URL; // Your Supabase project URL
console.log(supabaseUrl);
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Your Supabase anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint to create a new user
app.post('/users', async (req, res) => {
  const { email, phone_no, username, password, pass } = req.body;

  // Validate that 'pass' is a 2D array
  if (!Array.isArray(pass) || !pass.every(row => Array.isArray(row))) {
    return res.status(400).json({ error: 'pass must be a 2D array' });
  }

  // NOTE: In production, hash the password before saving it to the database
  const { data, error } = await supabase
    .from('users')
    .insert([
      { email, phone_no, username, password, pass }
    ])
    .select();

  if (error) {
    console.error('Error inserting user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  res.status(201).json(data[0]);
});

// Endpoint to fetch all users
app.get('/user', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  res.status(200).json(data);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});