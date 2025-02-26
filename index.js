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
//update the amount
app.put('/update-amount', async (req, res) => {
  try {
    console.log('Update Amount Request:', req.body);
    const { phone_no, amount } = req.body;

    // Validate required fields
    if (!phone_no) {
      return res.status(400).json({ error: 'phone_no is required as an identifier' });
    }

    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    console.log(`Updating amount for user with phone_no: ${phone_no} to: ${amount}`);

    // Update only the amount field for the user
    const { data, error } = await supabase
      .from('users')
      .update({ amount })
      .eq('phone_no', phone_no)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Amount updated successfully:', data);
    return res.status(200).json({
      success: true,
      message: `Amount updated to ${amount}`,
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

// Route to insert data into the u1 table with validations
app.post('/u1', async (req, res) => {
  try {
    console.log('Incoming request to add user to u1:', req.body);
    const { username, phone, email, college } = req.body;
    
    // Validate required fields
    if (!username || !phone || !email) {
      return res.status(400).json({ error: 'username, phone, and email are required fields' });
    }
    
    // Validate phone number (exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Insert the data into the u1 table
    const { data, error } = await supabase
      .from('u1')
      .insert([{ username, phone, email, college }])
      .select();
    
    if (error) {
      console.error('Error inserting into u1:', error);
      return res.status(500).json({ error: 'Failed to insert data', details: error.message });
    }
    
    console.log('Data inserted successfully into u1:', data);
    return res.status(201).json({
      success: true,
      message: 'User added to u1 table',
      user: data[0]
    });
  } catch (err) {
    console.error('Unexpected error inserting data:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route to fetch all records from u1 table
app.get('/u1', async (req, res) => {
  try {
    console.log('Fetching all records from u1 table');
    
    const { data, error } = await supabase
      .from('u1')
      .select('*');
    
    if (error) {
      console.error('Error fetching from u1:', error);
      return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
    }
    
    console.log('Fetched records from u1:', data);
    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error fetching data:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route to get a specific user by phone number
app.get('/u1/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    console.log(`Fetching user with phone: ${phone}`);
    
    // Validate phone number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }
    
    const { data, error } = await supabase
      .from('u1')
      .select('*')
      .eq('phone', phone);
    
    if (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Failed to fetch user', details: error.message });
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Fetched user successfully:', data);
    return res.status(200).json(data[0]);
  } catch (err) {
    console.error('Unexpected error fetching user:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route to update user data
app.put('/u1/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const { username, email, college } = req.body;
    console.log(`Updating user with phone: ${phone}`);
    
    // Validate phone number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }
    
    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }
    
    // Build update object with only provided fields
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (college !== undefined) updateData.college = college;
    
    const { data, error } = await supabase
      .from('u1')
      .update(updateData)
      .eq('phone', phone)
      .select();
    
    if (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Updated user successfully:', data);
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: data[0]
    });
  } catch (err) {
    console.error('Unexpected error updating user:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Route to delete a user
app.delete('/u1/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    console.log(`Deleting user with phone: ${phone}`);
    
    // Validate phone number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }
    
    const { data, error } = await supabase
      .from('u1')
      .delete()
      .eq('phone', phone)
      .select();
    
    if (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Deleted user successfully:', data);
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      user: data[0]
    });
  } catch (err) {
    console.error('Unexpected error deleting user:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
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
