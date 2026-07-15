const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection Setup
const mongoURI = process.env.MONGO_URI || "mongodb://smuthubalan0808_db_user:smuth123@ac-ljzn2gz-shard-00-00.usukwed.mongodb.net:27017,ac-ljzn2gz-shard-00-01.usukwed.mongodb.net:27017,ac-ljzn2gz-shard-00-02.usukwed.mongodb.net:27017/?ssl=true&replicaSet=atlas-lbogda-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log('Database connected successfully! 🎉'))
    .catch(err => console.error('Database connection error: ❌', err));

// ==========================================
// 1. DATA MODELS & SCHEMAS
// ==========================================

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['User', 'Vendor', 'Admin'], default: 'User' }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Rental Inventory Schema
const RentEaseItemSchema = new mongoose.Schema({
    title: { type: String, required: true },         
    description: { type: String, required: true },   
    price: { type: Number, required: true }, 
    securityDeposit: { type: Number, required: true, default: 0 }, 
    tenureOptions: { type: String, required: true, default: "3, 6, 12 Months" }, 
    category: { type: String, required: true, enum: ['Furniture', 'Appliance', 'Office Essentials'], default: 'Furniture' }, 
    condition: { type: String, required: true },      
    deliveryDays: { type: Number, required: true, default: 3 }, 
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true }
}, { timestamps: true });

const RentalItem = mongoose.model('RentalItem', RentEaseItemSchema);

// Maintenance Ticket Schema
const MaintenanceSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    issueDescription: { type: String, required: true },
    userContact: { type: String, required: true },
    status: { type: String, default: 'Pending' }
}, { timestamps: true });

const MaintenanceTicket = mongoose.model('MaintenanceTicket', MaintenanceSchema);

// ==========================================
// 2. API ENDPOINTS (ROUTES)
// ==========================================

// AUTH: Register User
app.post('/api/auth/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(400).json({ message: 'Registration failed', error: error.message });
    }
});

// AUTH: Login User
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });
        res.json({ message: 'Login successful!', username: user.username, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// INVENTORY: Fetch all
app.get('/api/properties', async (req, res) => {
    try {
        const items = await RentalItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching catalog items', error: error.message });
    }
});

// INVENTORY: Create new listing
app.post('/api/properties', async (req, res) => {
    try {
        const newItem = new RentalItem(req.body);
        await newItem.save();
        res.status(201).json({ message: 'Rental item added to inventory!' });
    } catch (error) {
        res.status(400).json({ message: 'Validation Failed to save item', error: error.message });
    }
});

// OPERATIONS: Submit Maintenance Request
app.post('/api/maintenance', async (req, res) => {
    try {
        const ticket = new MaintenanceTicket(req.body);
        await ticket.save();
        res.status(201).json({ message: 'Maintenance ticket created!' });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create ticket', error: error.message });
    }
});

// OPERATIONS: Get all Maintenance Requests
app.get('/api/maintenance', async (req, res) => {
    try {
        const tickets = await MaintenanceTicket.find().sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tickets' });
    }
});

// FRONTEND SERVING
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/*catchall', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Host Server
app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT} 🚀`);
});