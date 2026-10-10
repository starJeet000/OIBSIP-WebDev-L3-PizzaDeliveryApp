import User from "../models/User.js";
import Order from "../models/Order.js";

// @desc    Get user profile and dashboard stats
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Fetch user's orders to calculate dashboard stats
    // Note: The Order model will be fully built in Section 6, but we can query it now
    let orders = [];
    let totalSpent = 0;

    try {
      orders = await Order.find({ userId: req.user.id }).sort({
        createdAt: -1,
      });

      // Calculate total spent only from non-cancelled orders
      totalSpent = orders.reduce((acc, order) => {
        if (order.status !== "Cancelled" && order.pricing?.grandTotal) {
          return acc + order.pricing.grandTotal;
        }
        return acc;
      }, 0);
    } catch (orderError) {
      // Gracefully handle if Order model isn't fully seeded yet
      console.log("Order aggregation skipped or Order model not ready.");
    }

    res.json({
      success: true,
      ...user._doc,
      orders,
      totalSpent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile (Name, Phone, Address)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    if (req.body.address) {
      user.address = {
        street: req.body.address.street || user.address?.street,
        city: req.body.address.city || user.address?.city,
        postalCode: req.body.address.postalCode || user.address?.postalCode,
      };
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    if (!(await user.matchPassword(currentPassword))) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect current password" });
    }

    // Password validation: min 8 chars, 1 uppercase, 1 number, 1 special char[cite: 1]
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_=+-]).{8,}$/;
    if (!regex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters, with 1 uppercase, 1 number, and 1 special character.",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
