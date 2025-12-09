const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const User = require('../models/User');

const attendanceController = {
    // Teacher: Show attendance page
    showAttendancePage: async (req, res) => {
        try {
            const courseId = req.params.courseId;
            const date = req.query.date || new Date().toISOString().split('T')[0];

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).render('error', {
                    title: 'Error',
                    message: 'Course not found',
                    error: null
                });
            }

            // Verify teacher owns the course
            if (req.user.roleName === 'Teacher' && course.teacher_id !== req.user.id) {
                return res.status(403).render('error', {
                    title: 'Access Denied',
                    message: 'You can only take attendance for your own courses',
                    error: null
                });
            }

            // Get students enrolled in the course (mocking enrollments join for now or using a helper if exists)
            // Ideally Course model should have getEnrolledStudents. Using direct query or implicit knowledge.
            // Since User model doesn't have getEnrolled, we rely on Attendance or specialized query.
            // Let's assume we fetch all students enrolled.
            // TODO: Ensure Course.getEnrolledStudents exists or replicate logic.
            // For now, we'll fetch existing attendance to map statuses.

            // We need a list of students enrolled in this course to show them all.
            // The Course model has `findByStudent` but maybe not `getStudents`.
            // Let's rely on a join in the view or add a method.
            // Adding a quick method here or using raw query.
            const db = require('./config/db');
            const [students] = await db.query(`
                SELECT u.id, u.name, u.email 
                FROM users u 
                JOIN enrollments e ON u.id = e.student_id 
                WHERE e.course_id = ? AND e.status = 'active'
                ORDER BY u.name
            `, [courseId]);

            const attendanceRecords = await Attendance.getByCourseAndDate(courseId, date);
            const attendanceMap = {};
            attendanceRecords.forEach(record => {
                attendanceMap[record.student_id] = record.status;
            });

            res.render('teacher/attendance', {
                title: `Attendance - ${course.title}`,
                course,
                students,
                date,
                attendanceMap,
                user: req.user
            });
        } catch (error) {
            console.error('Show attendance page error:', error);
            res.status(500).render('error', {
                title: 'Server Error',
                message: 'Could not load attendance page',
                error
            });
        }
    },

    // Teacher: Submit attendance
    submitAttendance: async (req, res) => {
        try {
            const courseId = req.params.courseId;
            const { date, attendance } = req.body; // attendance is object { studentId: status }

            if (!attendance || typeof attendance !== 'object') {
                return res.redirect(`/attendance/course/${courseId}?date=${date}`);
            }

            const promises = Object.entries(attendance).map(([studentId, status]) => {
                return Attendance.mark({
                    courseId,
                    studentId,
                    date,
                    status
                });
            });

            await Promise.all(promises);

            req.flash('success_msg', 'Attendance saved successfully');
            res.redirect(`/attendance/course/${courseId}?date=${date}`);
        } catch (error) {
            console.error('Submit attendance error:', error);
            req.flash('error_msg', 'Error saving attendance');
            res.redirect('back');
        }
    },

    // Student: View my attendance
    getMyAttendance: async (req, res) => {
        try {
            const courseId = req.params.courseId; // Optional filter
            const records = await Attendance.getByStudent(req.user.id, courseId);

            res.render('student/attendance', {
                title: 'My Attendance',
                records,
                user: req.user
            });
        } catch (error) {
            console.error('Get my attendance error:', error);
            res.status(500).render('error', {
                title: 'Server Error',
                message: 'Could not load attendance records',
                error
            });
        }
    }
};

module.exports = attendanceController;
