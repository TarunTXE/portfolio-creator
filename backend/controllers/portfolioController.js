import Portfolio from '../models/Portfolio.js';

// @desc    Create a new portfolio
// @route   POST /api/portfolio
export const createPortfolio = async (req, res) => {
  try {
    const portfolio = new Portfolio({
      user: req.user._id,
      ...req.body,
    });

    const createdPortfolio = await portfolio.save();
    res.status(201).json(createdPortfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all portfolios for the logged-in user
// @route   GET /api/portfolio
export const getPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single portfolio by ID (public – no auth required)
// @route   GET /api/portfolio/:id
export const getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id).populate('user', 'name email');

    if (portfolio) {
      res.json(portfolio);
    } else {
      res.status(404).json({ message: 'Portfolio not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a portfolio
// @route   PUT /api/portfolio/:id
export const updatePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Ensure the user owns this portfolio
    if (portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedPortfolio = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedPortfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a portfolio
// @route   DELETE /api/portfolio/:id
export const deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    if (portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Portfolio.findByIdAndDelete(req.params.id);
    res.json({ message: 'Portfolio removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
