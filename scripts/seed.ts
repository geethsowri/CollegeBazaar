import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User";
import { Listing } from "../src/models/Listing";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const passwordHash = await bcrypt.hash("password123", 12);
  const admin = await User.findOneAndUpdate(
    { email: "admin@inncircles.com" },
    {
      email: "admin@inncircles.com",
      name: "Admin",
      passwordHash,
      role: "admin",
      emailVerified: true,
      branch: "CSE",
      year: 4,
    },
    { upsert: true, new: true }
  );

  const senior = await User.findOneAndUpdate(
    { email: "senior@inncircles.com" },
    {
      email: "senior@inncircles.com",
      name: "Aditi Rao",
      passwordHash,
      role: "user",
      emailVerified: true,
      branch: "ME",
      year: 4,
    },
    { upsert: true, new: true }
  );

  await Listing.deleteMany({ seller: senior._id });
  await Listing.insertMany([
    {
      seller: senior._id,
      title: "Casio fx-991ES Plus calculator",
      description: "Used for 2 semesters. All keys work. Battery still strong.",
      category: "calculator",
      condition: "good",
      images: ["https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=1200"],
      originalPrice: 1200, sellingPrice: 520, branchRelevance: ["CSE", "ME", "EE"],
    },
    {
      seller: senior._id,
      title: "Mini drafter — Camlin",
      description: "Lightly used, full kit including screws. Selling because I'm graduating.",
      category: "mini_drafter",
      condition: "like_new",
      images: ["https://images.unsplash.com/photo-1611784728558-6a7645e72854?w=1200"],
      originalPrice: 1400, sellingPrice: 700, branchRelevance: ["ME", "CE"],
    },
    {
      seller: senior._id,
      title: "Lab apron — size M",
      description: "Clean, no stains. Wore it for 1 year of chem lab.",
      category: "lab_apron",
      condition: "good",
      images: ["https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=1200"],
      originalPrice: 400, sellingPrice: 180, branchRelevance: ["BT", "CHE"],
    },
  ]);

  console.log("Seeded.");
  console.log("Admin login: admin@inncircles.com / password123");
  console.log("Seller login: senior@inncircles.com / password123");

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
