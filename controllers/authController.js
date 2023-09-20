import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import Jwt from "jsonwebtoken";

const nullCheck = (
  name = "name",
  email = "email",
  password = "password",
  answer = "temp"
) => {
  // null check
  if (!name) {
    return {
      success: false,
      message: "Name is required",
    };
  }
  if (!email) {
    return {
      success: false,
      message: "Email is required",
    };
  }
  if (!password && password.length < 6) {
    return {
      success: false,
      message: "Password is empty or less than 6 characters",
    };
  }
  if (!answer) {
    return {
      success: false,
      message: "Answer is required",
    };
  }
  return {
    success: true,
    message: "Null check passed",
  };
};

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    // null check
    const nullCheckResult = nullCheck(name, email, password, answer);
    if (!nullCheckResult.success) {
      return res.status(400).json(nullCheckResult);
    }

    // user already exists?
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Already registered! Please login",
      });
    }

    const hashedPassword = await hashPassword(password);

    // register user => save user to DB
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in registering user",
      error,
    });
  }
};

// POST login
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // null check
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Does user even exists?
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email is not registered!",
      });
    }

    // Is password correct?
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Wrong password!",
      });
    }

    // Create token
    const token = Jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Send token to client
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in logging user",
      error,
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, password, answer } = req.body;
    // console.log(req.body);

    // null check
    const nullCheckResult = nullCheck("name", email, password, answer);
    if (!nullCheckResult.success) {
      return res.status(400).json(nullCheckResult);
    }

    // does user even exists?
    const existingUser = await userModel.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is not registered!",
      });
    }

    // is answer correct?
    if (answer !== existingUser.answer) {
      return res.status(400).json({
        success: false,
        message: "Wrong answer!",
      });
    }

    // hash new password
    const hashedPassword = await hashPassword(password);

    // update password
    await userModel.findOneAndUpdate(existingUser._id, {
      password: hashedPassword,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in resetting password",
      error,
    });
  }
};

// test controller
export const testController = (req, res) => {
  res.send("Protected route");
};

// update profile controller
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password is empty or less than 6 characters",
      });
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;
    const user = await userModel.findOne({ email });

    const updateUser = await userModel.findByIdAndUpdate(
      user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );

    return res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      updateUser,
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error in updating profile",
      error,
    });
  }
};

// get all users
export const GetAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({});

    return res.status(200).json({
      success: true,
      message: "Get all users successfully",
      users,
    });
  } catch(error) {
    return res.status(500).json({
      success: false,
      message: "Error in getting all users",
      error,
    })
  }
};

// change role of a user
export const ChangeRoleController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await userModel.findByIdAndUpdate(id, {
      role,
    }, { new: true });

    return res.status(200).json({
      success: true,
      message: "Role changed successfully",
      user,
    })
  } catch(error) {
    // console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error in changing role",
      error,
    })
  }
};