const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All attendance routes require authentication
router.use(authMiddleware.authenticate);

// Teacher routes (Take attendance)
router.get('/course/:courseId',
    roleMiddleware.restrictTo('Teacher', 'Admin'),
    attendanceController.showAttendancePage
);

router.post('/course/:courseId',
    roleMiddleware.restrictTo('Teacher', 'Admin'),
    attendanceController.submitAttendance
);

// Student routes (View attendance)
router.get('/my-attendance',
    roleMiddleware.restrictTo('Student'),
    attendanceController.getMyAttendance
);

module.exports = router;
