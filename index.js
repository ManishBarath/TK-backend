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

// POST route to insert or update a user
app.post('/update', async (req, res) => {
  console.log('Incoming Request:', req.body);

  const { email, phone_no, username, password, pass, college_name, amount, count } = req.body;

  // Validate that 'pass' is a 2D array
  if (!Array.isArray(pass) || !pass.every(row => Array.isArray(row))) {
    console.error('Validation Error: pass must be a 2D array');
    return res.status(400).json({ error: 'pass must be a 2D array' });
  }

  console.log('Upserting user with data:', { email, phone_no, username, college_name, amount, count });

  // Upsert the user into the database
  const { data, error } = await supabase
    .from('users')
    .upsert(
      [{ email, phone_no, username, password, pass, college_name, amount, count }],
      { onConflict: 'phone_no' } // Specify the primary key column
    )
    .select();

  if (error) {
    console.error('Supabase Upsert Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }

  console.log('Upsert Success:', data);
  res.status(201).json(data[0]);
});

// PUT route to update paid status
// PUT route to update paid status
app.put('/update-paid-status', async (req, res) => {
  try {
    console.log('Update Paid Status Request:', req.body);
    const { phone_no, paid } = req.body;
    
    // Validate required fields
    if (!phone_no) {
      return res.status(400).json({ error: 'phone_no is required as identifier' });
    }
    
    if (typeof paid !== 'boolean') {
      return res.status(400).json({ error: 'paid must be a boolean value (true or false)' });
    }
    
    console.log(`Updating paid status for user with phone_no: ${phone_no} to: ${paid}`);
    
    // Update only the paid field for the user
    const { data, error } = await supabase
      .from('users')
      .update({ paid })
      .eq('phone_no', phone_no)
      .select();
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Paid status updated successfully:', data);
    return res.status(200).json({ 
      success: true, 
      message: `Paid status updated to ${paid}`,
      user: data[0]
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update the user's day pass
app.put('/update-pass', async(req, res) => {
  try {
    console.log('Update Pass Request:', req.body);
    const { phone_no, pass } = req.body;

    // Validate required fields
    if (!phone_no) {
      return res.status(400).json({ error: 'phone_no is required as identifier' });
    }

    if (!Array.isArray(pass) || !pass.every(row => Array.isArray(row))) {
      return res.status(400).json({ error: 'pass must be a 2D array' });
    }

    console.log(`Updating pass for user with phone_no: ${phone_no}`);

    // Update only the pass field for the user
    const { data, error } = await supabase
      .from('users')
      .update({ pass })
      .eq('phone_no', phone_no)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Pass updated successfully:', data);
    return res.status(200).json({
      success: true,
      message: 'Pass updated successfully',
      user: data[0]
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
);
// GET route to fetch users
app.get('/select', async (req, res) => {
  console.log('Fetching all users from database');

  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    console.error('Supabase Fetch Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
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
