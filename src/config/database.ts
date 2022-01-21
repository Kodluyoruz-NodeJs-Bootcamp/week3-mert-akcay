import { createConnection } from "typeorm";

//This function is for connecting to DB
export const connectDB = async () => {
  try {
    await createConnection();
    console.log("Connected to DB");
  } catch (err) {
    console.log("Database connection failed");
  }
};
