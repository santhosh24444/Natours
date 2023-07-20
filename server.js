/*eslint-disable*/
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const app = require('./app');

app.use(cors());

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION. SHUTTING DOWN....');
  console.log(err.message, err.name);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 1234;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION. SHUTTING DOWN');
  server.close(() => {
    process.exit(1);
  });
});
