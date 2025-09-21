import React, { useState, useEffect } from "react";
import {
  User,
  FileText,
  Download,
  Users,
  Bell,
  QrCode,
  Copy,
  Check,
  Edit3,
  Save,
  X,
  LogOut,
  RefreshCw
} from "lucide-react";

// Import language context
import { useLanguage } from "../context/LanguageContext";

// API service for worker endpoints
const workerAPI = {
  getProfile: async () => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/workers/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  getRecords: async () => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/workers/me/records', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  generateQR: async () => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/workers/me/qr', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  getNotifications: async () => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/workers/me/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  logout: async () => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/workers/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};

const translations = {
  en: {
    title: "Migrant Worker Dashboard",
    family: "Add Family Members",
    profile: "My Profile",
    records: "My Health Records",
    download: "Download Records",
    notifications: "Notifications",
    qrCode: "My QR Code",
    logout: "Logout",
    loading: "Loading...",
    error: "Error loading data",
    retry: "Retry",
    content: {
      welcome: "Welcome to your dashboard! Select an option from the navigation above.",
      family: "Add or manage your family members here.",
      records: "Access your health records here.",
      download: "Download your health records here.",
      notifications: "Check your notifications here.",
      qrCode: "Your unique QR code for health record access. Healthcare providers can scan this to view your records instantly."
    },
    qrTitle: "Your Health Record QR Code",
    qrSubtitle: "Show this QR code to healthcare providers for instant access to your medical records",
    copyId: "Copy ABHA ID",
    copied: "Copied!",
    scanInstructions: "Healthcare providers can scan this QR code to access your health records securely.",
    generateNewQR: "Generate New QR Code",
    qrExpiry: "Expires at:",
    // Profile specific translations
    personalDetails: "Personal Details",
    addressDetails: "Address Details",
    stayingDetails: "Staying in Kerala Details",
    otherDetails: "Other Details",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    name: "Name",
    age: "Age",
    gender: "Gender",
    occupation: "Occupation",
    motherTongue: "Mother Tongue",
    nativeState: "Native State",
    nativeDistrict: "Native District", 
    nativeAddress: "Native Address",
    district: "District",
    taluk: "Taluk",
    village: "Village",
    currentAddress: "Current Address",
    aadhaarNumber: "Aadhaar Number",
    employmentType: "Employment Type",
    aloOffice: "ALO Office",
    remarks: "Remarks",
    phone: "Phone Number",
    abhaNumber: "ABHA Number",
    region: "Region",
    // Records translations
    bloodPressure: "Blood Pressure",
    weight: "Weight",
    temperature: "Temperature",
    lastCheckup: "Last Checkup",
    status: "Status",
    noRecords: "No health records available",
    // Notifications translations
    noNotifications: "No notifications available",
    notificationTitle: "Title",
    notificationMessage: "Message",
    notificationType: "Type"
  },
  hi: {
    title: "प्रवासी श्रमिक डैशबोर्ड",
    family: "परिवार के सदस्य जोड़ें",
    profile: "मेरी प्रोफाइल",
    records: "मेरे स्वास्थ्य रिकॉर्ड",
    download: "रिकॉर्ड डाउनलोड करें",
    notifications: "सूचनाएं",
    qrCode: "मेरा QR कोड",
    logout: "लॉग आउट",
    loading: "लोड हो रहा है...",
    error: "डेटा लोड करने में त्रुटि",
    retry: "पुनः प्रयास करें",
    personalDetails: "व्यक्तिगत विवरण",
    addressDetails: "पता विवरण", 
    stayingDetails: "केरल में रहने का विवरण",
    otherDetails: "अन्य विवरण",
    edit: "संपादित करें",
    save: "सहेजें",
    cancel: "रद्द करें",
    name: "नाम",
    age: "आयु",
    gender: "लिंग",
    occupation: "व्यवसाय",
    phone: "फोन नंबर"
  },
  ta: {
    title: "புலம்பெயர் தொழிலாளர் டாஷ்போர்டு",
    family: "குடும்ப உறுப்பினர்களைச் சேர்க்க",
    profile: "என் சுயவிவரம்",
    records: "என் சுகாதார பதிவுகள்",
    download: "பதிவுகளை பதிவிறக்கு",
    notifications: "அறிவிப்புகள்",
    qrCode: "என் QR குறியீடு",
    logout: "வெளியேறு",
    loading: "ஏற்றுகிறது...",
    error: "தகவல் ஏற்றுவதில் பிழை",
    retry: "மீண்டும் முயற்சிக்கவும்",
    personalDetails: "தனிப்பட்ட விவரங்கள்",
    edit: "திருத்து",
    save: "சேமி",
    cancel: "ரத்து",
    name: "பெயர்",
    age: "வயது", 
    phone: "தொலைபேசி எண்"
  }
};

export default function MigrantWorkerHome() {
  const { language, setLanguage } = useLanguage();

  // State management
  const [activeTab, setActiveTab] = useState("welcome");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState({
    profile: false,
    records: false,
    notifications: false,
    qr: false
  });
  const [error, setError] = useState({
    profile: null,
    records: null,
    notifications: null,
    qr: null
  });

  // Data state
  const [authUser, setAuthUser] = useState(null);
  const [records, setRecords] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [editedProfile, setEditedProfile] = useState({});

  // Initialize data from sessionStorage and load profile
  // Initialize data from sessionStorage (only runs once)
useEffect(() => {
  const storedUser = sessionStorage.getItem('authUser');
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      setAuthUser(parsedUser);
      setEditedProfile(parsedUser);
    } catch (error) {
      console.error('Error parsing stored user:', error);
      handleLogout();
    }
  } else {
    window.location.href = '/login';
  }
}, []); // Empty dependency array - runs only once

// Load data based on active tab (but prevent profile API call)
useEffect(() => {
  if (!authUser) return; // Don't run if no user data

  switch (activeTab) {
    case 'records':
      loadRecords();
      break;
    case 'notifications':
      loadNotifications();
      break;
    case 'qrcode':
      loadQRCode();
      break;
    // Remove 'profile' case to prevent API call and loading fluctuation
    default:
      break;
  }
}, [activeTab]); // Only depend on activeTab, not authUser

  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key, value) => {
    setError(prev => ({ ...prev, [key]: value }));
  };

  const loadProfile = async () => {
    setLoadingState('profile', true);
    setErrorState('profile', null);
    try {
      const response = await workerAPI.getProfile();
      if (response) {
        setAuthUser(response);
        setEditedProfile(response);
        // Update sessionStorage
        sessionStorage.setItem('authUser', JSON.stringify(response));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setErrorState('profile', 'Failed to load profile data');
    } finally {
      setLoadingState('profile', false);
    }
  };

  const loadRecords = async () => {
    setLoadingState('records', true);
    setErrorState('records', null);
    try {
      const response = await workerAPI.getRecords();
      setRecords(response);
    } catch (error) {
      console.error('Error loading records:', error);
      setErrorState('records', 'Failed to load health records');
    } finally {
      setLoadingState('records', false);
    }
  };

  const loadNotifications = async () => {
    setLoadingState('notifications', true);
    setErrorState('notifications', null);
    try {
      const response = await workerAPI.getNotifications();
      setNotifications(response);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setErrorState('notifications', 'Failed to load notifications');
    } finally {
      setLoadingState('notifications', false);
    }
  };

  const loadQRCode = async () => {
    setLoadingState('qr', true);
    setErrorState('qr', null);
    try {
      const response = await workerAPI.generateQR();
      setQrData(response);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setErrorState('qr', 'Failed to generate QR code');
    } finally {
      setLoadingState('qr', false);
    }
  };

  const handleLogout = async () => {
    try {
      await workerAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...authUser });
  };

  const handleSave = () => {
    setAuthUser({ ...editedProfile });
    setIsEditing(false);
    // Update sessionStorage
    sessionStorage.setItem('authUser', JSON.stringify(editedProfile));
  };

  const handleCancel = () => {
    setEditedProfile({ ...authUser });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;

  const ProfileSection = ({ title, children }) => (
    <div style={{
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      padding: "1.5rem",
      marginBottom: "1.5rem",
      border: "1px solid #e2e8f0"
    }}>
      <div style={{
        backgroundColor: "#a7f3d0",
        color: "#064e3b",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        marginBottom: "1rem",
        fontWeight: "600",
        fontSize: "1.1rem"
      }}>
        {title}
      </div>
      {children}
    </div>
  );

  const ProfileField = ({ label, field, type = "text" }) => (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{
        display: "block",
        fontSize: "0.875rem",
        fontWeight: "500",
        color: "#374151",
        marginBottom: "0.25rem"
      }}>
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          value={editedProfile[field] || ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "0.875rem"
          }}
        />
      ) : (
        <div style={{
          padding: "0.5rem",
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          fontSize: "0.875rem",
          color: "#374151"
        }}>
          {authUser?.[field] || "Not specified"}
        </div>
      )}
    </div>
  );

  const LoadingSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <RefreshCw className="animate-spin" size={24} style={{ color: '#3b82f6' }} />
      <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>{t('loading')}</span>
    </div>
  );

  const ErrorMessage = ({ message, onRetry }) => (
    <div style={{
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '1rem',
      margin: '1rem 0'
    }}>
      <p style={{ color: '#dc2626', margin: '0 0 0.5rem 0' }}>{message}</p>
      <button
        onClick={onRetry}
        style={{
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {t('retry')}
      </button>
    </div>
  );

  const renderProfile = () => {
  // Remove the loading and error checks since we're using sessionStorage data
  // if (loading.profile) return <LoadingSpinner />;
  // if (error.profile) return <ErrorMessage message={error.profile} onRetry={loadProfile} />;

  if (!authUser) {
    return <p style={{ textAlign: 'center', color: '#6b7280' }}>No profile data available</p>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "left" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem"
      }}>
        <h2 style={{ color: "#1f2937", margin: 0 }}>{t('profile')}</h2>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.875rem"
            }}
          >
            <Edit3 size={16} />
            {t('edit')}
          </button>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleSave}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem"
              }}
            >
              <Save size={16} />
              {t('save')}
            </button>
            <button
              onClick={handleCancel}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem"
              }}
            >
              <X size={16} />
              {t('cancel')}
            </button>
          </div>
        )}
      </div>

      <ProfileSection title={t('personalDetails')}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <ProfileField label={t('name')} field="name" />
          <ProfileField label={t('phone')} field="mobile" />
          <ProfileField label={t('abhaNumber')} field="abhaNumber" />
          <ProfileField label={t('region')} field="region" />
        </div>
      </ProfileSection>

      {authUser?.fhirPatientId && (
        <ProfileSection title="Medical Information">
          <ProfileField label="FHIR Patient ID" field="fhirPatientId" />
        </ProfileSection>
      )}
    </div>
  );
};


  const renderRecords = () => {
  if (loading.records) return <LoadingSpinner />;
  if (error.records) return <ErrorMessage message={error.records} onRetry={loadRecords} />;

  if (!records || !records.success) {
    return <p style={{ textAlign: 'center', color: '#6b7280' }}>{t('noRecords')}</p>;
  }

  const { records: healthData } = records;

  // Helper function to safely render values
  const renderValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      if (value.value !== undefined) {
        return `${value.value} ${value.unit || ''}`;
      }
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ');
    }
    return String(value || 'N/A');
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ color: "#1f2937", marginBottom: "1.5rem" }}>{t('records')}</h2>
      
      {healthData?.observations && (
        <div style={{
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          border: "1px solid #e2e8f0"
        }}>
          <h3 style={{ color: "#1f2937", marginBottom: "1rem" }}>Medical Observations</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            {Array.isArray(healthData.observations) 
              ? healthData.observations.map((observation, index) => (
                  <div key={index} style={{
                    backgroundColor: "white",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb"
                  }}>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                      {observation.type || observation.name || `Observation ${index + 1}`}
                    </div>
                    <div style={{ color: "#6b7280", marginBottom: "0.25rem" }}>
                      Value: {renderValue(observation.value || observation)}
                    </div>
                    {observation.date && (
                      <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                        Date: {new Date(observation.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              : Object.entries(healthData.observations).map(([key, value]) => (
                  <div key={key} style={{
                    backgroundColor: "white",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb"
                  }}>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div style={{ color: "#6b7280" }}>
                      {renderValue(value)}
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      )}

      {healthData?.immunizations && (
        <div style={{
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          border: "1px solid #e2e8f0"
        }}>
          <h3 style={{ color: "#1f2937", marginBottom: "1rem" }}>Immunizations</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            {Array.isArray(healthData.immunizations)
              ? healthData.immunizations.map((immunization, index) => (
                  <div key={index} style={{
                    backgroundColor: "white",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb"
                  }}>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                      {immunization.vaccineType || immunization.name || `Vaccine ${index + 1}`}
                    </div>
                    <div style={{ color: "#6b7280", marginBottom: "0.25rem" }}>
                      {immunization.lotNumber && `Lot: ${immunization.lotNumber}`}
                    </div>
                    {immunization.date && (
                      <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                        Date: {new Date(immunization.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              : Object.entries(healthData.immunizations).map(([key, value]) => (
                  <div key={key} style={{
                    backgroundColor: "white",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb"
                  }}>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div style={{ color: "#6b7280" }}>
                      {renderValue(value)}
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      )}

      {(!healthData?.observations && !healthData?.immunizations) && healthData && (
        <div style={{
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid #e2e8f0"
        }}>
          <h3 style={{ color: "#1f2937", marginBottom: "1rem" }}>Health Records</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            {Object.entries(healthData).map(([key, value]) => (
              <div key={key} style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}>
                <div style={{ fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </div>
                <div style={{ color: "#6b7280" }}>
                  {renderValue(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


 const renderNotifications = () => {
  if (loading.notifications) return <LoadingSpinner />;
  if (error.notifications) return <ErrorMessage message={error.notifications} onRetry={loadNotifications} />;

  if (!notifications || !notifications.success) {
    return <p style={{ textAlign: 'center', color: '#6b7280' }}>{t('noNotifications')}</p>;
  }

  const notificationList = notifications.notifications || [];

  if (!Array.isArray(notificationList) || notificationList.length === 0) {
    return <p style={{ textAlign: 'center', color: '#6b7280' }}>{t('noNotifications')}</p>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ color: "#1f2937", marginBottom: "1.5rem" }}>{t('notifications')}</h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {notificationList.map((notification, index) => (
          <div key={notification.id || index} style={{
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "1px solid #e2e8f0",
            borderLeft: "4px solid #3b82f6"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              marginBottom: "0.5rem"
            }}>
              <h3 style={{ color: "#1f2937", margin: 0 }}>
                {notification.title || 'Notification'}
              </h3>
              <span style={{
                backgroundColor: "#dbeafe",
                color: "#1e40af",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.75rem"
              }}>
                {notification.type || 'info'}
              </span>
            </div>
            <p style={{ color: "#6b7280", margin: "0.5rem 0" }}>
              {notification.message || 'No message'}
            </p>
            <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              {notification.createdAt 
                ? new Date(notification.createdAt).toLocaleDateString()
                : 'No date'
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
;


  const renderQRCode = () => {
    if (loading.qr) return <LoadingSpinner />;
    if (error.qr) return <ErrorMessage message={error.qr} onRetry={loadQRCode} />;

    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        maxWidth: "400px",
        margin: "0 auto",
        padding: "2rem",
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        border: "1px solid #e2e8f0"
      }}>
        <h2 style={{ color: "#1f2937", marginBottom: "0.5rem" }}>{t('qrTitle')}</h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem", textAlign: "center" }}>
          {t('qrSubtitle')}
        </p>

        {qrData?.success && qrData.qr?.qrCode && (
          <div style={{
            backgroundColor: "white",
            padding: "1rem",
            borderRadius: "8px",
            border: "2px solid #e2e8f0"
          }}>
            <img
              src={`data:image/png;base64,${qrData.qr.qrCode}`}
              alt="Health Record QR Code"
              style={{ width: '200px', height: '200px', borderRadius: '8px' }}
            />
          </div>
        )}

        {qrData?.qr?.expiresAt && (
          <p style={{ color: "#f59e0b", fontSize: "0.875rem" }}>
            {t('qrExpiry')} {new Date(qrData.qr.expiresAt).toLocaleString()}
          </p>
        )}

        <button
          onClick={loadQRCode}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.875rem"
          }}
        >
          <RefreshCw size={16} />
          {t('generateNewQR')}
        </button>

        {authUser && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1rem",
            backgroundColor: "white",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "0.875rem"
          }}>
            <span style={{ fontWeight: "500" }}>ABHA ID: {authUser.abhaNumber}</span>
            <button
              onClick={() => copyToClipboard(authUser.abhaNumber)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.25rem 0.5rem",
                backgroundColor: copied ? "#10b981" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.75rem",
                transition: "background-color 0.2s"
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? t('copied') : t('copyId')}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "family":
        return <p>{t('content.family')}</p>;
      case "profile":
        return renderProfile();
      case "records":
        return renderRecords();
      case "download":
        return <p>{t('content.download')}</p>;
      case "notifications":
        return renderNotifications();
      case "qrcode":
        return renderQRCode();
      default:
        return <p>{t('content.welcome')}</p>;
    }
  };

  if (!authUser) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {/* Header */}
      <div style={{
        backgroundColor: "#2563eb",
        color: "white",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h1>{t('title')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              backgroundColor: 'white',
              color: '#374151'
            }}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="ta">தமிழ்</option>
          </select>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '8px 12px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <LogOut size={16} />
            {t('logout')}
          </button>
        </div>
      </div>

      {/* Authenticated User Info */}
      {authUser && (
        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center',
          background: '#f0f5ff',
          border: '1px solid #d6e4ff',
          color: '#1d39c4',
          padding: '12px 16px',
          margin: '0 16px',
          borderRadius: '8px'
        }}>
          <div><strong>Name:</strong> {authUser.name}</div>
          <div><strong>ABHA:</strong> {authUser.abhaNumber}</div>
          <div><strong>Region:</strong> {authUser.region}</div>
        </div>
      )}

      {/* Navigation Bar */}
      <div style={{
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        {[
          { key: "family", icon: Users, color: "#10b981", label: t('family') },
          { key: "profile", icon: User, color: "#3b82f6", label: t('profile') },
          { key: "records", icon: FileText, color: "#6366f1", label: t('records') },
          { key: "download", icon: Download, color: "#8b5cf6", label: t('download') },
          { key: "qrcode", icon: QrCode, color: "#f59e0b", label: t('qrCode') },
          { key: "notifications", icon: Bell, color: "#ef4444", label: t('notifications') }
        ].map(({ key, icon: Icon, color, label }) => (
          <button
            key={key}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "1rem 0.5rem",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
              minWidth: "100px",
              textAlign: "center",
              border: "none",
              backgroundColor: activeTab === key ? "#e2e8f0" : "transparent",
              color: "#374151",
              fontSize: "0.875rem",
              fontWeight: "500"
            }}
            onClick={() => setActiveTab(key)}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#e2e8f0")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = activeTab === key ? "#e2e8f0" : "transparent")}
          >
            <Icon size={24} style={{ marginBottom: "0.5rem", color }} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ padding: "2rem", textAlign: "center" }}>{renderContent()}</div>
    </div>
  );
}
