import User from "../../features/users/model/userModel.js";
import bcrypt from "bcrypt";

export const registerController = async (req, res, next) => {
  const { name, email, password ,role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    return next(error);
  }
};