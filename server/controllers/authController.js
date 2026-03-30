import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    let { firstName, lastName, email, password, role } = req.body;
    email = email?.toLowerCase();

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.trim().toLowerCase();
    password = password?.trim();
    console.log(`[AUTH] Login attempt for: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[AUTH] User NOT found for email: ${email}`);
      return res.status(401).json({ message: 'Identifiants invalides (utilisateur non trouvé).' });
    }

    const isMatch = await user.comparePassword(password);
    console.log(`[AUTH] Password match for ${email}: ${isMatch}`);

    if (isMatch) {
      const userObj = user.toObject();
      delete userObj.password;
      
      res.json({
        ...userObj,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Identifiants invalides (mot de passe incorrect).' });
    }
  } catch (error) {
    console.error(`[AUTH] Login error for ${req.body.email}:`, error);
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
