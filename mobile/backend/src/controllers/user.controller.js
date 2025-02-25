
const prisma = require('../../prisma/index'); // Import the Prisma client
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // Add to .env
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
// Signup controller
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if the email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email is already in use' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Store the hashed password
      },
    });

    // Respond with success (avoid sending sensitive data like password back)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Something went wrong during signup' });
  } finally {
    await prisma.$disconnect(); // Ensure Prisma client disconnects
  }
};
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(email
      ,password,"email,password")
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
  
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });
  
      // Check if user exists and password matches
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email }, // Payload
        process.env.JWT_SECRET,            // Secret from .env
        { expiresIn: '1h' }                // Token expiration
      );
  
      // Send response with token
      res.status(200).json({
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Something went wrong during login' });
    } finally {
      await prisma.$disconnect();
    }
  };
  const googleLogin = async (req, res) => {
    const { idToken } = req.body;
  
    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }
  
    try {
        console.log(idToken,"id")
        console.log(GOOGLE_CLIENT_ID,"GOOGLE_CLIENT_ID")
      // Verify the Google ID token
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID, // Ensure token is meant for your app
      });
      const payload = ticket.getPayload();
      console.log(payload,"payload");
  
      const googleId = payload['sub']; // Google's unique user ID
      const email = payload['email'];
      const name = payload['name'];
       console.log(googleId,email,name,"googleId,email,name");
      // Check if user exists by googleId or email
      let user = await prisma.user.findFirst({
        where: {
          OR: [{ googleId }, { email }],
        },
      });
  
      if (!user) {
        // Create a new user if they don’t exist
        user = await prisma.user.create({
          data: {
            name,
            email,
            googleId,
            // No password needed for Google-authenticated users
          },
        });
      } else if (!user.googleId) {
        // If user exists via email but not googleId, link the Google account
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }
  
      // Generate JWT
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.status(200).json({
        message: 'Google login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (error) {
        console.log(error,"error");
      console.error('Google login error:', error);
      res.status(401).json({ error: 'Invalid Google token' });
    } finally {
      await prisma.$disconnect();
    }
  };
// Export the controller
module.exports = { signup,loginUser,googleLogin };