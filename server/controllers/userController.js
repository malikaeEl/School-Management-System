import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Generate a random default password
const generatePassword = () => {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Send welcome email using nodemailer (SMTP config from .env)
const sendWelcomeEmail = async ({ email, firstName, lastName, password, role }) => {
  // Guard: only send if email config present
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log(`[EMAIL SKIPPED] Credentials for ${email}: ${password}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const roleLabels = {
    student: 'Élève',
    teacher: 'Enseignant',
    parent: 'Parent',
  };

  try {
    await transporter.sendMail({
      from: `"Atlas Academy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Bienvenue à Atlas Academy — Vos identifiants de connexion',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px">
          <h2 style="color:#1a3c34;font-weight:900">Bienvenue à Atlas Academy</h2>
          <p>Bonjour <strong>${firstName} ${lastName}</strong>,</p>
          <p>Votre compte <strong>${roleLabels[role] || role}</strong> a été créé par l'administration.</p>
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
            <p style="margin:0 0 8px"><strong>Email :</strong> ${email}</p>
            <p style="margin:0"><strong>Mot de passe :</strong> <code style="background:#f1f5f9;padding:4px 8px;border-radius:6px">${password}</code></p>
          </div>
          <p style="color:#64748b;font-size:13px">Connectez-vous et modifiez votre mot de passe dès que possible.</p>
          <a href="${process.env.APP_URL || 'http://localhost:5173'}/login"
             style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a3c34;color:#fff;border-radius:12px;text-decoration:none;font-weight:bold">
            Se connecter
          </a>
          <p style="margin-top:32px;color:#94a3b8;font-size:11px">© ${new Date().getFullYear()} Atlas Academy</p>
        </div>
      `,
    });
    console.log(`[EMAIL SENT] Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${email}:`, error.message);
  }
};

// ── GET /api/users — list all non‑admin users ──────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/users — admin creates a new account ─────────────────────────
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, grade, subject, phone, parentId, hasLogin = true, classes = [] } = req.body;
    let rawPassword = req.body.password;
    if (!firstName || !lastName || !role) {
      return res.status(400).json({ message: 'FirstName, LastName, and Role are required' });
    }

    const isStudent = role === 'student';
    let finalEmail = email;

    if (isStudent && hasLogin) {
      finalEmail = `${firstName.toLowerCase()}@Atlas.com`.replace(/\s+/g, '');
    }

    if (hasLogin && !finalEmail) {
      return res.status(400).json({ message: 'Email required for accounts with login access.' });
    }

    if (hasLogin && finalEmail) {
      const existingUser = await User.findOne({ email: finalEmail });
      if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });
    }

    if (hasLogin && !rawPassword) {
      rawPassword = Math.random().toString(36).slice(-8);
    }

    const userData = {
      firstName, lastName, role, grade: grade || 'N/A', subject: subject || '', phone: phone || '', parentId: parentId || null, isActive: true, classes: classes
    };

    if (hasLogin) {
      userData.email = finalEmail;
      userData.password = rawPassword;
    }

    const user = await User.create(userData);

    // Send welcome email asynchronously if hasLogin is true
    if (hasLogin) {
      sendWelcomeEmail({ email, firstName, lastName, password: rawPassword, role }).catch(emailErr => {
        console.error('Email send failed:', emailErr.message);
      });
    }

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      grade: user.grade,
      classes: user.classes,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/users/:id — get a user by ID ─────────────────────────────────
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/users/:id — update a user ────────────────────────────────────
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, grade, subject, classes, phone, isActive, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    user.firstName = firstName ?? user.firstName;
    user.lastName  = lastName  ?? user.lastName;
    user.email     = email     ?? user.email;
    user.role      = role      ?? user.role;
    user.grade     = grade     ?? user.grade;
    user.phone     = phone     ?? user.phone;
    if (subject !== undefined) user.subject = subject;
    if (classes !== undefined) user.classes = classes;
    if (typeof isActive !== 'undefined') user.isActive = isActive;
    if (password && password.trim() !== '') user.password = password;

    await user.save();

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      grade: user.grade,
      classes: user.classes,
      phone: user.phone,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/users/:id — remove a user ─────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Impossible de supprimer un administrateur.' });

    await user.deleteOne();
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
