import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Import the useUser hook
import './Login.css';
import Lottie from 'react-lottie';
import logoAnimation from '../assets/homepage-logo.json';
import sideAnimation from '../assets/login-signup.json';

const Login = () => {
  const { login } = useUser(); // Get the login function from context
  const location = useLocation();
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [stage, setStage] = useState(1); // Tracks the current stage of forgot password (1: email, 2: phone, 3: new password)
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const resetFormFields = () => {
    setEmail('');
    setPassword('');
  };

  const resetForgotPassword = () => {
    setEmail('');
    setPhone('');
    setNewPassword('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setMessage('');
    setStage(1);
  };

  const clearErrors = () => {
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setMessage('');
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('form') === 'signup') {
      setIsLoginForm(false);
    } else {
      setIsLoginForm(true);
    }
    clearErrors();
  }, [location]);

  const handleLearnMoreClick = () => {
    navigate('/', { state: { fromLogin: true } });
  };

  const handleEmailCheck = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/check-email', { email });
      if (response.data.exists) {
        setStage(2);
      } else {
        setEmailError("Oops! Seems like you got the wrong mail id.");
      }
    } catch (error) {
      console.error('Error:', error);
      setEmailError("Unexpected error occurred, please try again.");
    }
  };

  const handlePhoneCheck = async () => {
    if (phone.length !== 10) {
      setPhoneError("Last time I checked a Number should be 10 digits");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/check-phone', { email, phone });
      if (response.data.matches) {
        setStage(3);
      } else {
        setPhoneError("I don't take spam Numbers.");
      }
    } catch (error) {
      console.error('Error:', error);
      setPhoneError("I don't take spam Numbers.");
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/update-password', { email, newPassword });
      if (response.data.updated) {
        setMessage("Password updated successfully!");
        setIsForgotPassword(false);
        setIsLoginForm(true);
        setEmail('');
        setNewPassword('');
        setPhone('');
      } else {
        setPasswordError("Unexpected error occurred, please try again.");
      }
    } catch (error) {
      console.error('Error:', error);
      setPasswordError("Unexpected error occurred, please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setMessage('');

    if (isLoginForm) {
      if (!email) {
        setEmailError("Seems like you missed your Mail");
        return;
      }
      if (!password) {
        setPasswordError("Invisible Password is not my thing");
        return;
      }

      try {
        const response = await axios.post('http://localhost:5000/api/login', {
          email,
          password,
        });

        if (response.data.message === 'User exists!') {
          const userData = {
            name: response.data.name,
            email: response.data.email,
            isAdmin: response.data.is_admin,
          };
          login(userData); // Store user data in context and localStorage
          setMessage('Login successful!');
          if (response.data.is_admin) {
            navigate('/admin-dashboard'); // Redirect to admin dashboard
          } else {
            navigate('/dashboard'); // Redirect to regular dashboard
          } // Redirect to dashboard
        }
      } catch (error) 
      {
        console.error('Error response:', error.response);
        if (error.response && error.response.data) 
        {
          const errorMsg = error.response.data.error;
          if (errorMsg.includes("Invalid credentials")) 
          {
            setMessage("Invalid Email or Password");
          } else if (errorMsg.includes("That isn't your password")) 
            {
            setPasswordError("Shh! That isn't your password, try something else.");
          } else 
          {
            setMessage("Unexpected error occurred, Please try again later.");
          }
        } 
        else 
        {
          setMessage("Unexpected error occurred, Please try again later.");
        }
      }
    } else {
      if (!name) {
        setNameError("FBI! The Govt. doesnt like missing Name");
        return;
      }
      if (!email) {
        setEmailError("Seems like you missed your Mail");
        return;
      }
      if (!phone) {
        setPhoneError("You seem interested, how do I text without a Number");
        return;
      }
      if (!password) {
        setPasswordError("Invisible Password is not my thing");
        return;
      }

      try {
        const response = await axios.post('http://localhost:5000/api/signup', {
          name,
          email,
          phone,
          password,
        });
        if (response.data.message === "User created successfully!") {
          setName('');
          setEmail('');
          setPhone('');
          setPassword('');
          navigate('?form=login');
          setMessage("Sign up successful! You can now log in.");
        } else {
          setMessage(response.data.error || "Unexpected error occurred, please try again.");
        }
      } catch (error) {
        if (error.response) {
          const errorMsg = error.response.data.error;
          if (errorMsg.includes("This Mail is already influenced.")) {
            setEmailError("This Mail is already influenced.");
          } else if (errorMsg.includes("This phone number is already in use.")) {
            setPhoneError("I already got you in my contacts.");
          } 
          else if (error.response.data.error.includes("Phone number")) {
            setPhoneError("Last time I checked a Number should be 10 digits");
        }
          else {
            setMessage("Unexpected error occurred, please try again.");
          }
        } else {
          setMessage("Unexpected error occurred, please try again.");
        }
      }
    }
  };

  const logoOptions = {
    loop: true,
    autoplay: true,
    animationData: logoAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  const sideAnimationOptions = {
    loop: true,
    autoplay: true,
    animationData: sideAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div className="login-container">
      <nav className="navbar">
        <div className="logo">
          <Link to="/">
            <Lottie options={logoOptions} height="4.5rem" width="9.375rem" />
          </Link>
        </div>
        <div className="nav-buttons">
          <button onClick={handleLearnMoreClick} className="nav-button learn-more-button">Learn More</button>
        </div>
      </nav>

      <div className="main-content">
        <div className="left-animation">
          <Lottie options={sideAnimationOptions} height="35rem" width="28rem" />
          <p className="tagline">{isLoginForm ? 'Dime Smart Today' : 'Find your Cash Compass'}</p>
        </div>

        <div className="login-form">
          {isForgotPassword ? (
            <div className='forgot-form'>
              <h2>Forgot Password</h2>
              {stage === 1 && (
                <>
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                  }}
                    title="If you are wondering, your Email goes here"
                  />
                  {emailError && <p className="error-message">{emailError}</p>}
                  <button type="button" onClick={handleEmailCheck}>Next</button>
                </>
              )}
              {stage === 2 && (
                <>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError('');
                  }}
                    title="You seem to be nice, can I get your Number?"
                  />
                  {phoneError && <p className="error-message">{phoneError}</p>}
                  <button type="button" onClick={handlePhoneCheck}>Next</button>
                </>
              )}
              {stage === 3 && (
                <>
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    title="Get all sneaky, cause we got to be secure"
                  />
                  {passwordError && <p className="error-message">{passwordError}</p>}
                  <button type="button" onClick={handlePasswordUpdate}>Update Password</button>
                </>
              )}
              <div className="signup-prompt">
                <span>Already influenced? </span>
                <Link to="?form=login" className="toggle-link" onClick={() => { setIsForgotPassword(false); setIsLoginForm(true); resetFormFields(); }}>Login</Link>
                <br />
                <span>Still not influenced? </span>
                <Link to="?form=signup" className="toggle-link" onClick={() => { setIsForgotPassword(false); setIsLoginForm(false); resetFormFields(); }}>Sign Up</Link>
            </div>
        </div>
          ) : (
            <>
                    <h2>{isLoginForm ? 'Login' : 'Sign Up'}</h2>
                    <form onSubmit={handleSubmit}>
                        {!isLoginForm && (
                            <div>
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setNameError('');
                                    }}
                                    title="What do I call you?"
                                />
                                {nameError && <p className="error-message">{nameError}</p>}
                            </div>
                        )}
                        <div>
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                title="If you are wondering, your Email goes here"
                            />
                            {emailError && <p className="error-message">{emailError}</p>}
                        </div>
                        {!isLoginForm && (
                            <div>
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e.target.value);
                                        setPhoneError('');
                                    }}
                                    title="You seem to be nice, can I get your Number?"
                                />
                                {phoneError && <p className="error-message">{phoneError}</p>}
                            </div>
                        )}
                        <div>
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                title="Get all sneaky, cause we got to be secure"
                            />
                            {passwordError && <p className="error-message">{passwordError}</p>}
                        </div>
                        <button type="submit">{isLoginForm ? 'Login' : 'Sign Up'}</button>
                    </form>
                    {message && <p>{message}</p>}

                    <div className="signup-prompt">
                        {isLoginForm ? (
                            <>
                                <span>Still not influenced? </span>
                                <Link to="?form=signup" className="toggle-link" onClick={(e) => {setIsLoginForm(false); resetFormFields();}}>Sign up</Link><br></br>
                                <span>Lost your Influence? </span>
                                <Link to="?form=forgot-password" className="toggle-link" onClick={() => { setIsForgotPassword(true); resetForgotPassword(); }}>Fix Password</Link>
                            </>
                        ) : (
                            <>
                                <span>Already happily influenced? </span>
                                <Link to="?form=login" className="toggle-link" onClick={(e) => {setIsLoginForm(true); resetFormFields();}}>Log in</Link>
                            </>
                        )}
                    </div>
                    </>
    )}
                </div>
            </div>

            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} FinFluence. All Rights Reserved. | Trademarked by FinFluence. | This website is in beta.</p>
            </footer>
        </div>
  );
};

export default Login;