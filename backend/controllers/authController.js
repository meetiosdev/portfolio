const jwt = require('jsonwebtoken');

const login = (req, res) => {
  const { username, password } = req.body;

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username === validUsername && password === validPassword) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: '24h' // expires in 24 hours
    });

    return res.status(200).json({
      message: 'Login successful',
      token
    });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
};

module.exports = {
  login
};
