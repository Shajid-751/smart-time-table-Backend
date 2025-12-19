const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
    department: String,
    day: String,      
    slot: String,     
    subject: String,
    faculty: String,
    room: String
});

module.exports = mongoose.model('Timetable', TimetableSchema);