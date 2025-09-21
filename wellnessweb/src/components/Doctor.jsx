import React, { useState, useEffect } from "react";
import {
  QrCode,
  FileText,
  Syringe,
  Activity,
  Clock,
  Bell,
  User,
  Edit3,
  Save,
  X,
  LogOut,
  RefreshCw,
  Camera,
  Plus
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

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
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/doctor/scan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ encryptedData })
    });
    return response.json();
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
  const [activeTab, setActiveTab] = useState("home");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState({
    profile: false,
    scan: false,
    observations: false,
    immunizations: false,
    history: false
  });
  
  const [error, setError] = useState({
    profile: null,
    scan: null,
    observations: null,
    immunizations: null,
    history: null
  });

  // Data states
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [profileFormData, setProfileFormData] = useState({});
  const [scannedPatient, setScannedPatient] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [qrInputData, setQrInputData] = useState('');

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

  // Load data based on active tab
  useEffect(() => {
    if (doctorProfile) {
      switch (activeTab) {
        case 'history':
          loadScanHistory();
          break;
        default:
          break;
      }
    }
  }, [activeTab, doctorProfile]);

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

  // QR Scanner Component with backend integration
  const QRScanner = () => (
    <div style={{ padding: "2rem", backgroundColor: "#f8fafc", borderRadius: "12px", margin: "2rem auto", maxWidth: "600px" }}>
      <h3 style={{ marginBottom: '1.5rem' }}>QR Code Scanner</h3>
      
      {error.scan && <ErrorMessage message={error.scan} />}
      
      <div style={{ marginBottom: '1.5rem' }}>
        <textarea
          value={qrInputData}
          onChange={(e) => setQrInputData(e.target.value)}
          placeholder={t('scanPlaceholder')}
          style={{
            width: '100%',
            height: '100px',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem'
          }}
        />
      </div>
      
      <button
        onClick={handleQRScan}
        disabled={loading.scan}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: loading.scan ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading.scan ? 'not-allowed' : 'pointer',
          margin: '0 auto'
        }}
      >
        {loading.scan ? <RefreshCw className="animate-spin" size={16} /> : <QrCode size={16} />}
        {loading.scan ? t('loading') : t('scanButton')}
      </button>

      {scannedPatient && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px'
        }}>
          <h4 style={{ color: '#15803d', marginBottom: '1rem' }}>{t('scanSuccess')}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <strong>Patient:</strong> {scannedPatient.patient?.name}
            </div>
            <div>
              <strong>ABHA:</strong> {scannedPatient.patient?.abha}
            </div>
            <div>
              <strong>Mobile:</strong> {scannedPatient.patient?.mobile}
            </div>
            <div>
              <strong>Region:</strong> {scannedPatient.patient?.region}
            </div>
          </div>
          {scannedPatient.healthRecords && (
            <div style={{ marginTop: '1rem' }}>
              <strong>Health Records Available:</strong> Yes
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Observations/Vitals Component
  const VitalsSection = () => (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3>{t('vitals')}</h3>
        <button
          onClick={() => setShowObservationForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          {t('addObservation')}
        </button>
      </div>

      {error.observations && <ErrorMessage message={error.observations} />}

      {showObservationForm && (
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ marginBottom: '1rem' }}>{t('addObservation')}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('patientId')}</label>
              <input
                type="text"
                value={observationForm.patientId}
                onChange={(e) => setObservationForm(prev => ({ ...prev, patientId: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('observationType')}</label>
              <select
                value={observationForm.type}
                onChange={(e) => setObservationForm(prev => ({ ...prev, type: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              >
                <option value="blood-pressure">{t('bloodPressure')}</option>
                <option value="weight">{t('weight')}</option>
                <option value="temperature">{t('temperature')}</option>
                <option value="heart-rate">{t('heartRate')}</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('value')}</label>
              <input
                type="text"
                value={observationForm.value}
                onChange={(e) => setObservationForm(prev => ({ ...prev, value: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('unit')}</label>
              <input
                type="text"
                value={observationForm.unit}
                onChange={(e) => setObservationForm(prev => ({ ...prev, unit: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleAddObservation}
              disabled={loading.observations}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: loading.observations ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading.observations ? 'not-allowed' : 'pointer'
              }}
            >
              {loading.observations ? t('loading') : t('save')}
            </button>
            <button
              onClick={() => setShowObservationForm(false)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Vaccinations Component
  const VaccinationsSection = () => (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3>{t('vaccinations')}</h3>
        <button
          onClick={() => setShowVaccinationForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <Syringe size={16} />
          {t('addVaccination')}
        </button>
      </div>

      {error.immunizations && <ErrorMessage message={error.immunizations} />}

      {showVaccinationForm && (
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ marginBottom: '1rem' }}>{t('addVaccination')}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('patientId')}</label>
              <input
                type="text"
                value={vaccinationForm.patientId}
                onChange={(e) => setVaccinationForm(prev => ({ ...prev, patientId: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('vaccineType')}</label>
              <input
                type="text"
                value={vaccinationForm.vaccineType}
                onChange={(e) => setVaccinationForm(prev => ({ ...prev, vaccineType: e.target.value }))}
                placeholder="e.g., COVID-19, Hepatitis B"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('lotNumber')}</label>
              <input
                type="text"
                value={vaccinationForm.lotNumber}
                onChange={(e) => setVaccinationForm(prev => ({ ...prev, lotNumber: e.target.value }))}
                placeholder="Optional"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleAddVaccination}
              disabled={loading.immunizations}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: loading.immunizations ? '#9ca3af' : '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading.immunizations ? 'not-allowed' : 'pointer'
              }}
            >
              {loading.immunizations ? t('loading') : t('save')}
            </button>
            <button
              onClick={() => setShowVaccinationForm(false)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Scan History Component
  const HistorySection = () => {
    if (loading.history) return <LoadingSpinner />;
    if (error.history) return <ErrorMessage message={error.history} onRetry={loadScanHistory} />;

    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3>{t('history')}</h3>
          <button
            onClick={loadScanHistory}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {scanHistory?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {scanHistory.map((scan, index) => (
              <div key={index} style={{
                backgroundColor: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div><strong>Patient:</strong> {scan.patientName}</div>
                  <div><strong>ABHA:</strong> {scan.patientAbha}</div>
                  <div><strong>Scan Time:</strong> {new Date(scan.scanTimestamp).toLocaleString()}</div>
                  <div><strong>Status:</strong> {scan.success ? '✅ Success' : '❌ Failed'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No scan history available</p>
        )}
      </div>
    );
  };

  // Profile Component (keeping your existing structure but using backend data)
  const ProfileSection = () => {
    if (!doctorProfile) {
      return <p style={{ textAlign: 'center', color: '#6b7280' }}>No profile data available</p>;
    }

    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ color: "#1f2937", margin: 0 }}>
            {t('profile')}
          </h2>
          {!isEditingProfile ? (
            <button
              onClick={handleProfileEdit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              <Edit3 size={16} />
              {t('profileSection.edit')}
            </button>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleProfileSave}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                <Save size={16} />
                {t('profileSection.save')}
              </button>
              <button
                onClick={handleProfileCancel}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                <X size={16} />
                {t('profileSection.cancel')}
              </button>
            </div>
          )}
        </div>

        {/* Personal Details Section */}
        <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ color: "#4a5568", marginBottom: "1rem", backgroundColor: "#dbeafe", padding: "0.5rem", borderRadius: "6px" }}>
            {t('profileSection.personalDetails')}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontWeight: "500", marginBottom: "0.5rem" }}>
                {t('profileSection.name')}
              </label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={profileFormData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
                />
              ) : (
                <p style={{ margin: 0, padding: "0.5rem 0" }}>{doctorProfile.name || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label style={{ display: "block", fontWeight: "500", marginBottom: "0.5rem" }}>
                {t('profileSection.email')}
              </label>
              {isEditingProfile ? (
                <input
                  type="email"
                  value={profileFormData.mobile || ''}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px" }}
                />
              ) : (
                <p style={{ margin: 0, padding: "0.5rem 0" }}>{doctorProfile.mobile || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label style={{ display: "block", fontWeight: "500", marginBottom: "0.5rem" }}>
                Role
              </label>
              <p style={{ margin: 0, padding: "0.5rem 0" }}>{doctorProfile.role || 'DOCTOR'}</p>
            </div>
            <div>
              <label style={{ display: "block", fontWeight: "500", marginBottom: "0.5rem" }}>
                Username
              </label>
              <p style={{ margin: 0, padding: "0.5rem 0" }}>{doctorProfile.username || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "qr":
        return <QRScanner />;
      case "summary":
        return <p>📑 Patient Summary details go here</p>;
      case "vaccinations":
        return <VaccinationsSection />;
      case "vitals":
        return <VitalsSection />;
      case "history":
        return <HistorySection />;
      case "notifications":
        return <p>🔔 Notifications will appear here</p>;
      case "profile":
        return <ProfileSection />;
      default:
        return (
          <>
            <h2>Welcome, Doctor</h2>
            <p>Select an option from the navigation bar above to get started.</p>
            {doctorProfile && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '1rem',
                maxWidth: '400px',
                margin: '1rem auto'
              }}>
                <h4 style={{ color: '#15803d', margin: '0 0 0.5rem 0' }}>Logged in as:</h4>
                <p style={{ margin: 0 }}><strong>{doctorProfile.name}</strong></p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151' }}>{doctorProfile.mobile}</p>
              </div>
            )}
          </>
        );
    }
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

      {/* Navigation Bar */}
      <div style={{
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        padding: "0",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        {[
          { key: "qr", icon: QrCode, color: "#10b981", label: t('scan') },
          { key: "profile", icon: User, color: "#3b82f6", label: t('profile') },
          { key: "summary", icon: FileText, color: "#3b82f6", label: t('summary') },
          { key: "vaccinations", icon: Syringe, color: "#6366f1", label: t('vaccinations') },
          { key: "vitals", icon: Activity, color: "#8b5cf6", label: t('vitals') },
          { key: "history", icon: Clock, color: "#f59e0b", label: t('history') },
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
              minWidth: "120px",
              textAlign: "center",
              border: "none",
              backgroundColor: activeTab === key ? "#e2e8f0" : "transparent",
              color: "#374151",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
            onClick={() => setActiveTab(key)}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e2e8f0")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = activeTab === key ? "#e2e8f0" : "transparent")}
          >
            <Icon size={24} style={{ marginBottom: "0.5rem", color }} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: "2rem", textAlign: "center" }}>{renderContent()}</div>
    </div>
  );
}
