import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Mobilier', 'Informatique', 'Laboratoire', 'Sport', 'Papeterie', 'Maintenance', 'Autre'],
    default: 'Mobilier',
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Optimal', 'Maintenance', 'Réparation', 'Déclassé'],
    default: 'Optimal',
  },
  type: {
    type: String,
    enum: ['asset', 'consumable'],
    default: 'asset',
  },
  minStockLevel: {
    type: Number,
    default: 5,
  },
  unitPrice: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
