const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


const User = require('./models/User');
const Timetable = require('./models/Timetable');

dotenv.config();
const app = express();


app.use(cors());
app.use(express.json());



mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/timetableDB')
    .then(() => console.log("✅ MongoDB Atlas Connected!"))
    .catch(err => console.log("❌ DB Connection Error:", err));



app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email Already Registered" });
        }

        
        const newUser = new User({ 
            email, 
            password, 
            department: 'STUDENT' 
        });

        
        await newUser.save();
        res.status(201).json({ message: "Registration Successful." });

    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: "Registration Failed" });
    }
});


app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(400).json({ message: "Invalid Email or Password!" });
        
        res.json({ message: "Login Success!", user });
    } catch (err) {
        res.status(500).json({ message: "Login error!" });
    }
});



app.post('/api/add-slot', async (req, res) => {
    try {
        const { department, day, slot, subject, faculty, room } = req.body;

        const facultyClash = await Timetable.findOne({ day, slot, faculty });
        if (facultyClash) {
            return res.status(400).json({ message: `Clash! ${faculty} is already busy in ${facultyClash.department} dept!` });
        }


        const roomClash = await Timetable.findOne({ day, slot, room });
        if (roomClash) {
            return res.status(400).json({ message: `Room ${room} is already occupied by ${roomClash.department}!` });
        }

        const newSlot = new Timetable(req.body);
        await newSlot.save();
        res.json({ message: "Slot Added Successfully" });
    } catch (err) {
        res.status(500).json({ message: "Slot Failed To Save " });
    }
});


app.get('/api/timetable/:dept', async (req, res) => {
    try {
        const data = await Timetable.find({ department: req.params.dept });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Data Failed To Fetch" });
    }
});

app.delete('/api/delete-slot/:id', async (req, res) => {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Slot Removed!" });
});


app.get('/api/faculty/:name', async (req, res) => {
    try {
        const facultyName = req.params.name;
        
        const data = await Timetable.find({ 
            faculty: { $regex: new RegExp(facultyName, "i") } 
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Search Error!" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));