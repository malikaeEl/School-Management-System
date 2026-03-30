import mongoose from 'mongoose';
import Inventory from './models/Inventory.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Seed Inventory
    await Inventory.deleteMany({});
    const items = [
      { name: 'MacBook Air M2', category: 'Informatique', quantity: 15, location: 'Salle Multimedia', status: 'Optimal', type: 'asset' },
      { name: 'Projecteur Epson 4K', category: 'Informatique', quantity: 4, location: 'Magasin B', status: 'Maintenance', type: 'asset' },
      { name: 'Tableau Blanc Interactif', category: 'Mobilier', quantity: 8, location: 'Salles 1-8', status: 'Optimal', type: 'asset' },
      { name: 'Rame Papier A4', category: 'Papeterie', quantity: 2, location: 'Administration', status: 'Optimal', type: 'consumable', minStockLevel: 5 },
      { name: 'Microscope Optique', category: 'Laboratoire', quantity: 12, location: 'Labo 1', status: 'Optimal', type: 'asset' },
      { name: 'Ballon de Basket', category: 'Sport', quantity: 20, location: 'Gymnase', status: 'Optimal', type: 'asset' },
    ];
    await Inventory.insertMany(items);
    console.log('Inventory seeded!');

    // 2. Update a Teacher for demo
    const teacher = await User.findOne({ role: 'teacher' });
    if (teacher) {
      teacher.subject = 'Mathématiques';
      teacher.classes = ['CP', 'CE1', '6ème année']; // Mix of existing and new
      await teacher.save();
      console.log(`Updated teacher ${teacher.firstName} for demo.`);
    }

    mongoose.disconnect();
    console.log('Seeding complete.');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
