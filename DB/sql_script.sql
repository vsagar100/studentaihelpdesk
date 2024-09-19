-- Table to store user information
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role TEXT CHECK(role IN ('student', 'admin', 'staff')) NOT NULL,
    department VARCHAR(100), -- Only for staff/admin
    created_by VARCHAR(100), -- References user_id of the user who created the record
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by VARCHAR(100), -- References user_id of the user who last modified the record
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (modified_by) REFERENCES users(user_id)
);

-- Table to store grievances submitted by students
CREATE TABLE grievances (
    grievance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL, -- Foreign key to users (student role)
    category TEXT NOT NULL, -- Category of the grievance (e.g., academic, administrative, facilities)
    description TEXT NOT NULL, -- Description of the grievance
    status TEXT CHECK(status IN ('submitted', 'in progress', 'resolved', 'closed')) DEFAULT 'submitted', -- Grievance status
    sentiment TEXT, -- Sentiment analysis result
    priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium', -- Priority of the grievance based on sentiment
    created_by VARCHAR(100), -- References user_id of the student who submitted the grievance
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by VARCHAR(100), -- References user_id of the last person to modify the record
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(user_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (modified_by) REFERENCES users(user_id)
);

-- Table to store comments and updates on grievances by staff or admins
CREATE TABLE grievance_updates (
    update_id INTEGER PRIMARY KEY AUTOINCREMENT,
    grievance_id INTEGER NOT NULL, -- Foreign key to grievances
    user_id INTEGER NOT NULL, -- Foreign key to users (staff or admin)
    update_text TEXT NOT NULL, -- Text of the update
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100), -- References user_id of the user who created the update
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by VARCHAR(100), -- References user_id of the user who last modified the update
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grievance_id) REFERENCES grievances(grievance_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (modified_by) REFERENCES users(user_id)
);

-- Table to store notifications (email/SMS) sent to students or admins
CREATE TABLE notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- Foreign key to users (recipient)
    grievance_id INTEGER, -- Foreign key to grievances (optional, if related to a specific grievance)
    notification_text TEXT NOT NULL, -- Text of the notification
    notification_type TEXT CHECK(notification_type IN ('email', 'sms')) NOT NULL, -- Type of notification
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date and time the notification was sent
    created_by VARCHAR(100), -- References user_id of the user who triggered the notification
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by VARCHAR(100), -- References user_id of the user who last modified the notification
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (grievance_id) REFERENCES grievances(grievance_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (modified_by) REFERENCES users(user_id)
);

-- Table to store reports and analytics data (historical, predictive, etc.)
CREATE TABLE reports (
    report_id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_name VARCHAR(100) NOT NULL, -- Name of the report
    report_data TEXT NOT NULL, -- Data or metadata related to the report (e.g., JSON, CSV)
    created_by VARCHAR(100), -- References user_id of the user who generated the report
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by VARCHAR(100), -- References user_id of the user who last modified the report
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (modified_by) REFERENCES users(user_id)
);

