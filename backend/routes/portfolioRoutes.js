import express from 'express';
import {
  createPortfolio,
  getPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
} from '../controllers/portfolioController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route – anyone can view a portfolio
router.get('/:id', getPortfolioById);

// Protected routes – require login
router.route('/').get(protect, getPortfolios).post(protect, createPortfolio);
router.route('/:id').put(protect, updatePortfolio).delete(protect, deletePortfolio);

export default router;
