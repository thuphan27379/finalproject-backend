const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Admin = require('../models/Admin'); // Adjust the path as necessary

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updatePasswords() {
  try {
    const admins = await Admin.find({});

    // biome-ignore lint/style/useConst: <explanation>
    for (let admin of admins) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await Admin.updateOne(
        { _id: admin._id },
        { $set: { password: hashedPassword } }
      );
      console.log(`Updated password for admin: ${admin.email}`);
    }

    console.log('Password update completed.');
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    mongoose.connection.close();
  }
}

updatePasswords();
