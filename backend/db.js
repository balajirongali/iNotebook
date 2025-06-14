const mongoose = require('mongoose');

require('dotenv').config();
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/inotebook';


const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

module.exports = connectToMongo;
