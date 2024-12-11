import React, { useState, useContext } from 'react';
import { GlobalContext } from '../GlobalState';
import '../styles/SignUp.css'; 
import SignupImage from '../assets/images/bg-02.png';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    role: '',
    confirmPassword: '',
    collegeId: null,
    collegeName: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const data = new FormData();
        data.append('fullName', formData.fullName);
        data.append('password_hint', formData.email);
        data.append('mobile', formData.mobile);
        data.append('password', formData.password);
        data.append('role', 'student');// Hardcoded role as student
        data.append('collegeId', formData.collegeId);
        data.append('collegeName', formData.collegeName);  // For validating the college name

        const response = await fetch(`${BACKEND_API_URL}/api/auth/signup`, {
          method: 'POST',
          body: data
        });

        const result = await response.json();
        if (result.status === 'success') {
          alert('User registered successfully!');
          navigate('/signin');  // Redirect to sign-in page after successful registration
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.mobile.trim()) errors.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.mobile)) errors.mobile = 'Mobile number must be 10 digits';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirm Password is required';
    else if (formData.confirmPassword !== formData.password) errors.confirmPassword = 'Passwords do not match';
    if (!formData.collegeId) errors.collegeId = 'College ID is required';
    if (!formData.collegeName) errors.collegeName = 'College Name is required';
    if (!formData.termsAccepted) errors.termsAccepted = 'You must accept the terms and conditions';

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, collegeId: e.target.files[0] });
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <img src={SignupImage} alt="Signup Background" className="signup-image" />
      </div>
      <div className="signup-right">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Sign Up</h2>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <p className="error">{errors.fullName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile</label>
            <input
              type="text"
              id="mobile"
              name="mobile"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={handleChange}
            />
            {errors.mobile && <p className="error">{errors.mobile}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="collegeId">Upload your College ID</label>
            <input
              type="file"
              id="collegeId"
              name="collegeId"
              onChange={handleFileChange}
            />
            {errors.collegeId && <p className="error">{errors.collegeId}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="collegeName">College Name</label>
            <input
              type="text"
              id="collegeName"
              name="collegeName"
              placeholder="Enter your College Name"
              value={formData.collegeName}
              onChange={handleChange}
            />
            {errors.collegeName && <p className="error">{errors.collegeName}</p>}
          </div>

          <div className="form-group checkbox-container">
            <input
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
            />
            <label htmlFor="termsAccepted">
              I accept the <a href="#!" onClick={(e) => { e.preventDefault(); }}>terms and conditions</a>
            </label>
            {errors.termsAccepted && <p className="error">{errors.termsAccepted}</p>}
          </div>

          <div className="form-group">
            <button type="submit" className="signup-btn" disabled={!formData.termsAccepted}>Sign Up</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SignUp;
