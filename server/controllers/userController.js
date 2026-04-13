import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Timetable from '../models/Timetable.js';
import jwt from 'jsonwebtoken';
import dns from 'dns';

// Force node.js to resolve domain names to IPv4 first (fixes Render ENETUNREACH for Gmail IPv6)
dns.setDefaultResultOrder('ipv4first');

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

// Send welcome email using Mailgun API (HTTP config from .env)
const sendWelcomeEmail = async ({ email, firstName, lastName, password, role, parentContext = false }) => {
  if (!process.env.MAILGUN_DOMAIN || !process.env.MAILGUN_API_KEY) {
    console.log(`[EMAIL SKIPPED] Mailgun not configured. Credentials for ${email}: ${password}`);
    return;
  }

  const roleLabels = {
    student: 'Élève',
    teacher: 'Enseignant',
    parent: 'Parent',
  };

  const studentEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@atlass.com`.replace(/\s+/g, '');
  const subject = parentContext ? `Atlas Academy — Accès de votre enfant ${firstName}` : 'Bienvenue à Atlas Academy — Vos identifiants';

  const htmlContent = `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px">
      <h2 style="color:#1a3c34;font-weight:900">Bienvenue à Atlas Academy</h2>
      ${parentContext ? `
        <p>Bonjour,</p>
        <p>Le compte élève de votre enfant <strong>${firstName} ${lastName}</strong> a été créé.</p>
        <p>Voici les identifiants pour accéder à son espace personnel :</p>
      ` : `
        <p>Bonjour <strong>${firstName} ${lastName}</strong>,</p>
        <p>Votre compte <strong>${roleLabels[role] || role}</strong> a été créé par l'administration.</p>
      `}
      
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
        <p style="margin:0 0 8px"><strong>Identifiant (Email) :</strong> ${parentContext ? studentEmail : email}</p>
        <p style="margin:0"><strong>Mot de passe :</strong> <code style="background:#f1f5f9;padding:4px 8px;border-radius:6px">${password}</code></p>
      </div>
      <p style="color:#64748b;font-size:13px">Vous pouvez vous connecter à la plateforme en utilisant ces informations.</p>
      <a href="${process.env.APP_URL || 'http://localhost:5173'}/login"
         style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a3c34;color:#fff;border-radius:12px;text-decoration:none;font-weight:bold">
        Accéder à la plateforme
      </a>
      <p style="margin-top:32px;color:#94a3b8;font-size:11px">© ${new Date().getFullYear()} Atlas Academy</p>
    </div>
  `;

  try {
    const formData = new URLSearchParams();
    formData.append('from', `Atlas Academy <postmaster@${process.env.MAILGUN_DOMAIN}>`);
    formData.append('to', email);
    formData.append('subject', subject);
    formData.append('html', htmlContent);

    const response = await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from('api:' + process.env.MAILGUN_API_KEY).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mailgun API error: ${response.status} ${errorText}`);
    }

    console.log(`[EMAIL SENT] Welcome email sent to ${email} via Mailgun`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${email}:`, error.message);
  }
};

// ── GET /api/users — list all non‑admin users ──────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const { role, grade } = req.query;
    const filter = { role: { $ne: 'admin' } };
    if (role) filter.role = role;
    if (grade) filter.grade = grade;
    
    const users = await User.find(filter).select('-password').sort({ lastName: 1 });
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
    const isPrimaire = isStudent && ['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(grade);
    
    let effectiveHasLogin = hasLogin;

    let finalEmail = email;

    if (isStudent && effectiveHasLogin) {
      // Force Atlas domain for students if no email provided
      if (!email) {
        finalEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@atlass.com`.replace(/\s+/g, '');
      }
    }

    if (effectiveHasLogin && !finalEmail) {
      return res.status(400).json({ message: 'L\'email est requis pour ce type de compte.' });
    }

    if (effectiveHasLogin && finalEmail) {
      const existingUser = await User.findOne({ email: finalEmail });
      if (existingUser) return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    if (effectiveHasLogin && !rawPassword) {
      rawPassword = Math.random().toString(36).slice(-8);
    }

    const userData = {
      firstName, lastName, role, grade: grade || 'N/A', subject: subject || '', phone: phone || '', parentId: (parentId && parentId !== "") ? parentId : null, isActive: true, classes: classes
    };

    if (effectiveHasLogin) {
      userData.email = finalEmail;
      userData.password = rawPassword;
    }

    const user = await User.create(userData);

    // Send welcome email asynchronously if effectiveHasLogin is true
    if (effectiveHasLogin) {
      let recipientEmail = finalEmail;
      let emailSubject = 'Atlas Academy — Vos identifiants';

      if (isPrimaire && !finalEmail) {
        if (!user.parentId) {
          console.warn(`[REGISTRATION] Primary student ${user.firstName} created without parent and no email. Credentials sent to: ${finalEmail}`);
        } else {
          try {
            const parent = await User.findById(user.parentId);
            if (parent && parent.email) {
              recipientEmail = parent.email;
              emailSubject = `Atlas Academy — Accès pour ${user.firstName}`;
              console.log(`[REGISTRATION] Routing primary student credentials to parent: ${parent.email}`);
            } else {
              console.warn(`[REGISTRATION] Selected parent ${user.parentId} not found or has no email. Falling back to student email.`);
            }
          } catch (err) {
            console.error(`[REGISTRATION] Failed to fetch parent ${user.parentId} for email routing:`, err.message);
          }
        }
      }

      sendWelcomeEmail({ 
        email: recipientEmail, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        password: rawPassword, 
        role: user.role,
        parentContext: isPrimaire
      }).catch(emailErr => {
        console.error(`[EMAIL ERROR] To ${recipientEmail}:`, emailErr.message);
      });
    }

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      grade: user.grade,
      subject: user.subject,
      classes: user.classes,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      generatedPassword: rawPassword // Sent to admin UI since emails are disabled
    });

    // Auto-sync Subjects for Teacher
    if (user.role === 'teacher' && user.subject && user.classes?.length > 0) {
      const subjectsToCreate = user.classes.map(grade => ({
        name: user.subject,
        teacher: user._id,
        grade: grade,
        progress: 0,
        status: 'On Track'
      }));
      await Subject.insertMany(subjectsToCreate).catch(err => console.error('Auto-sync subject create error:', err));
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/users/:id — get a user by ID ─────────────────────────────────
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('parentId', 'firstName lastName email phone');
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
    // Don't change admin password via this general endpoint
    if (password && password.trim() !== '' && user.role !== 'admin') user.password = password;
    // Allow parentId to be set to null (unlink) or a valid ID
    if ('parentId' in req.body) user.parentId = req.body.parentId || null;

    await user.save();

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      grade: user.grade,
      subject: user.subject,
      classes: user.classes,
      phone: user.phone,
      isActive: user.isActive,
    });

    // Auto-sync Subjects for Teacher on update
    if (user.role === 'teacher' && user.subject && user.classes) {
      // 1. Rename existing subjects if the subject name changed
      await Subject.updateMany({ teacher: user._id }, { name: user.subject });
      
      const existingSubjects = await Subject.find({ teacher: user._id });
      const existingGrades = existingSubjects.map(s => s.grade);
      
      // 2. Add missing subjects for newly assigned classes
      const missingGrades = user.classes.filter(c => !existingGrades.includes(c));
      if (missingGrades.length > 0) {
        const subjectsToCreate = missingGrades.map(grade => ({
          name: user.subject,
          teacher: user._id,
          grade: grade,
          progress: 0,
          status: 'On Track'
        }));
        await Subject.insertMany(subjectsToCreate).catch(err => console.error('Auto-sync subject add error:', err));
      }
      
      // 3. Remove subjects for classes that are no longer assigned
      const extraGrades = existingGrades.filter(g => !user.classes.includes(g));
      if (extraGrades.length > 0) {
        const subjectsToRemove = await Subject.find({ teacher: user._id, grade: { $in: extraGrades } });
        const subjectIdsToRemove = subjectsToRemove.map(s => s._id);
        await Timetable.deleteMany({ subject: { $in: subjectIdsToRemove } }).catch(err => console.error('Timetable cleanup error:', err));
        await Subject.deleteMany({ teacher: user._id, grade: { $in: extraGrades } }).catch(err => console.error('Auto-sync subject delete error:', err));
      }
    }

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

    // Cleanup relational data
    if (user.role === 'teacher') {
      const teacherSubjects = await Subject.find({ teacher: user._id });
      const subjectIds = teacherSubjects.map(s => s._id);
      await Timetable.deleteMany({ subject: { $in: subjectIds } }).catch(err => console.log(err));
      await Subject.deleteMany({ teacher: user._id }).catch(err => console.log(err));
    }

    await user.deleteOne();
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/users/profile/password — user changes own password ──────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'L\'ancien et le nouveau mot de passe sont requis.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'L\'ancien mot de passe est incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Mot de passe mis à jour avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
