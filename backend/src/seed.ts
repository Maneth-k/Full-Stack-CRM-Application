import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import User from "./models/User";
import Lead from "./models/Lead";

dotenv.config();

const seedDatabase = async () => {
  try {
 
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB");

    await Lead.deleteMany({});
    console.log("Cleared existing leads");

    const users = await User.find({});
    if (users.length === 0) {
      console.log(
        "No users found! Please start your server once so the Admin user is created, then run this script again.",
      );
      process.exit(1);
    }
    const userIds = users.map((u) => u._id);

 
    const leads = [];
    const statuses = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Won",
      "Lost",
    ];
    const sources = ["Website", "LinkedIn", "Referral", "Cold Email", "Event"];

    for (let i = 0; i < 50; i++) {
      // 50% chance the lead is "stale" (last updated between 6 and 14 days ago)
      // 50% chance it is "fresh" (updated in the last 4 days)
      const isStale = Math.random() > 0.5;
      const fakeDate = isStale
        ? faker.date.recent({
            days: 14,
            refDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          }) // Older than 5 days
        : faker.date.recent({ days: 4 }); // Very recent

      leads.push({
        name: faker.person.fullName(),
        company: faker.company.name(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        source: faker.helpers.arrayElement(sources),
        status: faker.helpers.arrayElement(statuses),
        dealValue: faker.number.int({ min: 1000, max: 50000 }),
        assignedTo: faker.helpers.arrayElement(userIds),
        createdAt: fakeDate,
        updatedAt: fakeDate,
      });
    }

    // 5. Insert directly into the collection (Bypasses Mongoose timestamps to keep our fake dates)
    await Lead.collection.insertMany(leads);

    console.log(`Successfully seeded ${leads.length} leads!`);
    console.log("Database seeding complete. You can now start your server.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
