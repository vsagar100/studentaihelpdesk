import React from 'react';
import './Terms.css'; // Importing CSS for styling

const Terms = () => {
  return (
    <div className="terms-container">
      <h1>Terms and Conditions</h1>
      <p>
        Welcome to our Grievance Redressal System. By using our system, you agree to the following terms and conditions:
      </p>
      <ul>
        <li>
          <strong>Purpose:</strong> This system is intended for educational purposes, allowing students to file grievances and receive assistance.
        </li>
        <li>
          <strong>User Conduct:</strong> Users must use this system responsibly and ethically, refraining from submitting false or misleading information.
        </li>
        <li>
          <strong>Privacy:</strong> We are committed to protecting your privacy. Any personal information provided will be used solely for processing your grievance.
        </li>
        <li>
          <strong>Data Usage:</strong> Your data may be stored and analyzed to improve the efficiency of our grievance redressal process.
        </li>
        <li>
          <strong>Compliance with Indian Laws:</strong> All users must comply with relevant Indian laws, including the Information Technology Act and the Data Protection Act.
        </li>
      </ul>
      <p>
        By using this system, you agree to abide by these terms and conditions. If you do not agree, please refrain from using the system.
      </p>
    </div>
  );
};

export default Terms;
