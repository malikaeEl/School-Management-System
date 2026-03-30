import Inventory from '../models/Inventory.js';

// Get all inventory items
export const getInventory = async (req, res) => {
  try {
    const { type, category } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    
    const items = await Inventory.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new inventory item
export const addInventoryItem = async (req, res) => {
  try {
    const newItem = await Inventory.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an inventory item
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await Inventory.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedItem) return res.status(404).json({ message: 'Article introuvable.' });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an inventory item
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    await Inventory.findByIdAndDelete(id);
    res.json({ message: 'Article supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
