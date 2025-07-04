import React, { useState } from 'react'
import {useNavigate} from 'react-router-dom'
const backendURL = process.env.REACT_APP_BACKEND_URL;

const Login = (props) => {
    const [credentials,setCredentials]=useState({email:"",password:""});
    let navigate = useNavigate();

    const handleSubmit=async (e)=>{
        e.preventDefault();
        const response = await fetch(`${backendURL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({email:credentials.email,password:credentials.password})
        });
        const json=await response.json();
        console.log(json)
        if(json.success){
            //save the auth token and redirect
            localStorage.setItem('token',json.authtoken);
            props.showAlert("Logged in succesfully","success");
            navigate('/');
        }
        else{
            props.showAlert("Invalid Details","danger");
        }
    }

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
      }

    return (
        <div className='mt-3'>
            <h2 className='my-3'>Login to continue to iNotebook</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className="form-control" value={credentials.email} onChange={onChange} id="email" name="email" aria-describedby="emailHelp" />
                    <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="password1" className="form-label">Password</label>
                    <input type="password" className="form-control" value={credentials.password} onChange={onChange} id="password1" name="password" />
                </div>

                <button type="submit" className="btn btn-primary" >Submit</button>
            </form>
        </div>
    )
}

export default Login
