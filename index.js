const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan'); // Logging middleware

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev')); // Logs requests in the console

// Initialize the Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Supabase Key: ${supabaseKey ? 'Loaded' : 'Missing'}`);

// POST route to insert a user
app.post('/update', async (req, res) => {
<<<<<<< Updated upstream
  console.log('Incoming Request:', req.body);

=======
>>>>>>> Stashed changes
  const { email, phone_no, username, password, pass, college_name, amount, count } = req.body;

  if (!Array.isArray(pass) || !pass.every(row => Array.isArray(row))) {
    console.error('Validation Error: pass must be a 2D array');
    return res.status(400).json({ error: 'pass must be a 2D array' });
  }

<<<<<<< Updated upstream
  console.log('Inserting user with data:', { email, phone_no, username, college_name, amount, count });

  const { data, error } = await supabase
    .from('users')
    .insert([{ email, phone_no, username, password, pass, college_name, amount, count }])
    .select();

  if (error) {
    console.error('Supabase Insert Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error });
=======
  // Upsert the user into the database
  const { data, error } = await supabase
    .from('users')
    .upsert([
      { email, phone_no, username, password, pass, college_name, amount, count }
    ], { onConflict: 'phone_no' }) // Specify the primary key column
    .select();

  if (error) {
    console.error('Error upserting user:', error);
    return res.status(500).json({ error: 'Internal server error' });
>>>>>>> Stashed changes
  }

  console.log('Insert Success:', data);
  res.status(201).json(data[0]);
});

// GET route to fetch users
app.get('/select', async (req, res) => {
  console.log('Fetching all users from database');

  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    console.error('Supabase Fetch Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error });
  }

  console.log('Fetched Users:', data);
  res.status(200).json(data);
});

// Basic GET route
app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.json('Vanakam da mappla');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
