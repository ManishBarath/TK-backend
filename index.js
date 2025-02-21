const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const cors = require('cors')
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
// Initialize the Supabase client
const supabaseUrl = process.env.SUPABASE_URL; // Your Supabase project URL
console.log(supabaseUrl);
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Your Supabase anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/update', async (req, res) => {
  const { email, phone_no, username, password, pass, college_name , amount , count} = req.body;

  // Validate that 'pass' is a 2D array
  if (!Array.isArray(pass) || !pass.every(row => Array.isArray(row))) {
    return res.status(400).json({ error: 'pass must be a 2D array' });
  }

  // Insert the user into the database
  const { data, error } = await supabase
    .from('users')
    .insert([
      { email, phone_no, username, password, pass, college_name, amount, count }
    ])
    .select();

  if (error) {
    console.error('Error inserting user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  res.status(201).json(data[0]);
});

app.get('/select', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
  res.status(200).json(data);

});
app.get('/',(req,res)=>{
  res.json("Vanakam da mappla")
})
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});