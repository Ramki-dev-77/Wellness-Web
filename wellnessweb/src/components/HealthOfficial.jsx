import React, { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Download,
  CreditCard,
  Bell,
  QrCode,
  User,
  Edit3,
  Save,
  X,
  LogOut,
  RefreshCw,
  Plus,
  Trash2
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// Health Official API service
const officialAPI = {
  getProfile: async () => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/official/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  getNotifications: async () => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/official/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  createNotification: async (title, message, region, type) => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/official/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, message, region, type })
    });
    return response.json();
  },

  updateNotification: async (id, data) => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8081/official/notifications/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  deleteNotification: async (id) => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8081/official/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  getWorkersByRegion: async (region) => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8081/official/workers/region/${region}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  logout: async () => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:8081/official/logout', {
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
    title: "Health Official Dashboard",
    qrScan: "QR Scanner",
    workerManagement: "Worker Management",
    reports: "Reports",
    documents: "Documents",
    registrations: "Registrations",
    notifications: "Notifications",
    profile: "My Profile",
    logout: "Logout",
    loading: "Loading...",
    error: "Error loading data",
    retry: "Retry",
    createNotification: "Create Notification",
    editNotification: "Edit Notification",
    deleteNotification: "Delete",
    notificationTitle: "Title",
    notificationMessage: "Message",
    notificationRegion: "Region",
    notificationType: "Type",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this notification?",
    noNotifications: "No notifications available",
    notificationCreated: "Notification created successfully",
    notificationUpdated: "Notification updated successfully",
    notificationDeleted: "Notification deleted successfully",
    affectedWorkers: "workers will receive this notification",
    selectRegion: "Select Region",
    allRegions: "All Regions",
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
      registrationNumber: "Government Registration Number",
      office: "Office/Department",
      designation: "Designation",
      jurisdiction: "Jurisdiction Area",
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
    title: "स्वास्थ्य अधिकारी डैशबोर्ड",
    qrScan: "क्यूआर स्कैनर",
    workerManagement: "श्रमिक प्रबंधन",
    reports: "रिपोर्ट",
    documents: "दस्तावेज़",
    registrations: "पंजीकरण",
    notifications: "सूचनाएं",
    profile: "मेरी प्रोफाइल",
    logout: "लॉग आउट",
    loading: "लोड हो रहा है...",
    error: "डेटा लोड करने में त्रुटि",
    retry: "पुनः प्रयास करें"
  },
  ta: {
    title: "ஆரோக்கிய அதிகாரி டாஷ்போர்டு",
    qrScan: "QR ஸ்கேனர்",
    workerManagement: "தொழிலாளர் மேலாண்மை",
    reports: "அறிக்கைகள்",
    documents: "ஆவணங்கள்",
    registrations: "பதிவுகள்",
    notifications: "அறிவிப்புகள்",
    profile: "என் சுயவிவரம்",
    logout: "வெளியேறு",
    loading: "ஏற்றுகிறது...",
    error: "தகவல் ஏற்றுவதில் பிழை",
    retry: "மீண்டும் முயற்சிக்கவும்"
  },
  ml: {
    title: "ആരോഗ്യ ഉദ്യോഗസ്ഥ ഡാഷ്ബോർഡ്",
    qrScan: "QR സ്കാനർ",
    workerManagement: "തൊഴിലാളി മാനേജ്മെന്റ്",
    reports: "റിപ്പോർട്ടുകൾ",
    documents: "രേഖകൾ",
    registrations: "രജിസ്ട്രേഷനുകൾ",
    notifications: "അറിയിപ്പുകൾ",
    profile: "എന്റെ പ്രൊഫൈൽ",
    logout: "പുറത്തുകടക്കുക",
    loading: "ലോഡ് ചെയ്യുന്നു...",
    error: "ഡാറ്റ ലോഡ് ചെയ്യുന്നതിൽ പിശക്",
    retry: "വീണ്ടും ശ്രമിക്കുക"
  }
};

export default function HealthOfficialHome() {
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState("home");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState({
    profile: false,
    notifications: false,
    workers: false
  });
  
  const [error, setError] = useState({
    profile: null,
    notifications: null,
    workers: null
  });

  // Data states
  const [officialProfile, setOfficialProfile] = useState(null);
  const [profileFormData, setProfileFormData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');

  // Form states
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    region: '',
    type: 'announcement'
  });

  // Initialize from sessionStorage
  useEffect(() => {
    const storedUser = sessionStorage.getItem('authUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setOfficialProfile(parsedUser);
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
    if (officialProfile) {
      switch (activeTab) {
        case 'notifications':
          loadNotifications();
          break;
        case 'workerManagement':
          loadWorkers();
          break;
        default:
          break;
      }
    }
  }, [activeTab, officialProfile]);

  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const setErrorState = (key, value) => {
    setError(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = async () => {
    try {
      await officialAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  const loadNotifications = async () => {
    setLoadingState('notifications', true);
    setErrorState('notifications', null);
    try {
      const response = await officialAPI.getNotifications();
      setNotifications(response);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setErrorState('notifications', 'Failed to load notifications');
    } finally {
      setLoadingState('notifications', false);
    }
  };

  const loadWorkers = async () => {
    if (!selectedRegion) return;
    
    setLoadingState('workers', true);
    setErrorState('workers', null);
    try {
      const response = await officialAPI.getWorkersByRegion(selectedRegion);
      setWorkers(response);
    } catch (error) {
      console.error('Error loading workers:', error);
      setErrorState('workers', 'Failed to load workers');
    } finally {
      setLoadingState('workers', false);
    }
  };

  const handleCreateNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      setErrorState('notifications', 'Title and message are required');
      return;
    }

    setLoadingState('notifications', true);
    try {
      const response = await officialAPI.createNotification(
        notificationForm.title,
        notificationForm.message,
        notificationForm.region || null,
        notificationForm.type
      );
      
      if (response.success || response.notification) {
        setShowNotificationForm(false);
        setNotificationForm({ title: '', message: '', region: '', type: 'announcement' });
        loadNotifications();
        setErrorState('notifications', null);
      } else {
        setErrorState('notifications', response.error || 'Failed to create notification');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      setErrorState('notifications', 'Failed to create notification');
    } finally {
      setLoadingState('notifications', false);
    }
  };

  const handleEditNotification = async () => {
    setLoadingState('notifications', true);
    try {
      const response = await officialAPI.updateNotification(editingNotification.id, notificationForm);
      
      if (response.success || response.notification) {
        setEditingNotification(null);
        setNotificationForm({ title: '', message: '', region: '', type: 'announcement' });
        loadNotifications();
        setErrorState('notifications', null);
      } else {
        setErrorState('notifications', response.error || 'Failed to update notification');
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      setErrorState('notifications', 'Failed to update notification');
    } finally {
      setLoadingState('notifications', false);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;

    setLoadingState('notifications', true);
    try {
      const response = await officialAPI.deleteNotification(id);
      
      if (response.success) {
        loadNotifications();
        setErrorState('notifications', null);
      } else {
        setErrorState('notifications', response.error || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      setErrorState('notifications', 'Failed to delete notification');
    } finally {
      setLoadingState('notifications', false);
    }
  };

  const handleProfileEdit = () => {
    setIsEditingProfile(true);
    setProfileFormData({ ...officialProfile });
  };

  const handleProfileSave = () => {
    setOfficialProfile({ ...profileFormData });
    sessionStorage.setItem('authUser', JSON.stringify(profileFormData));
    setIsEditingProfile(false);
  };

  const handleProfileCancel = () => {
    setProfileFormData({ ...officialProfile });
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

  // Notifications Management Component
  const NotificationsSection = () => {
    if (loading.notifications) return <LoadingSpinner />;
    if (error.notifications) return <ErrorMessage message={error.notifications} onRetry={loadNotifications} />;

    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1rem" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3>{t('notifications')}</h3>
          <button
            onClick={() => setShowNotificationForm(true)}
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
            {t('createNotification')}
          </button>
        </div>

        {/* Notification Form */}
        {(showNotificationForm || editingNotification) && (
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ marginBottom: '1rem' }}>
              {editingNotification ? t('editNotification') : t('createNotification')}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('notificationTitle')}</label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('notificationRegion')}</label>
                <select
                  value={notificationForm.region}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, region: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="">{t('allRegions')}</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('notificationType')}</label>
                <select
                  value={notificationForm.type}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="announcement">Announcement</option>
                  <option value="health_camp">Health Camp</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('notificationMessage')}</label>
              <textarea
                value={notificationForm.message}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                style={{ width: '100%', height: '100px', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={editingNotification ? handleEditNotification : handleCreateNotification}
                disabled={loading.notifications}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: loading.notifications ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading.notifications ? 'not-allowed' : 'pointer'
                }}
              >
                {loading.notifications ? t('loading') : t('save')}
              </button>
              <button
                onClick={() => {
                  setShowNotificationForm(false);
                  setEditingNotification(null);
                  setNotificationForm({ title: '', message: '', region: '', type: 'announcement' });
                }}
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

        {/* Notifications List */}
        {notifications && notifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map((notification, index) => (
              <div key={notification.id || index} style={{
                backgroundColor: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{notification.title}</h4>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      <span>Region: {notification.region || 'All Regions'}</span>
                      <span>Type: {notification.type}</span>
                      {notification.createdAt && (
                        <span>Created: {new Date(notification.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setEditingNotification(notification);
                        setNotificationForm({
                          title: notification.title,
                          message: notification.message,
                          region: notification.region || '',
                          type: notification.type
                        });
                      }}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p style={{ margin: '0', color: '#374151' }}>{notification.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>{t('noNotifications')}</p>
        )}
      </div>
    );
  };

  // Worker Management Component
  const WorkerManagementSection = () => (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
      <h3>{t('workerManagement')}</h3>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('selectRegion')}</label>
        <select
          value={selectedRegion}
          onChange={(e) => {
            setSelectedRegion(e.target.value);
            if (e.target.value) {
              loadWorkers();
            }
          }}
          style={{ width: '100%', maxWidth: '300px', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
        >
          <option value="">{t('selectRegion')}</option>
          <option value="Kerala">Kerala</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
          <option value="Karnataka">Karnataka</option>
        </select>
      </div>

      {loading.workers && <LoadingSpinner />}
      {error.workers && <ErrorMessage message={error.workers} onRetry={loadWorkers} />}

      {workers && workers.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {workers.map((worker, index) => (
            <div key={index} style={{
              backgroundColor: '#f8fafc',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>{worker.name}</h4>
              <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                ABHA: {worker.abhaNumber}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                Mobile: {worker.mobile}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                Region: {worker.region}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Profile Component (using existing structure)
  const ProfileSection = () => {
    if (!officialProfile) {
      return <p style={{ textAlign: 'center', color: '#6b7280' }}>No profile data available</p>;
    }

    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ color: "#1f2937", margin: 0 }}>{t('profile')}</h2>
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
                <p style={{ margin: 0, padding: "0.5rem 0" }}>{officialProfile.name || 'Not specified'}</p>
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
                <p style={{ margin: 0, padding: "0.5rem 0" }}>{officialProfile.mobile || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label style={{ display: "block", fontWeight: "500", marginBottom: "0.5rem" }}>
                Role
              </label>
              <p style={{ margin: 0, padding: "0.5rem 0" }}>{officialProfile.role || 'HEALTH_OFFICER'}</p>
            </div>
            <div>
              <label style={{ display: "block", fontWeight: "500", marginBottom: "0.5rem" }}>
                Username
              </label>
              <p style={{ margin: 0, padding: "0.5rem 0" }}>{officialProfile.username || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "qrScan":
        return (
          <div style={{ padding: "2rem", backgroundColor: "#f8fafc", borderRadius: "12px", margin: "2rem auto", maxWidth: "500px" }}>
            <h3>QR Code Scanner</h3>
            <div style={{ 
              width: "300px", 
              height: "300px", 
              backgroundColor: "#e5e7eb", 
              margin: "1rem auto", 
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280"
            }}>
              <QrCode size={64} />
              <span style={{ marginLeft: "1rem" }}>Scanner View</span>
            </div>
            <p>Point your camera at a patient's QR code to access their health records</p>
          </div>
        );
      case "workerManagement":
        return <WorkerManagementSection />;
      case "reports":
        return <p>📊 Reports will appear here</p>;
      case "documents":
        return <p>📄 Uploaded documents will appear here</p>;
      case "registrations":
        return <p>📝 New registrations will appear here</p>;
      case "notifications":
        return <NotificationsSection />;
      case "profile":
        return <ProfileSection />;
      default:
        return (
          <>
            <h2>Welcome, Health Official</h2>
            <p>Select an option from the navigation bar above to get started.</p>
            {officialProfile && (
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
                <p style={{ margin: 0 }}><strong>{officialProfile.name}</strong></p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151' }}>{officialProfile.mobile}</p>
              </div>
            )}
          </>
        );
    }
  };

  if (!officialProfile) {
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
          { key: "qrScan", icon: QrCode, color: "#10b981", label: t('qrScan') },
          { key: "profile", icon: User, color: "#3b82f6", label: t('profile') },
          { key: "workerManagement", icon: Users, color: "#10b981", label: t('workerManagement') },
          { key: "reports", icon: FileText, color: "#3b82f6", label: t('reports') },
          { key: "documents", icon: Download, color: "#6366f1", label: t('documents') },
          { key: "registrations", icon: CreditCard, color: "#8b5cf6", label: t('registrations') },
          { key: "notifications", icon: Bell, color: "#ef4444", label: t('notifications'), count: notifications.length }
        ].map(({ key, icon: Icon, color, label, count }) => (
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
              position: "relative"
            }}
            onClick={() => setActiveTab(key)}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e2e8f0")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = activeTab === key ? "#e2e8f0" : "transparent")}
          >
            <Icon size={24} style={{ marginBottom: "0.5rem", color }} />
            <span>{label}</span>
            {count > 0 && (
              <span style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                backgroundColor: "#ef4444",
                color: "white",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem"
              }}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: "2rem", textAlign: "center" }}>{renderContent()}</div>
    </div>
  );
}
