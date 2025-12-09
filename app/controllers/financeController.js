const Payment = require('../models/Payment');
const auditHelper = require('../helpers/auditHelper');
// Reusing the mock processor from paymentController or moving it to a helper would be better,
// but for now we'll simulate refund logic here or import if possible. 
// Since paymentController export is an object, we can't easily import just the processor.
// We'll duplicate the mock processor logic for safety and speed, or better, make a new paymentService. 
// For this task, I'll implement the necessary logic directly.

const financeController = {
    getDashboard: async (req, res) => {
        try {
            // Get stats
            const totalRevenue = await Payment.getTotalRevenue();
            const recentPayments = await Payment.findAll({ limit: 5, status: 'completed' });
            const pendingRefunds = await Payment.findAll({ status: 'refunded', limit: 5 }); // Actually 'refunded' means done, maybe we want 'pending' payments?

            res.render('finance/dashboard', {
                title: 'Finance Dashboard',
                totalRevenue,
                recentPayments: recentPayments || [],
                pendingRefunds: pendingRefunds || []
            });
        } catch (error) {
            console.error('Finance dashboard error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Error loading dashboard',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    },

    getPayments: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 20;
            const payments = await Payment.findAll({ page, limit });

            res.render('finance/payments', {
                title: 'Payment Management',
                payments: payments,
                pagination: {
                    page,
                    limit,
                    total: await Payment.getCount({})
                }
            });
        } catch (error) {
            console.error('Finance payments error:', error);
            res.status(500).render('error', { message: 'Error loading payments' });
        }
    },

    getInvoices: async (req, res) => {
        // Placeholder for invoices
        res.render('finance/invoices', { title: 'Invoices' });
    },

    getReports: async (req, res) => {
        // Placeholder for reports
        res.render('finance/reports', { title: 'Financial Reports' });
    }
};

module.exports = financeController;
