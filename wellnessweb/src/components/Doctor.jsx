import React, { useState, useEffect } from "react";
import {
  QrCode,
  FileText,
  Bell,
  User,
  Edit3,
  Save,
  X,
  LogOut,
  RefreshCw,
  Camera
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import QRScanner from "./QRScanner";
// Doctor API service
const doctorAPI = {
  getProfile: async () => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/doctor/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  scanQR: async (encryptedData) => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch('http://localhost:8081/doctor/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ encryptedData })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store patient data in session or state management
        sessionStorage.setItem('currentPatient', JSON.stringify({
          id: data.patientId,
          info: data.patientInfo,
          records: data.healthRecords
        }));
        
        // Return success with patient ID for navigation
        return {
          success: true,
          patientId: data.patientId,
          recordsUrl: data.recordsUrl
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to process QR code'
        };
      }
    } catch (error) {
      console.error('Error scanning QR:', error);
      return {
        success: false,
        error: 'Network error while scanning QR code'
      };
    }
  },

  addObservation: async (patientId, type, value, unit) => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/doctor/records/observations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ patientId, type, value, unit })
    });
    return response.json();
  },

  addImmunization: async (patientId, vaccineType, lotNumber) => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/doctor/records/immunizations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ patientId, vaccineType, lotNumber })
    });
    return response.json();
  },

  getPatientRecords: async (patientId) => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8081/doctor/records/patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  getScanHistory: async (limit = 10) => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8081/doctor/scan-history?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  logout: async () => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/doctor/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  getNotifications: async () => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/doctor/me/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  searchPatientByAbha: async (abhaNumber) => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8081/doctor/search/patient/${abhaNumber}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  getPatientRecordsByAbha: async (abhaNumber) => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8081/doctor/records/patient/${abhaNumber}`, {
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
    title: "Doctor Dashboard",
    scan: "Scan QR",
    summary: "Patient Summary", 
    vaccinations: "Add Immunizations",
    vitals: "Add Observations",
    history: "Scan History",
    notifications: "Notifications",
    profile: "My Profile",
    logout: "Logout",
    loading: "Loading...",
    error: "Error loading data",
    retry: "Retry",
    abhaSearch: "Search Patient",
    abhaNumber: "ABHA Number",
    searchButton: "Search Patient",
    patientDetails: "Patient Details",
    healthRecords: "Health Records",
    observations: "Observations",
    immunizations: "Immunizations",
    conditions: "Conditions",
    viewRecords: "View Records",
    scanSuccess: "QR Scan Successful",
    scanError: "Failed to scan QR code",
    scanPlaceholder: "Paste encrypted QR data here",
    scanButton: "Scan QR Data",
    addObservation: "Add New Observation",
    addVaccination: "Add New Vaccination",
    patientId: "Patient ID",
    observationType: "Observation Type",
    value: "Value",
    unit: "Unit",
    vaccineType: "Vaccine Type",
    lotNumber: "Lot Number",
    save: "Save",
    cancel: "Cancel",
    bloodPressure: "Blood Pressure",
    weight: "Weight",
    temperature: "Temperature",
    heartRate: "Heart Rate",
    profileSection: {
      personalDetails: "Personal Details",
      professionalDetails: "Professional Details", 
      contactDetails: "Contact Details",
      name: "Name",
      age: "Age",
      gender: "Gender",
      qualification: "Qualification",
      specialization: "Specialization",
      experience: "Years of Experience",
      registrationNumber: "Medical Registration Number",
      hospital: "Hospital/Clinic",
      department: "Department",
      designation: "Designation",
      email: "Email",
      phone: "Phone",
      address: "Address",
      emergencyContact: "Emergency Contact",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel"
    }
  },
  hi: {
    title: "डॉक्टर डैशबोर्ड",
    scan: "क्यूआर स्कैन करें",
    summary: "रोगी सारांश",
    vaccinations: "टीकाकरण जोड़ें",
    vitals: "निरीक्षण जोड़ें",
    history: "स्कैन इतिहास",
    notifications: "सूचनाएं",
    profile: "मेरी प्रोफाइल",
    logout: "लॉग आउट",
    loading: "लोड हो रहा है...",
    error: "डेटा लोड करने में त्रुटि",
    retry: "पुनः प्रयास करें"
  },
  ta: {
    title: "மருத்துவர் டாஷ்போர்டு",
    scan: "QR ஸ்கேன்",
    summary: "நோயாளி சுருக்கம்",
    vaccinations: "தடுப்பூசிகள் சேர்க்க",
    vitals: "கண்காணிப்புகள் சேர்க்க", 
    history: "ஸ்கேன் வரலாறு",
    notifications: "அறிவிப்புகள்",
    profile: "என் சுயவிவரம்",
    logout: "வெளியேறு",
    loading: "ஏற்றுகிறது...",
    error: "தகவல் ஏற்றுவதில் பிழை",
    retry: "மீண்டும் முயற்சிக்கவும்"
  },
  ml: {
    title: "ഡോക്ടർ ഡാഷ്ബോർഡ്",
    scan: "QR സ്കാൻ",
    summary: "രോഗി സംഗ്രഹം",
    vaccinations: "വാക്സിനേഷനുകൾ ചേർക്കുക",
    vitals: "നിരീക്ഷണങ്ങൾ ചേർക്കുക",
    history: "സ്കാൻ ചരിത്രം", 
    notifications: "അറിയിപ്പുകൾ",
    profile: "എന്റെ പ്രൊഫൈൽ",
    logout: "പുറത്തുകടക്കുക",
    loading: "ലോഡ് ചെയ്യുന്നു...",
    error: "ഡാറ്റ ലോഡ് ചെയ്യുന്നതിൽ പിശക്",
    retry: "വീണ്ടും ശ്രമിക്കുക"
  }
};

export default function DoctorHome() {
  const { language, setLanguage } = useLanguage();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState({
    profile: false,
    scan: false,
    observations: false,
    immunizations: false,
    history: false,
    search: false,
    records: false,
    notifications: false
  });
  
  const [error, setError] = useState({
    profile: null,
    scan: null,
    observations: null,
    immunizations: null,
    history: null,
    search: null,
    records: null,
    notifications: null
  });

  // Data states
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [profileFormData, setProfileFormData] = useState({});
  const [scannedPatient, setScannedPatient] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [qrInputData, setQrInputData] = useState('');
  const [notifications, setNotifications] = useState([]);

  // Form states for adding records
  const [showObservationForm, setShowObservationForm] = useState(false);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [observationForm, setObservationForm] = useState({
    patientId: '',
    type: 'blood-pressure',
    value: '',
    unit: 'mmHg'
  });
  const [vaccinationForm, setVaccinationForm] = useState({
    patientId: '',
    vaccineType: '',
    lotNumber: ''
  });

  // ABHA Search states
  const [abhaSearchInput, setAbhaSearchInput] = useState('');
  const [searchedPatient, setSearchedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState(null);

  // Initialize from sessionStorage
  useEffect(() => {
    const storedUser = sessionStorage.getItem('authUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setDoctorProfile(parsedUser);
        setProfileFormData(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        handleLogout();
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key, value) => {
    setError(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = async () => {
    try {
      await doctorAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  const loadScanHistory = async () => {
    setLoadingState('history', true);
    setErrorState('history', null);
    try {
      const response = await doctorAPI.getScanHistory();
      setScanHistory(response);
    } catch (error) {
      console.error('Error loading scan history:', error);
      setErrorState('history', 'Failed to load scan history');
    } finally {
      setLoadingState('history', false);
    }
  };

  const loadNotifications = async () => {
    setLoadingState('notifications', true);
    setErrorState('notifications', null);
    try {
      const response = await doctorAPI.getNotifications();
      setNotifications(response);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setErrorState('notifications', 'Failed to load notifications');
    } finally {
      setLoadingState('notifications', false);
    }
  };

  const handleQRScan = async () => {
    if (!qrInputData.trim()) {
      setErrorState('scan', 'Please enter QR data');
      return;
    }

    setLoadingState('scan', true);
    setErrorState('scan', null);
    try {
      const response = await doctorAPI.scanQR(qrInputData);
      if (response.success) {
        setScannedPatient(response);
        setQrInputData('');
        // Pre-fill forms with scanned patient ID
        setObservationForm(prev => ({ ...prev, patientId: response.patient?.abha || '' }));
        setVaccinationForm(prev => ({ ...prev, patientId: response.patient?.abha || '' }));
      } else {
        setErrorState('scan', response.error || 'Failed to scan QR code');
      }
    } catch (error) {
      console.error('Error scanning QR:', error);
      setErrorState('scan', 'Failed to scan QR code');
    } finally {
      setLoadingState('scan', false);
    }
  };

  const handleAddObservation = async () => {
    const { patientId, type, value, unit } = observationForm;
    
    if (!patientId || !type || !value || !unit) {
      setErrorState('observations', 'All fields are required');
      return;
    }

    setLoadingState('observations', true);
    setErrorState('observations', null);
    try {
      const response = await doctorAPI.addObservation(patientId, type, value, unit);
      if (response.success) {
        setShowObservationForm(false);
        setObservationForm({ patientId: '', type: 'blood-pressure', value: '', unit: 'mmHg' });
        // Reload scan history to show new record
        loadScanHistory();
      } else {
        setErrorState('observations', response.error || 'Failed to add observation');
      }
    } catch (error) {
      console.error('Error adding observation:', error);
      setErrorState('observations', 'Failed to add observation');
    } finally {
      setLoadingState('observations', false);
    }
  };

  const handleAddVaccination = async () => {
    const { patientId, vaccineType, lotNumber } = vaccinationForm;
    
    if (!patientId || !vaccineType) {
      setErrorState('immunizations', 'Patient ID and Vaccine Type are required');
      return;
    }

    setLoadingState('immunizations', true);
    setErrorState('immunizations', null);
    try {
      const response = await doctorAPI.addImmunization(patientId, vaccineType, lotNumber);
      if (response.success) {
        setShowVaccinationForm(false);
        setVaccinationForm({ patientId: '', vaccineType: '', lotNumber: '' });
        // Reload scan history to show new record
        loadScanHistory();
      } else {
        setErrorState('immunizations', response.error || 'Failed to add vaccination');
      }
    } catch (error) {
      console.error('Error adding vaccination:', error);
      setErrorState('immunizations', 'Failed to add vaccination');
    } finally {
      setLoadingState('immunizations', false);
    }
  };

  const handleProfileEdit = () => {
    setIsEditingProfile(true);
    setProfileFormData({ ...doctorProfile });
  };

  const handleProfileSave = () => {
    setDoctorProfile({ ...profileFormData });
    sessionStorage.setItem('authUser', JSON.stringify(profileFormData));
    setIsEditingProfile(false);
  };

  const handleProfileCancel = () => {
    setProfileFormData({ ...doctorProfile });
    setIsEditingProfile(false);
  };

  const handleInputChange = (field, value) => {
    setProfileFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAbhaSearch = async () => {
    if (!abhaSearchInput.trim()) {
      setErrorState('search', 'Please enter an ABHA number');
      return;
    }

    setLoadingState('search', true);
    setErrorState('search', null);
    setSearchedPatient(null);
    setPatientRecords(null);

    try {
      const response = await doctorAPI.searchPatientByAbha(abhaSearchInput.trim());
      
      if (response.success) {
        setSearchedPatient(response.patient);
        // Automatically fetch records after successful search
        await handleFetchPatientRecords(abhaSearchInput.trim());
      } else {
        setErrorState('search', response.error || 'Patient not found');
      }
    } catch (error) {
      console.error('Error searching patient:', error);
      setErrorState('search', 'Failed to search patient. Please try again.');
    } finally {
      setLoadingState('search', false);
    }
  };

  const handleFetchPatientRecords = async (abhaNumber) => {
    setLoadingState('records', true);
    setErrorState('records', null);

    try {
      const response = await doctorAPI.getPatientRecordsByAbha(abhaNumber);
      
      if (response.success) {
        setPatientRecords(response.records);
      } else {
        setErrorState('records', response.error || 'Failed to fetch patient records');
      }
    } catch (error) {
      console.error('Error fetching patient records:', error);
      setErrorState('records', 'Failed to fetch patient records. Please try again.');
    } finally {
      setLoadingState('records', false);
    }
  };

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;

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
      {onRetry && (
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
      )}
    </div>
  );

  // ABHA Search Section Component (compact for grid layout)
  const AbhaSearchSection = () => (
    <div>
      {/* Search Form */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={abhaSearchInput}
          onChange={(e) => setAbhaSearchInput(e.target.value)}
          placeholder="Enter 14-digit ABHA number"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}
        />
        <button
          onClick={handleAbhaSearch}
          disabled={loading.search}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: loading.search ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading.search ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          {loading.search ? <RefreshCw className="animate-spin" size={16} /> : <FileText size={16} />}
          {loading.search ? 'Searching...' : 'Search Patient'}
        </button>
      </div>

      {/* Error Message */}
      {error.search && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          padding: '0.75rem',
          color: '#dc2626',
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          {error.search}
        </div>
      )}

      {/* Patient Details */}
      {searchedPatient && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h3 style={{ color: '#15803d', marginBottom: '0.75rem' }}>
            Patient Found
          </h3>
          <div style={{ fontSize: '1rem', color: '#374151' }}>
            <div style={{ marginBottom: '0.25rem' }}>
              Name : <strong>{searchedPatient.name}</strong>
            </div>
            <div style={{ marginBottom: '0.25rem' }}>
              ABHA ID : {searchedPatient.abhaNumber}
            </div>
            <div>
              Phone no :  {searchedPatient.mobile} <br /> Location : {searchedPatient.region}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // QR Scanner Component with backend integration
  // const QRScanner = () => (
  //   <div style={{ padding: "2rem", backgroundColor: "#f8fafc", borderRadius: "12px", margin: "2rem auto", maxWidth: "600px" }}>
  //     <h3 style={{ marginBottom: '1.5rem' }}>QR Code Scanner</h3>
      
  //     {error.scan && <ErrorMessage message={error.scan} />}
      
  //     <div style={{ marginBottom: '1.5rem' }}>
  //       <textarea
  //         value={qrInputData}
  //         onChange={(e) => setQrInputData(e.target.value)}
  //         placeholder={t('scanPlaceholder')}
  //         style={{
  //           width: '100%',
  //           height: '100px',
  //           padding: '0.75rem',
  //           border: '1px solid #d1d5db',
  //           borderRadius: '6px',
  //           fontSize: '0.875rem'
  //         }}
  //       />
  //     </div>
      
  //     <button
  //       onClick={handleQRScan}
  //       disabled={loading.scan}
  //       style={{
  //         display: 'flex',
  //         alignItems: 'center',
  //         gap: '0.5rem',
  //         padding: '0.75rem 1.5rem',
  //         backgroundColor: loading.scan ? '#9ca3af' : '#3b82f6',
  //         color: 'white',
  //         border: 'none',
  //         borderRadius: '6px',
  //         cursor: loading.scan ? 'not-allowed' : 'pointer',
  //         margin: '0 auto'
  //       }}
  //     >
  //       {loading.scan ? <RefreshCw className="animate-spin" size={16} /> : <QrCode size={16} />}
  //       {loading.scan ? t('loading') : t('scanButton')}
  //     </button>

  //     {scannedPatient && (
  //       <div style={{
  //         marginTop: '2rem',
  //         padding: '1.5rem',
  //         backgroundColor: '#f0fdf4',
  //         border: '1px solid #bbf7d0',
  //         borderRadius: '8px'
  //       }}>
  //         <h4 style={{ color: '#15803d', marginBottom: '1rem' }}>{t('scanSuccess')}</h4>
  //         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
  //           <div>
  //             <strong>Patient:</strong> {scannedPatient.patient?.name}
  //           </div>
  //           <div>
  //             <strong>ABHA:</strong> {scannedPatient.patient?.abha}
  //           </div>
  //           <div>
  //             <strong>Mobile:</strong> {scannedPatient.patient?.mobile}
  //           </div>
  //           <div>
  //             <strong>Region:</strong> {scannedPatient.patient?.region}
  //           </div>
  //         </div>
  //         {scannedPatient.healthRecords && (
  //           <div style={{ marginTop: '1rem' }}>
  //             <strong>Health Records Available:</strong> Yes
  //           </div>
  //         )}
  //       </div>
  //     )}
  //   </div>
  // );

  // Health Records Section (full-sized like migrant dashboard)
  const HealthRecordsSection = () => (
    <div style={{
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      padding: "2rem"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        borderRadius: "16px",
        padding: "2rem",
        color: "white",
        marginBottom: "2rem",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)"
      }}>
        <h2 style={{
          margin: 0,
          fontSize: "1.75rem",
          fontWeight: "700",
          textAlign: "center"
        }}>
          Health Records
        </h2>
        <p style={{
          margin: "0.5rem 0 0 0",
          opacity: 0.9,
          textAlign: "center"
        }}>
          Your recent medical history
        </p>
      </div>

      {/* Records Content */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "3rem",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <div style={{
          display: "grid",
          gap: "2rem"
        }}>
          {/* Sample Health Records */}
          {[1, 2, 3].map((index) => (
            <div key={index} style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: 0, color: '#1f2937', fontSize: '1.25rem' }}>Medical Checkup #{index}</h4>
                <span style={{
                  backgroundColor: index === 1 ? '#10b981' : index === 2 ? '#f59e0b' : '#ef4444',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {index === 1 ? 'Normal' : index === 2 ? 'Attention' : 'Review'}
                </span>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>Weight</p>
                  <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>{70 + index} kg</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>Height</p>
                  <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>175 cm</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>Sugar Level</p>
                  <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>{95 + index * 5} mg/dL</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>Blood Pressure</p>
                  <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>120/80</p>
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#e0f2fe',
                border: '1px solid #0284c7',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <p style={{ margin: 0, fontSize: '1rem', fontStyle: 'italic', color: '#0284c7' }}>
                  <strong>Doctor's Notes:</strong> {index === 1 ? '"Patient is in good health, continue regular exercise"' : 
                    index === 2 ? '"Monitor blood sugar levels closely"' : '"Follow up required for blood pressure"'}
                </p>
              </div>
              
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                {index === 1 ? '1/15/2024' : index === 2 ? '2/20/2024' : '3/10/2024'} • Medical Record #{index}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Patient Search Section (full-sized like migrant dashboard)
  const PatientSearchSection = () => (
    <div style={{
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      padding: "2rem"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        borderRadius: "16px",
        padding: "2rem",
        color: "white",
        marginBottom: "2rem",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)"
      }}>
        <h2 style={{
          margin: 0,
          fontSize: "1.75rem",
          fontWeight: "700",
          textAlign: "center"
        }}>
          Patient Search
        </h2>
        <p style={{
          margin: "0.5rem 0 0 0",
          opacity: 0.9,
          textAlign: "center"
        }}>
          Search and manage patient records
        </p>
      </div>

      {/* Search Content */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "3rem",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h3 style={{ marginBottom: '2rem', textAlign: 'center', color: '#1f2937' }}>Search Patient by ABHA</h3>
          
          {/* Search Form */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#374151', fontSize: '1rem' }}>ABHA Number</label>
              <input
                type="text"
                value={abhaSearchInput}
                onChange={(e) => setAbhaSearchInput(e.target.value)}
                placeholder="Enter 14-digit ABHA number"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <button
                onClick={handleAbhaSearch}
                disabled={loading.search}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '1rem 2rem',
                  backgroundColor: loading.search ? '#9ca3af' : '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: loading.search ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'background-color 0.2s'
                }}
              >
                {loading.search ? <RefreshCw className="animate-spin" size={20} /> : <FileText size={20} />}
                {loading.search ? 'Searching...' : 'Search Patient'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error.search && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '1rem',
              color: '#dc2626',
              fontSize: '1rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              {error.search}
            </div>
          )}

          {/* Patient Details */}
          {searchedPatient && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '2px solid #bbf7d0',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              <h4 style={{ color: '#15803d', marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.25rem' }}>
                Patient Found
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem',
                fontSize: '1rem'
              }}>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
                  <strong>Name:</strong> {searchedPatient.name}
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
                  <strong>ABHA Number:</strong> {searchedPatient.abhaNumber}
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
                  <strong>Mobile:</strong> {searchedPatient.mobile}
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px' }}>
                  <strong>Region:</strong> {searchedPatient.region}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Notifications Section (full-sized like migrant dashboard)
  const NotificationsSection = () => {
    if (loading.notifications) {
      return (
        <div style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <LoadingSpinner />
        </div>
      );
    }

    if (error.notifications) {
      return (
        <div style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          padding: "2rem"
        }}>
          <ErrorMessage message={error.notifications} onRetry={loadNotifications} />
        </div>
      );
    }

    return (
      <div style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        padding: "2rem"
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          borderRadius: "16px",
          padding: "2rem",
          color: "white",
          marginBottom: "2rem",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)"
        }}>
          <h2 style={{
            margin: 0,
            fontSize: "1.75rem",
            fontWeight: "700",
            textAlign: "center"
          }}>
            Notifications
          </h2>
          <p style={{
            margin: "0.5rem 0 0 0",
            opacity: 0.9,
            textAlign: "center"
          }}>
            Health alerts and reminders from health officials
          </p>
        </div>

        {/* Notifications Content */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "3rem",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {notifications && notifications.length > 0 ? (
            <div style={{
              display: "grid",
              gap: "1.5rem"
            }}>
              {notifications.map((notification, index) => (
                <div key={notification.id || index} style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid #e2e8f0",
                  borderLeft: "4px solid #ef4444"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "1rem"
                  }}>
                    <div>
                      <h3 style={{
                        margin: "0 0 0.5rem 0",
                        color: "#1f2937",
                        fontSize: "1.25rem",
                        fontWeight: "600"
                      }}>
                        {notification.title}
                      </h3>
                      <div style={{
                        display: "flex",
                        gap: "1rem",
                        fontSize: "0.875rem",
                        color: "#6b7280"
                      }}>
                        <span>Type: {notification.type || 'Announcement'}</span>
                        {notification.region && <span>Region: {notification.region}</span>}
                        {notification.createdAt && (
                          <span>Date: {new Date(notification.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p style={{
                    margin: "0",
                    color: "#374151",
                    lineHeight: "1.6"
                  }}>
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: "center",
              padding: "3rem",
              color: "#6b7280"
            }}>
              <Bell size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
              <h3 style={{ margin: "0 0 0.5rem 0" }}>No Notifications</h3>
              <p style={{ margin: 0 }}>You'll see health alerts and announcements here</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Profile Component (full-sized like migrant dashboard with edit functionality)
  const ProfileSection = () => {
    if (!doctorProfile) {
      return <p style={{ textAlign: 'center', color: '#6b7280' }}>No profile data available</p>;
    }

    return (
      <div style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        padding: "2rem"
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          borderRadius: "16px",
          padding: "2rem",
          color: "white",
          marginBottom: "2rem",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)"
        }}>
          <h2 style={{
            margin: 0,
            fontSize: "1.75rem",
            fontWeight: "700",
            textAlign: "center"
          }}>
            Doctor Profile
          </h2>
          <p style={{
            margin: "0.5rem 0 0 0",
            opacity: 0.9,
            textAlign: "center"
          }}>
            Manage your professional information
          </p>
        </div>

        {/* Profile Content */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "0",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          maxWidth: "1200px",
          margin: "0 auto",
          overflow: "hidden"
        }}>
          {!isEditingProfile ? (
            /* Profile Display - Horizontal Layout like the image */
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "2rem",
              gap: "2rem",
              backgroundColor: "#ffffff"
            }}>
              {/* Avatar */}
              <div style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "white",
                boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)",
                flexShrink: 0
              }}>
                {(doctorProfile.name || "D").charAt(0).toUpperCase()}
              </div>

              {/* Name and Location */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#1f2937"
                }}>
                  {doctorProfile.name || "Doctor Name"}
                </h3>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#ef4444",
                  fontSize: "0.875rem",
                  marginBottom: "0.25rem"
                }}>
                  <span>📍</span>
                  <span>{doctorProfile.location || "Hospital Location"}</span>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#6b7280",
                  fontSize: "0.875rem"
                }}>
                  <span>📧</span>
                  <span>{doctorProfile.mobile || "doctor@example.com"}</span>
                </div>
              </div>

              {/* Doctor ID */}
              <div style={{
                textAlign: "center",
                padding: "0 1.5rem"
              }}>
                <div style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#10b981",
                  marginBottom: "0.25rem"
                }}>
                  {doctorProfile.username || "DOC001"}
                </div>
                <div style={{
                  color: "#6b7280",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  Doctor ID
                </div>
              </div>

              {/* Specialization */}
              <div style={{
                textAlign: "center",
                padding: "0 1.5rem"
              }}>
                <div style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#3b82f6",
                  marginBottom: "0.25rem"
                }}>
                  {doctorProfile.specialization || "General Medicine"}
                </div>
                <div style={{
                  color: "#6b7280",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  Specialization
                </div>
              </div>

              {/* Experience */}
              <div style={{
                textAlign: "center",
                padding: "0 1.5rem"
              }}>
                <div style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#f59e0b",
                  marginBottom: "0.25rem"
                }}>
                  {doctorProfile.experience || "5"} Years
                </div>
                <div style={{
                  color: "#6b7280",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  Experience
                </div>
              </div>

              {/* Active Status & Edit Button */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem"
              }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#dcfce7",
                  color: "#166534",
                  borderRadius: "20px",
                  fontSize: "0.875rem",
                  fontWeight: "600"
                }}>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#22c55e"
                  }} />
                  Active
                </div>
                
                <button
                  onClick={() => {
                    setIsEditingProfile(true);
                    setProfileFormData({ ...doctorProfile });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    transition: "background-color 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#2563eb"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#3b82f6"}
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            /* Edit Form */
            <div style={{ padding: "3rem" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem"
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#1f2937"
                }}>
                  Edit Profile Information
                </h4>
                
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    onClick={handleProfileSave}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#22c55e",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "600"
                    }}
                  >
                    <Save size={20} />
                    Save
                  </button>
                  <button
                    onClick={handleProfileCancel}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "600"
                    }}
                  >
                    <X size={20} />
                    Cancel
                  </button>
                </div>
              </div>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem"
              }}>
                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    color: "#374151",
                    fontWeight: "600",
                    fontSize: "1rem"
                  }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileFormData.name || ''}
                    onChange={(e) => setProfileFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    color: "#374151",
                    fontWeight: "600",
                    fontSize: "1rem"
                  }}>
                    Email/Mobile
                  </label>
                  <input
                    type="text"
                    value={profileFormData.mobile || ''}
                    onChange={(e) => setProfileFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    color: "#374151",
                    fontWeight: "600",
                    fontSize: "1rem"
                  }}>
                    Doctor ID
                  </label>
                  <input
                    type="text"
                    value={profileFormData.username || ''}
                    onChange={(e) => setProfileFormData(prev => ({ ...prev, username: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    color: "#374151",
                    fontWeight: "600",
                    fontSize: "1rem"
                  }}>
                    Health Professional ID
                  </label>
                  <input
                    type="text"
                    value={profileFormData.healthProfessionalId || ''}
                    onChange={(e) => setProfileFormData(prev => ({ ...prev, healthProfessionalId: e.target.value }))}
                    placeholder="Enter your health professional license ID"
                    style={{
                      width: "100%",
                      padding: "1rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    color: "#374151",
                    fontWeight: "600",
                    fontSize: "1rem"
                  }}>
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={profileFormData.specialization || ''}
                    onChange={(e) => setProfileFormData(prev => ({ ...prev, specialization: e.target.value }))}
                    placeholder="Enter your medical specialization"
                    style={{
                      width: "100%",
                      padding: "1rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    color: "#374151",
                    fontWeight: "600",
                    fontSize: "1rem"
                  }}>
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={profileFormData.experience || ''}
                    onChange={(e) => setProfileFormData(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="Years of experience"
                    style={{
                      width: "100%",
                      padding: "1rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    color: "#374151",
                    fontWeight: "600",
                    fontSize: "1rem"
                  }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileFormData.location || ''}
                    onChange={(e) => setProfileFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Hospital/Clinic location"
                    style={{
                      width: "100%",
                      padding: "1rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "0.75rem",
                    color: "#374151",
                    fontWeight: "600",
                    fontSize: "1rem"
                  }}>
                    Role
                  </label>
                  <div style={{
                    padding: "1rem",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "12px",
                    color: "#6b7280",
                    fontSize: "1rem",
                    border: "2px solid #e5e7eb"
                  }}>
                    {doctorProfile.role || 'DOCTOR'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Show QR Scanner modal
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [activeTab, setActiveTab] = useState('welcome');

  const renderContent = () => {
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'grid',
        gap: '2rem',
        gridTemplateColumns: '1fr'
      }}>
        {/* Profile Summary Card */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.5rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '1rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: '#3b82f6' }} />
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1rem' }}>My Profile</h3>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              View Profile
            </button>
          </div>
          
          {/* Profile Summary */}
          {doctorProfile && (
            <div style={{
              display: "flex",
              justifyContent:'space-between',
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem"
            }}>
              <div style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "white"
              }}>
                {(doctorProfile.name || "D").charAt(0).toUpperCase()}
              </div>
              <div style={{ display:'flex',justifyContent:'left',flex : 1,alignItems:'center',gap:'5rem' }}>
                <h4 style={{
                  margin: "0 0 0.25rem 0",
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#1f2937"
                }}>
                  Doctor Name <br />
                  {doctorProfile.name || "Doctor Name"}
                </h4>
                <div className="doctor-info" style={{display : 'flex',justifyContent:'space-around',flex : 1}}>
                  <p style={{
                  margin: "0",
                  color: "#6b7280",
                  fontSize: "1.1rem"
                }}>
                  <span style={{fontWeight : 'bold'}}>Doctor ID</span><br />
                  {doctorProfile.username || "DOC001"}
                </p>
                <p style={{
                  margin: "0",
                  color: "#6b7280",
                  fontSize: "1.1rem"
                }}>
                  <span style={{fontWeight : 'bold'}}>Doctor Email</span><br />
                  {doctorProfile.mobile || "doctor@example.com"}
                </p>
                </div>
                
              </div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.25rem 0.5rem",
                backgroundColor: "#dcfce7",
                color: "#166534",
                borderRadius: "12px",
                fontSize: "0.7rem",
                fontWeight: "500"
              }}>
                <div style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e"
                }} />
                Active
              </div>
            </div>
          )}
        </div>

        {/* Health Records Card */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '1.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} style={{ color: '#10b981' }} />
              <h3 style={{ margin: 0, color: '#1f2937' }}>Health Records</h3>
            </div>
            <button
              onClick={() => setActiveTab('records')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              View All
            </button>
          </div>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Your recent medical history
          </p>
          
          {/* Sample Health Record */}
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, color: '#1f2937' }}>Medical Checkup</h4>
              <span style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                Normal
              </span>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Weight: 70 kg</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Height: 175 cm</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Sugar: 95 mg/dL</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>BP: 120/80</p>
              </div>
            </div>
            
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
              1/15/2024 • Medical Record #1
            </p>
          </div>
        </div>

        {/* Patient Search Card */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '1.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} style={{ color: '#f59e0b' }} />
              <h3 style={{ margin: 0, color: '#1f2937' }}>Patient Search</h3>
            </div>
          </div>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Search and manage patient records
          </p>
          
          <AbhaSearchSection />
        </div>

        {/* Scan QR Code Card */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '1.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <QrCode size={20} style={{ color: '#3b82f6' }} />
              <h3 style={{ margin: 0, color: '#1f2937' }}>Scan QR Code</h3>
            </div>
          </div>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Scan patient QR codes to access their health records
          </p>
          
          <button
            onClick={() => setShowQRScanner(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f0f9ff',
              border: '2px dashed #3b82f6',
              borderRadius: '12px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '1rem',
              fontWeight: '500',
              color: '#3b82f6'
            }}
          >
            <QrCode size={24} />
            Start QR Scanner
          </button>
        </div>

        {/* Notifications Card */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '1.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={20} style={{ color: '#ef4444' }} />
              <h3 style={{ margin: 0, color: '#1f2937' }}>Notifications</h3>
            </div>
            <button
              onClick={() => setActiveTab('notifications')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              View All
            </button>
          </div>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Health alerts and important reminders
          </p>
          
          {/* Recent notification preview */}
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Bell size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ 
                margin: '0 0 0.25rem 0', 
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                High Priority Alert
              </h4>
              <p style={{ 
                margin: 0, 
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                Patient requires immediate attention
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!doctorProfile) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      {/* Header */}
      <div style={{
        backgroundColor: "#2563eb",
        color: "white",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <h1 style={{ margin: 0 }}>{t('title')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "white",
              color: "#333",
            }}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="ta">தமிழ்</option>
            <option value="ml">മലയാളം</option>
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

      {/* Main Content */}
      <div style={{ 
        padding: "2rem", 
        backgroundColor: "#f8fafc",
        minHeight: "calc(100vh - 80px)"
      }}>
        {renderContent()}
      </div>

      {/* Modal/Overlay for detailed views */}
      {activeTab !== 'welcome' && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem"
        }}
        onClick={() => setActiveTab('welcome')}
        >
          <div 
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              maxWidth: "95vw",
              width: "1400px",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveTab('welcome')}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#f3f4f6",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10
              }}
            >
              <X size={16} />
            </button>
            
            {activeTab === "profile" && <ProfileSection />}
            {activeTab === "records" && <HealthRecordsSection />}
            {activeTab === "search" && <PatientSearchSection />}
            {activeTab === "notifications" && <NotificationsSection />}
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ margin: 0 }}>QR Scanner</h3>
              <button
                onClick={() => setShowQRScanner(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <X size={20} />
              </button>
            </div>
            <QRScanner />
          </div>
        </div>
      )}
    </div>
  );
}
