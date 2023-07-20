const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const Tour = require('./../../models/tourmodels');
const review = require('./../../models/reviewmodel');
const user = require('./../../models/usermodel');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE;

mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true });
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const importData = async () => {
    try {
        await Tour.create(tours);
        await review.create(reviews);
        await user.create(users,{validateBeforeSave:false});

        console.log('data loaded successfully');
    }catch (err) {
        console.log(err);
    };
    process.exit();
};
const DeleteData = async () => {
    try {
        await Tour.deleteMany();
        await review.deleteMany();
        await user.deleteMany();

        console.log("Deleted successfully");
    
    
    } catch (err) {
        console.log(err);
    }
    process.exit();
    
}
console.log(process.argv);

 if (process.argv[2] === '--import') {
     importData();
 }
 else if (process.argv[2] === '--delete') {
     DeleteData();
 }