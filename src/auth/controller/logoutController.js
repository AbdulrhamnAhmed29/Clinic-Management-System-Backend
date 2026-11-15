export const logoutController = (req, res) => {
  return res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    })
    .status(200)
    .json({
      success: true,
      message: "Logout successful",
    });
};
