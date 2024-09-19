-- Insert sample users
INSERT INTO users (username, password, email, role) VALUES
('student1', 'password123', 'student1@example.com', 'student'),
('staff1', 'password123', 'staff1@example.com', 'staff'),
('admin1', 'password123', 'admin1@example.com', 'admin');

-- Insert sample grievances
INSERT INTO grievances (student_id, category, description) VALUES
(1, 'Academic', 'Issue with grading in Mathematics course'),
(1, 'Facilities', 'The air conditioning is not working in Room 101');

-- Insert sample grievance updates
INSERT INTO grievance_updates (grievance_id, user_id, update_text) VALUES
(1, 2, 'Reviewed the grading issue, will discuss with the professor.'),
(2, 2, 'Maintenance team has been notified about the air conditioning issue.');

-- Insert sample notifications
INSERT INTO notifications (user_id, grievance_id, notification_text, notification_type) VALUES
(1, 1, 'Your grievance has been updated.', 'email'),
(1, 2, 'Your grievance has been updated.', 'sms');

-- Insert sample reports
INSERT INTO reports (report_name, report_data) VALUES
('Monthly Grievance Report', '{"total_grievances": 20, "resolved": 15, "pending": 5}');
