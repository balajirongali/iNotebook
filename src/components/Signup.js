import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = (props) => {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [credentials, setCredentials] = useState({ name: "", email: "", password: "", cpassword: "" });
  const navigate = useNavigate();

  const sendOtp = async () => {
    console.log("Send OTP clicked");
    const { email } = credentials;
    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      const res = await response.json();
      if (res.success) {
        props.showAlert("OTP sent to your email", "success");
        setStep(2);
      } else {
        props.showAlert("Failed to send OTP", "danger");
      }
    } catch (error) {
      props.showAlert("Server error", "danger");
    }
  };

  const verifyOtp = async () => {
    const { email } = credentials;
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, otp })
      });
      const res = await response.json();
      if (res.success) {
        props.showAlert("OTP Verified!", "success");
        setStep(3);
      } else {
        props.showAlert("Invalid OTP", "danger");
      }
    } catch (error) {
      props.showAlert("OTP Verification Failed", "danger");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, cpassword } = credentials;
    if (password !== cpassword) {
      props.showAlert("Passwords do not match", "danger");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/auth/createuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });
      const res = await response.json();
      if (res.success) {
        localStorage.setItem("token", res.authtoken);
        props.showAlert("Account created successfully", "success");
        navigate("/");
      } else {
        props.showAlert("Signup failed", "danger");
      }
    } catch (err) {
      props.showAlert("Server error", "danger");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className='container mt-3'>
      <h2 className='my-2'>Create an account to use iNotebook</h2>

      {step === 1 && (
        <>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" name='name' value={credentials.name} onChange={onChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input type="email" className="form-control" name='email' value={credentials.email} onChange={onChange} />
          </div>
          <button onClick={sendOtp} className="btn btn-primary">Send OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="mb-3">
            <label className="form-label">Enter OTP</label>
            <input type="text" className="form-control" value={otp} onChange={(e) => setOtp(e.target.value)} />
          </div>
          <button onClick={verifyOtp} className="btn btn-primary">Verify OTP</button>
        </>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" name='password' onChange={onChange} minLength={5} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-control" name='cpassword' onChange={onChange} minLength={5} required />
          </div>
          <button type="submit" className="btn btn-success">Register</button>
        </form>
      )}
    </div>
  );
};

export default Signup;
