import * as express from "express";
import * as session from "express-session";
import { config } from "dotenv";
import * as ConnectMongoDBSession from "connect-mongodb-session";
import * as cookieParser from "cookie-parser";
import router from "./routes/pageRoutes";
import { connectDB } from "./config/database";


//Initialise the express app and connect to DB
const app = express();
connectDB();

//Load environmental variables to process.env
config();

//Set view engine to ejs
app.set("view engine", "ejs");

//Create a MongoDBSession store for storing session
const MongoDBStore = ConnectMongoDBSession(session);
export const store = new MongoDBStore({
  uri: process.env.DATABASE_URI,
  collection: "Sessions",
});

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
//Express Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 600000,
      httpOnly: true,
    },
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
//Routes
app.use("/", router);

//Listen to server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
