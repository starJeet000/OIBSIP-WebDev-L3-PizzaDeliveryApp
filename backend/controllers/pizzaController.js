import Pizza from "../models/Pizza.js";

// @desc    Get all pizzas with search, filter, and pagination
// @route   GET /api/pizzas
// @access  Public
export const getPizzas = async (req, res) => {
  try {
    const { search, type, minPrice, maxPrice, pageNumber } = req.query;

    // Pagination setup
    const page = Number(pageNumber) || 1;
    const limit = 8; // 8 pizzas per page
    const skip = (page - 1) * limit;

    // Build the query object
    let query = { available: true };

    // Search by pizza name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Filter by Vegetarian/Non-vegetarian[cite: 1]
    if (type && type !== "All") {
      query.isVegetarian = type === "Vegetarian";
    }

    // Filter by Price range[cite: 1]
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const total = await Pizza.countDocuments(query);
    const pizzas = await Pizza.find(query).skip(skip).limit(limit);

    res.json({
      success: true,
      pizzas,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
