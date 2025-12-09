const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const paymentController = require('../controllers/paymentController'); // Reuse specific actions
const roleMiddleware = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const validationMiddleware = require('../middlewares/validationMiddleware');

// Base middleware
router.use(authMiddleware.authenticate);
router.use(roleMiddleware.restrictTo('Finance Officer', 'Super Admin'));

// Dashboard
router.get('/dashboard', financeController.getDashboard);

// Payments
router.get('/payments', financeController.getPayments);

// Reuse payment controller for specific actions but ensure route protection
// We can also allow Finance Officer to process refunds
router.post('/payments/:id/refund',
    validationMiddleware.validateRefund,
    paymentController.processRefund
);

// Invoices (Placeholder)
router.get('/invoices', financeController.getInvoices);

// Reports (Placeholder)
router.get('/reports', financeController.getReports);

module.exports = router;
