import { compare, hash } from "bcryptjs";
import { RequestHandler } from "express";
import { sign } from "jsonwebtoken";
import { getMongoManager } from "typeorm";
import { User } from "../models/entity/User";
import { IRegisterUser } from "../models/interfaces/register.interface";
import { IJwtData } from "../models/interfaces/jwtData.interface";

//This function renders main page.
export const getMainPage: RequestHandler = async (req, res) => {
  res.render("index", { isAuth: req.isAuth, index: "home" });
};

//This function renders register page
export const getRegisterPage: RequestHandler = async (req, res) => {
  if (req.isAuth) return res.redirect("/");
  res.render("sign-up");
};

//This function renders login page
export const getLoginPage: RequestHandler = async (req, res) => {
  if (req.isAuth) return res.redirect("/");
  res.render("sign-in");
};

//This function renders users page
export const getUsersPage: RequestHandler = async (req, res) => {
  if (!req.isAuth) return res.redirect("/login");

  //Get mongo manager for accessing database and find all users
  const manager = getMongoManager();
  let users = await manager.find(User);
  res.render("users", { isAuth: req.isAuth, users, index: "users" });
};

//This function adds new users to db
export const registerUser: RequestHandler = async (req, res) => {
  try {
    //Get all credentials from req.body
    const { firstName, lastName, email, password }: IRegisterUser = req.body;

    //Get mongo manager for accessing database
    const manager = getMongoManager();

    //Check if a user exists with that email, if exist throw error
    const oldUser = await manager.findOne(User, { email });
    if (oldUser) throw "User already exists.";

    //Encrypt the password
    const encryptedPass = await hash(password, 10);

    //Create a new User according to the User entity
    const user = new User();

    //Give credentials to new user
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email.toLowerCase();
    user.password = encryptedPass;

    //Save this user to db
    await manager.save(user);

    //Redirect to login page
    res.status(201).redirect("/login");
  } catch (err) {
    //If any error occures, send them to sign-up page
    res.render("sign-up", { err });
  }
};

//This function is for logging in
export const loginUser: RequestHandler = async (req, res) => {
  try {
    //Get credentials from req.body
    const { email, password }: IRegisterUser = req.body;

    //Get mongo manager for accessing database
    const manager = getMongoManager();

    //Check if a user exists with that email, if not throw error
    const user = await manager.findOne(User, { email });
    if (!user) throw "User not found!";

    //Check if the password is correct, if not throw error
    let passwordIsValid = await compare(password, user.password);
    if (!passwordIsValid) throw "Password is not correct";

    //Create a JWT token and write userID and BrowserInfo to it.
    let token = sign(
      {
        id: user.id.toString(),
        browserInfo: req.headers["user-agent"],
      } as IJwtData,
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    //Send this JWT token to client with a token
    res.cookie("token", token, { httpOnly: true });

    //Create a session and write userID and BrowserInfo to it.
    req.session.userID = user.id.toString();
    req.session.browserInfo = req.headers["user-agent"];

    //Redirect to homepage
    res.redirect("/");
  } catch (err) {
    //If any error occures, send them to sign-in page
    res.render("sign-in", { err });
  }
};

//This function is for logging out
export const logOutUser: RequestHandler = async (req, res) => {
  //Destroy the session
  req.session.destroy((err) => {
    if (err) return res.send("An error occured");
  });

  //Clear the cookies
  res.clearCookie("token");
  res.clearCookie("connect.sid");

  //Redirect to homepage
  res.redirect("/");
};
