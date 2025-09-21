import React, { useState } from "react";
import './Authentication.css'
import logo from '../images/wellnessweb_logo.png';
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { authAPI } from "../services/authAPI";

// Keep your existing translations object exactly as is...
const translations = {
  en: {
    signIn: "Sign In",
    createAccount: "Create Account",
    back: "Back",
    migrant: "Migrant",
    doctor: "Doctor",
    healthOfficial: "Health Official",
    abhaId: "ABHA ID",
    healthProfessionalId: "Health Professional ID",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    signUp: "Sign Up",
    forgotPassword: "Forgot your password?",
    dontHaveHealthId: "Don't have Health Professional ID?",
    dontHaveAbhaId: "Don't have an ABHA ID?",
    createOne: "Create One",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    verifyOtp: "Verify OTP",
    enterOtp: "Enter the OTP sent to your email/phone",
    backToLogin: "Back to Login",
    selectRole: "Please select a role first",
    passwordsDontMatch: "Passwords do not match",
    passwordLength: "Password must be at least 6 characters",
    registrationSuccess: "Registration successful! You can now sign in.",
    invalidRole: "Invalid role selected",
    invalidCredentials: "Invalid credentials. Please Check.",
    loginSuccess: "Login successful! Redirecting...",
    validAbhaId: "Please enter a valid 14-digit ABHA ID",
    validHealthId: "Please enter a valid 8-character Health Professional ID",
    language: "Language",
    english: "English",
    malayalam: "മലയാളം",
    tamil: "தமിழ்",
    hindi: "हिंदी"
  }
  // Add your other language translations here if needed
};

// Safe translation function
const getTranslation = (language, key) => {
  // Fallback chain: requested language -> English -> key itself
  return translations[language]?.[key] || translations['en']?.[key] || key;
};

// Language Selector Component (with error handling)
function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  
  const languageLabels = {
    en: "English",
    hi: "हिंदी", 
    ta: "தமிழ்",
    ml: "മലയാളം"
  };
  
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      <select 
        value={language || 'en'} // Fallback to 'en'
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: '5px',
          border: '1px solid #ddd',
          backgroundColor: 'white',
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        <option value="en">{languageLabels.en}</option>
        <option value="hi">{languageLabels.hi}</option>
        <option value="ta">{languageLabels.ta}</option>
        <option value="ml">{languageLabels.ml}</option>
      </select>
    </div>
  );
}

function SocialButton({ children, onClick, isSelected }) {
  return (
    <button 
      className={`social-btn ${isSelected ? 'selected' : ''}`}
      onClick={onClick} 
      type="button"
    >
      {children}
    </button>
  );
}

function OTPVerification({ onBack, email, role, onSuccess }) {
  const { language } = useLanguage();
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // ✅ Changed to 6 digits
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Safe translation function
  const t = (key) => getTranslation(language, key);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) { // ✅ Changed from < 3 to < 5
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle backspace to go to previous field
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // FIXED: Complete handleSubmit function
  const handleSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      
      // Try email verification with backend
      if (role === 'doctor') {
        response = await authAPI.doctorEmailVerify(email, otpCode);
      } else if (role === 'health') {
        response = await authAPI.officialEmailVerify(email, otpCode);
      }

      if (response && response.success) {
        // Backend verification successful - store real token
        console.log('✅ Backend OTP verification successful');
        console.log('🔑 Storing backend token:', response.token);
        
        sessionStorage.setItem('authToken', response.token);
        sessionStorage.setItem('authUser', JSON.stringify({
          ...response.user,
          role: response.role || role.toUpperCase()
        }));
        
        onSuccess(response);
      } else {
        // If backend verification fails, check for demo OTP
        if (otpCode === '123456') {
          // FIXED: Create proper demo tokens for each role
          let demoToken;
          let demoUsername;
          
          if (role === 'health') {
            demoToken = 'demo-token-OFF001'; // FIXED: Specific token for health officers
            demoUsername = 'OFF001';
          } else if (role === 'doctor') {
            demoToken = 'demo-token-DOC001'; // FIXED: Specific token for doctors
            demoUsername = 'DOC001';
          } else {
            demoToken = 'demo_token_' + Date.now();
            demoUsername = email.split('@')[0] + '_' + role;
          }
          
          const newUserData = {
            name: email.split('@')[0],
            mobile: email,
            role: role.toUpperCase(),
            username: demoUsername
          };
          
          console.log('🎯 Setting demo token for', role + ':', demoToken); // DEBUG LOG
          console.log('👤 Demo user data:', newUserData); // DEBUG LOG
          
          sessionStorage.setItem('authToken', demoToken);
          sessionStorage.setItem('authUser', JSON.stringify(newUserData));
          
          onSuccess({ 
            success: true, 
            user: newUserData, 
            role: role.toUpperCase(),
            isNewUser: true 
          });
        } else {
          setError(response?.error || 'Invalid OTP. Use 123456 for demo testing.');
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      
      // Fallback to demo OTP for testing even if API fails
      if (otpCode === '123456') {
        // FIXED: Same demo token logic for catch block
        let demoToken;
        let demoUsername;
        
        if (role === 'health') {
          demoToken = 'demo-token-OFF001';
          demoUsername = 'OFF001';
        } else if (role === 'doctor') {
          demoToken = 'demo-token-DOC001';
          demoUsername = 'DOC001';
        } else {
          demoToken = 'demo_token_' + Date.now();
          demoUsername = email.split('@')[0] + '_' + role;
        }
        
        const newUserData = {
          name: email.split('@')[0],
          mobile: email,
          role: role.toUpperCase(),
          username: demoUsername
        };
        
        console.log('🎯 Fallback demo token for', role + ':', demoToken); // DEBUG LOG
        
        sessionStorage.setItem('authToken', demoToken);
        sessionStorage.setItem('authUser', JSON.stringify(newUserData));
        
        onSuccess({ 
          success: true, 
          user: newUserData, 
          role: role.toUpperCase(),
          isNewUser: true 
        });
      } else {
        setError('Verification failed. Use 123456 for demo testing.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form">
        <h2>{t('verifyOtp')}</h2>
        <p className="muted">{t('enterOtp')}</p>
        <p className="muted">Sent to: <strong>{email}</strong></p>
        
        {error && (
          <div style={{
            padding: '10px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '5px',
            color: '#721c24',
            marginBottom: '15px'
          }}>
            ❌ {error}
          </div>
        )}
        
        <div className="otp-container" style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          {[0,1,2,3,4,5].map((index) => ( // ✅ Changed from [0,1,2,3] to [0,1,2,3,4,5]
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              className="otp-input"
              value={otp[index]}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              autoFocus={index === 0}
              disabled={loading}
              style={{
                width: '45px',
                height: '45px',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: '600',
                border: '2px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: loading ? '#f3f4f6' : 'white',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          ))}
        </div>
        
        <button 
          type="button" 
          onClick={handleSubmit} 
          className="btn primary"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '10px'
          }}
        >
          {loading ? 'Verifying...' : t('verifyOtp')}
        </button>
        
        <button 
          type="button" 
          className="btn ghost" 
          onClick={onBack} 
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px'
          }}
        >
          {t('backToLogin')}
        </button>
        
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '6px',
          padding: '12px',
          marginTop: '15px',
          fontSize: '0.875rem',
          color: '#92400e',
          textAlign: 'center'
        }}>
          💡 <strong>Demo OTP:</strong> 123456<br />
          <small>Check your email for the actual OTP, or use 123456 for testing</small>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ setIsSignUpActive }) {
  const { language } = useLanguage();
  const [selectedRole, setSelectedRole] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    emailOrPhone: '',
    password: '',
    confirmPassword: ''
  });
  
  const navigate = useNavigate();

  // Safe translation function
  const t = (key) => getTranslation(language, key);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError('');
    setSuccess('');
    setFormData({
      id: '',
      name: '',
      emailOrPhone: '',
      password: '',
      confirmPassword: ''
    });
    if (role === 'migrant') {
      setIsSignUp(false);
    }
  };

  // FIXED: handleOTPSuccess with debug logging
  const handleOTPSuccess = (response) => {
    if (response.isNewUser) {
      setSuccess('🎉 Account created successfully! Redirecting to dashboard...');
    } else {
      setSuccess(t('loginSuccess'));
    }
    
    // FIXED: Debug logging to check stored token
    console.log('🔑 Login Success - Stored Token:', sessionStorage.getItem('authToken'));
    console.log('👤 Login Success - Stored User:', sessionStorage.getItem('authUser'));
    
    setTimeout(() => {
      switch (selectedRole) {
        case 'doctor':
          navigate('/doctor');
          break;
        case 'health':
          navigate('/health');
          break;
        default:
          setError('Invalid role');
      }
    }, 1500);
  };

  if (showOTP) {
    return (
      <OTPVerification 
        onBack={() => setShowOTP(false)} 
        email={otpEmail}
        role={selectedRole}
        onSuccess={handleOTPSuccess}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedRole) {
      setError(t('selectRole'));
      return;
    }

    if (isSignUp) {
      if (selectedRole !== 'migrant') {
        if (formData.password !== formData.confirmPassword) {
          setError(t('passwordsDontMatch'));
          return;
        }
        if (formData.password.length < 6) {
          setError(t('passwordLength'));
          return;
        }
      }
      setSuccess(t('registrationSuccess'));
      setIsSignUp(false);
      setFormData({
        id: '',
        name: '',
        emailOrPhone: '',
        password: '',
        confirmPassword: ''
      });
    } else {
      setLoading(true);

      try {
        if (selectedRole === 'migrant') {
          const response = await authAPI.workerLogin(formData.id, formData.password);
          
          if (response && response.success) {
            sessionStorage.setItem('authToken', response.token);
            sessionStorage.setItem('authUser', JSON.stringify({
              ...response.user,
              role: response.role
            }));
            
            setSuccess(t('loginSuccess'));
            setTimeout(() => navigate('/migrant'), 1500);
          } else {
            setError(response?.error || t('invalidCredentials'));
          }
        } 
        else if (selectedRole === 'doctor' || selectedRole === 'health') {
          // Validate email field is filled
          if (!formData.emailOrPhone || !formData.emailOrPhone.includes('@')) {
            setError('Please enter a valid email address');
            return;
          }
          
          // Send OTP to email - always proceed to OTP screen
          try {
            const emailService = selectedRole === 'doctor' 
              ? authAPI.doctorEmailInput 
              : authAPI.officialEmailInput;
            
            const response = await emailService(formData.emailOrPhone);
            
            // Always proceed to OTP screen regardless of response
            setOtpEmail(formData.emailOrPhone);
            setShowOTP(true);
            
            if (response && response.success) {
              setSuccess('✅ OTP sent to your email! Check your inbox.');
            } else {
              setSuccess('📧 OTP screen loaded. Use 123456 for demo or check your email.');
            }
          } catch (error) {
            // Even if API fails, proceed to OTP for demo purposes
            setOtpEmail(formData.emailOrPhone);
            setShowOTP(true);
            setSuccess('📧 OTP screen loaded. Use 123456 for demo testing.');
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        
        // For doctors/health officers, still proceed to OTP screen for demo
        if (selectedRole === 'doctor' || selectedRole === 'health') {
          setOtpEmail(formData.emailOrPhone);
          setShowOTP(true);
          setSuccess('📧 OTP screen loaded. Use 123456 for demo testing.');
        } else {
          setError('Login failed. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="form-container sign-in-container">
      <div className="form">
        <br />
        <div style={{ display: 'flex', justifyContent: 'left', alignItems: 'center', gap: '1rem' }}>
          {isSignUp && selectedRole !== 'migrant' && (
            <button 
              type="button" 
              className="back-btn"
              onClick={() => setIsSignUp(false)}
              disabled={loading}
            >
              {t('back')}
            </button>
          )}
          <h2>{isSignUp ? t('createAccount') : t('signIn')}</h2>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            padding: '10px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '5px',
            color: '#721c24',
            marginBottom: '15px'
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '10px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '5px',
            color: '#155724',
            marginBottom: '15px'
          }}>
            ✅ {success}
          </div>
        )}
        
        <div className="social-row">
          <SocialButton 
            onClick={() => handleRoleChange('migrant')}
            isSelected={selectedRole === 'migrant'}
          >
            {t('migrant')}
          </SocialButton>
          <SocialButton 
            onClick={() => handleRoleChange('doctor')}
            isSelected={selectedRole === 'doctor'}
          >
            {t('doctor')}
          </SocialButton>
          <SocialButton 
            onClick={() => handleRoleChange('health')}
            isSelected={selectedRole === 'health'}
          >
            {t('healthOfficial')}
          </SocialButton>
        </div>

        {selectedRole && (
          <div className="input-group">
            <input 
              type="text" 
              required={selectedRole === 'migrant'}
              value={formData.id}
              onChange={(e) => setFormData({...formData, id: e.target.value})}
              placeholder={
                selectedRole === 'migrant' 
                  ? t('abhaId') 
                  : 'Health Professional ID (optional)'
              } 
              disabled={loading}
            />
          </div>
        )}

        {isSignUp && selectedRole !== 'migrant' && (
          <input 
            type="text" 
            placeholder={t('fullName')} 
            required 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            disabled={loading}
          />
        )}

        <div className="input-group">
          {selectedRole === 'migrant' ? (
            <input 
              type="text" 
              required 
              placeholder="OTP (use 123456)" 
              value={formData.emailOrPhone}
              onChange={(e) => setFormData({...formData, emailOrPhone: e.target.value})}
              disabled={loading}
            />
          ) : (
            <input 
              type="email" 
              required 
              placeholder={t('email') + ' (required for OTP)'}
              value={formData.emailOrPhone}
              onChange={(e) => setFormData({...formData, emailOrPhone: e.target.value})}
              disabled={loading}
              style={{
                borderColor: selectedRole !== 'migrant' ? '#3b82f6' : '#d1d5db',
                borderWidth: selectedRole !== 'migrant' ? '2px' : '1px'
              }}
            />
          )}
        </div>
        
        <input 
          type="password" 
          placeholder={
            selectedRole === 'migrant' 
              ? "Password (use 123456)" 
              : selectedRole === 'doctor' || selectedRole === 'health'
                ? "Password (optional - email OTP is primary method)"
                : t('password')
          }
          required={selectedRole === 'migrant'}
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          disabled={loading}
          style={{
            opacity: (selectedRole === 'doctor' || selectedRole === 'health') ? '0.6' : '1'
          }}
        />
        
        {isSignUp && selectedRole !== 'migrant' && (
          <input 
            type="password" 
            placeholder={t('confirmPassword')} 
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            disabled={loading}
          />
        )}

        <div style={{ display: 'flex', justifyContent: "left", alignItems: 'center', gap: '1.5rem' }}>
          <button 
            type="button" 
            onClick={handleSubmit} 
            className="btn primary"
            disabled={loading}
          >
            {loading 
              ? 'Loading...' 
              : selectedRole === 'migrant'
                ? (isSignUp ? t('signUp') : t('signIn'))
                : (isSignUp ? t('signUp') : 'Send OTP')
            }
          </button>
        </div>

        {selectedRole === 'doctor' && !isSignUp && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            padding: '12px',
            marginTop: '1rem',
            fontSize: '0.875rem',
            color: '#1e40af'
          }}>
            <p style={{ margin: 0, fontWeight: '500' }}>📧 Email OTP Login</p>
            <p style={{ margin: '4px 0 0 0' }}>
              Enter your email address and click "Send OTP". You'll receive a verification code to complete login.
              <br /><strong>Demo OTP:</strong> 123456
            </p>
          </div>
        )}

        {selectedRole === 'health' && !isSignUp && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            padding: '12px',
            marginTop: '1rem',
            fontSize: '0.875rem',
            color: '#1e40af'
          }}>
            <p style={{ margin: 0, fontWeight: '500' }}>📧 Email OTP Login</p>
            <p style={{ margin: '4px 0 0 0' }}>
              Enter your email address and click "Send OTP". You'll receive a verification code to complete login.
              <br /><strong>Demo OTP:</strong> 123456
            </p>
          </div>
        )}

        {selectedRole === 'migrant' ? (
          <p className="switch-text">
            {t('dontHaveAbhaId')} <a className="link-text" href="https://abha.abdm.gov.in/abha/v3/register" target="_blank" rel="noopener noreferrer">{t('createOne')}</a>
          </p>
        ) : (
          <p className="switch-text">
            {isSignUp ? 
              t('alreadyHaveAccount') + " " : 
              t('dontHaveAccount') + " "
            }
            <span className="link-text" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? t('signIn') : t('signUp')}
            </span>
          </p>
        )}
      </div>
      <img src={logo} height={400} alt="WellnessWeb Logo" />
    </div>
  );
}

function BubbleEffect() {
  return (
    <div className="bubble-container">
      {/* Bubbles will be added via CSS animations */}
    </div>
  );
}

export default function Authentication() {
  return (
    <div className="page-bg">
      <LanguageSelector />
      <BubbleEffect />
      <div className="auth-wrapper">
        <div className="container">
          <div className="form-wrap">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
