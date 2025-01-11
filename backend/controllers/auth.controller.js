import { generateKeys } from "../helpers/generateKeys.js";
import { sendOtp } from "../helpers/mailer.js";
import { Otp } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
export const registerUser = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: "required fields are missing",
      });
    }
    const user = await User.findOne({
      $or: [{ email }, { phone }],
    });
    if (user) {
      return res.status(409).json({
        success: false,
        message:
          user.email === email
            ? "Email is already registered."
            : "Phone number is already registered.",
      });
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const newUser = await User.create({
      email,
      name,
      password: hashedPassword,
      phone,
    });
    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong!",
      });
    }
    res.status(201).json({
      success: true,
      message: "user registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const sendVerificationMail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "email not found",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "email is not registered",
      });
    }
    if (user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "email already verified",
      });
    }
    const response = await sendOtp(user);
    if (!response) {
      return res.status(500).json({
        success: false,
        message: "otp failed to send",
      });
    }
    res.status(200).json({
      success: true,
      message: "otp sent successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const verifyMail = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(401).json({
        success: false,
        message: "please enter otp",
      });
    }
    const currentOtp =await Otp.findById(req.params.id);
    if (!currentOtp) {
      return res.status(404).json({
        success: false,
        message: "otp not generated",
      });
    }
    const isOtpCorrect = await bcryptjs.compare(otp, currentOtp.otp);
    if (!isOtpCorrect) {
      return res.status(401).json({
        success: false,
        message: "otp invalid",
      });
    }
    const isExpired = Date.now() < currentOtp.expiresAt;
    if (!isExpired) {
      await Otp.findByIdAndDelete(req.params.id);
      return res.status(401).json({
        success: false,
        message: "otp expired",
      });
    }
    const user = await User.findById(currentOtp.userId);
    user.isVerified = true;
    await user.save();
    await Otp.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "email verified successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "required fields are missing",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "email is not registered",
      });
    }
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "email not verified",
      });
    }
    const isPasswordCorrect =await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "password incorrect",
      });
    }
    generateKeys();
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { algorithm: "RS256" }
    );
    if (!token) {
      return res.status(500).json({
        success: false,
        message: "failed to generate token",
      });
    }
    return res.status(200).json({
      success: false,
      message: "login successfull",
      token,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const changePassword = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};