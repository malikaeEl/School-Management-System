import Message from '../models/Message.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content
    });

    // Also trigger a notification for the receiver
    await Notification.create({
      user: receiverId,
      type: 'Message',
      title: 'Nouveau Message',
      message: `${req.user.firstName} vous a envoyé un message.`,
      link: '/messages'
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get conversations list (recent contacts)
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find unique users who interacted with current user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ timestamp: -1 });

    const contactIds = new Set();
    messages.forEach(m => {
      if (m.sender.toString() !== userId.toString()) contactIds.add(m.sender.toString());
      if (m.receiver.toString() !== userId.toString()) contactIds.add(m.receiver.toString());
    });

    // For non-admins, they only see admins in their list if they don't have a conversation yet
    // But usually we show whoever they talked to.
    // If admin is not in the list, and they are teacher/parent, we could add the first admin found
    if (req.user.role !== 'admin' && contactIds.size === 0) {
       const admin = await User.findOne({ role: 'admin' });
       if (admin) contactIds.add(admin._id.toString());
    }

    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } })
      .select('firstName lastName role avatar isActive');

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get message thread
export const getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ timestamp: 1 });

    // Mark as read
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
