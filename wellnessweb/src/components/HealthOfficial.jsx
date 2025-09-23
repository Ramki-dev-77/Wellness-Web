import React, { useState, useEffect } from "react";
import {
  Bell,
  QrCode,
  User,
  Edit3,
  Save,
  X,
  LogOut,
  RefreshCw,
  Plus,
  Trash2,
  Search
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
  },

  searchMigrant: async (abhaNumber) => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8081/official/search/migrant/${abhaNumber}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  searchDoctor: async (healthPid) => {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8081/official/search/doctor/${healthPid}`, {
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
    search: "Search",
    searchMigrant: "Search Migrant",
    searchDoctor: "Search Doctor",
    abhaNumber: "ABHA Number",
    healthPid: "Health Professional ID",
    searchResults: "Search Results",
    migrantDetails: "Migrant Details",
    doctorDetails: "Doctor Details",
    noResultsFound: "No results found",
    searchPlaceholderMigrant: "Enter ABHA number to search migrant",
    searchPlaceholderDoctor: "Enter Health Professional ID to search doctor",
    clearSearch: "Clear Search",
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
    notifications: false
  });

  const [error, setError] = useState({
    profile: null,
    notifications: null
  });

  // Data states
  const [officialProfile, setOfficialProfile] = useState(null);
  const [profileFormData, setProfileFormData] = useState({});
  const [notifications, setNotifications] = useState([]);  // Form states
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    region: '',
    type: 'announcement'
  });

  // Search states
  const [searchForm, setSearchForm] = useState({
    migrantAbha: '',
    doctorHealthPid: ''
  });
  const [searchResults, setSearchResults] = useState({
    migrant: null,
    doctor: null
  });
  const [searchLoading, setSearchLoading] = useState({
    migrant: false,
    doctor: false
  });
  const [searchError, setSearchError] = useState({
    migrant: null,
    doctor: null
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
      if (response.success && response.notifications) {
        setNotifications(response.notifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setErrorState('notifications', 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoadingState('notifications', false);
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
        setErrorState('notifications', null);
        
        // Reload notifications to show the newly created one
        await loadNotifications();
      } else {
        setErrorState('notifications', response.error || 'Failed to create notification');
        setLoadingState('notifications', false);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      setErrorState('notifications', 'Failed to create notification');
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

  // Search handlers
  const handleSearchMigrant = async () => {
    if (!searchForm.migrantAbha.trim()) {
      setSearchError(prev => ({ ...prev, migrant: 'Please enter ABHA number' }));
      return;
    }

    setSearchLoading(prev => ({ ...prev, migrant: true }));
    setSearchError(prev => ({ ...prev, migrant: null }));

    try {
      const response = await officialAPI.searchMigrant(searchForm.migrantAbha.trim());
      
      if (response.success) {
        setSearchResults(prev => ({ ...prev, migrant: response.migrant }));
      } else {
        setSearchError(prev => ({ ...prev, migrant: response.error || 'Failed to search migrant' }));
        setSearchResults(prev => ({ ...prev, migrant: null }));
      }
    } catch (error) {
      console.error('Error searching migrant:', error);
      setSearchError(prev => ({ ...prev, migrant: 'Failed to search migrant' }));
      setSearchResults(prev => ({ ...prev, migrant: null }));
    } finally {
      setSearchLoading(prev => ({ ...prev, migrant: false }));
    }
  };

  const handleSearchDoctor = async () => {
    if (!searchForm.doctorHealthPid.trim()) {
      setSearchError(prev => ({ ...prev, doctor: 'Please enter Health Professional ID' }));
      return;
    }

    setSearchLoading(prev => ({ ...prev, doctor: true }));
    setSearchError(prev => ({ ...prev, doctor: null }));

    try {
      const response = await officialAPI.searchDoctor(searchForm.doctorHealthPid.trim());
      
      if (response.success) {
        setSearchResults(prev => ({ ...prev, doctor: response.doctor }));
      } else {
        setSearchError(prev => ({ ...prev, doctor: response.error || 'Failed to search doctor' }));
        setSearchResults(prev => ({ ...prev, doctor: null }));
      }
    } catch (error) {
      console.error('Error searching doctor:', error);
      setSearchError(prev => ({ ...prev, doctor: 'Failed to search doctor' }));
      setSearchResults(prev => ({ ...prev, doctor: null }));
    } finally {
      setSearchLoading(prev => ({ ...prev, doctor: false }));
    }
  };

  const handleClearSearch = (type) => {
    if (type === 'migrant') {
      setSearchForm(prev => ({ ...prev, migrantAbha: '' }));
      setSearchResults(prev => ({ ...prev, migrant: null }));
      setSearchError(prev => ({ ...prev, migrant: null }));
    } else if (type === 'doctor') {
      setSearchForm(prev => ({ ...prev, doctorHealthPid: '' }));
      setSearchResults(prev => ({ ...prev, doctor: null }));
      setSearchError(prev => ({ ...prev, doctor: null }));
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

  // Search Component
  const SearchSection = () => (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1rem" }}>
      {/* <h3>{t('search')}</h3> */}
      
      {/* Search Forms */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Migrant Search */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>{t('searchMigrant')}</h4>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('abhaNumber')}</label>
            <input
              type="text"
              value={searchForm.migrantAbha}
              onChange={(e) => setSearchForm(prev => ({ ...prev, migrantAbha: e.target.value }))}
              placeholder={t('searchPlaceholderMigrant')}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={handleSearchMigrant}
              disabled={searchLoading.migrant || !searchForm.migrantAbha.trim()}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: searchLoading.migrant ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: searchLoading.migrant || !searchForm.migrantAbha.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {searchLoading.migrant ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
              {searchLoading.migrant ? t('loading') : t('search')}
            </button>
            <button
              onClick={() => handleClearSearch('migrant')}
              style={{
                padding: '0.75rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Migrant Search Error */}
          {searchError.migrant && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '4px',
              padding: '0.75rem',
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              {searchError.migrant}
            </div>
          )}
          
          {/* Migrant Search Result */}
          {searchResults.migrant && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '4px',
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <h5 style={{ margin: '0 0 0.75rem 0', color: '#15803d' }}>{t('migrantDetails')}</h5>
              <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                <p style={{ margin: '0.25rem 0' }}><strong>Name:</strong> {searchResults.migrant.name}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>ABHA:</strong> {searchResults.migrant.abhaNumber}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>Mobile:</strong> {searchResults.migrant.mobile}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>Region:</strong> {searchResults.migrant.region}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>Role:</strong> {searchResults.migrant.role}</p>
                {searchResults.migrant.abhaAddress && (
                  <p style={{ margin: '0.25rem 0' }}><strong>ABHA Address:</strong> {searchResults.migrant.abhaAddress}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Doctor Search */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>{t('searchDoctor')}</h4>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('healthPid')}</label>
            <input
              type="text"
              value={searchForm.doctorHealthPid}
              onChange={(e) => setSearchForm(prev => ({ ...prev, doctorHealthPid: e.target.value }))}
              placeholder={t('searchPlaceholderDoctor')}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={handleSearchDoctor}
              disabled={searchLoading.doctor || !searchForm.doctorHealthPid.trim()}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: searchLoading.doctor ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: searchLoading.doctor || !searchForm.doctorHealthPid.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {searchLoading.doctor ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
              {searchLoading.doctor ? t('loading') : t('search')}
            </button>
            <button
              onClick={() => handleClearSearch('doctor')}
              style={{
                padding: '0.75rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
          
          {/* Doctor Search Error */}
          {searchError.doctor && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '4px',
              padding: '0.75rem',
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              {searchError.doctor}
            </div>
          )}
          
          {/* Doctor Search Result */}
          {searchResults.doctor && (
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '4px',
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <h5 style={{ margin: '0 0 0.75rem 0', color: '#1d4ed8' }}>{t('doctorDetails')}</h5>
              <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                <p style={{ margin: '0.25rem 0' }}><strong>Name:</strong> {searchResults.doctor.name}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>Health Professional ID:</strong> {searchResults.doctor.healthPid}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>Mobile:</strong> {searchResults.doctor.mobile}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>Region:</strong> {searchResults.doctor.region}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>Role:</strong> {searchResults.doctor.role}</p>
                {searchResults.doctor.abhaNumber && (
                  <p style={{ margin: '0.25rem 0' }}><strong>ABHA:</strong> {searchResults.doctor.abhaNumber}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Profile Component (migrant-style implementation)
  const ProfileSection = () => {
    if (!officialProfile) {
      return (
        <div style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "3rem",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
          }}>
            <User size={48} style={{ color: "#d1d5db", marginBottom: "1rem" }} />
            <p style={{ color: '#6b7280', margin: 0, fontSize: "1.1rem" }}>No profile data available</p>
          </div>
        </div>
      );
    }

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setProfileFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    return (
      <div style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        padding: "2rem"
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "16px",
          padding: "2rem",
          color: "white",
          marginBottom: "2rem",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: "1.75rem",
                fontWeight: "700"
              }}>
                {t('profile')}
              </h2>
              <p style={{
                margin: "0.5rem 0 0 0",
                opacity: 0.9
              }}>
                Manage your health official information
              </p>
            </div>
            
            {!isEditingProfile ? (
              <button
                onClick={handleProfileEdit}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  backdropFilter: "blur(10px)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                <Edit3 size={18} />
                {t('Edit Profile')}
              </button>
            ) : (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={handleProfileSave}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "rgba(16, 185, 129, 0.9)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "500",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(16, 185, 129, 1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "rgba(16, 185, 129, 0.9)"}
                >
                  <Save size={18} />
                  {t('Save')}
                </button>
                <button
                  onClick={handleProfileCancel}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "rgba(239, 68, 68, 0.9)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "500",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(239, 68, 68, 1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "rgba(239, 68, 68, 0.9)"}
                >
                  <X size={18} />
                  {t('Cancel')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "2rem",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {/* Profile Card */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            height: "fit-content",
            textAlign: "center"
          }}>
            {/* Profile Avatar */}
            <div style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem auto",
              fontSize: "3rem",
              fontWeight: "700",
              color: "white",
              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)"
            }}>
              {(officialProfile.name || "U").charAt(0).toUpperCase()}
            </div>

            <h3 style={{
              margin: "0 0 0.5rem 0",
              color: "#1f2937",
              fontSize: "1.5rem",
              fontWeight: "600"
            }}>
              {officialProfile.name || "Health Official"}
            </h3>

            <p style={{
              margin: "0 0 1rem 0",
              color: "#6b7280",
              fontSize: "1rem"
            }}>
              {officialProfile.username || "HOF001"}
            </p>

            {/* Status Badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#dcfce7",
              color: "#166534",
              borderRadius: "20px",
              fontSize: "0.875rem",
              fontWeight: "500",
              marginBottom: "1.5rem"
            }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#22c55e"
              }} />
              Active
            </div>

            {/* Quick Stats */}
            <div style={{
              padding: "1rem",
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem"
              }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Role</span>
                <span style={{ color: "#1f2937", fontWeight: "600" }}>
                  {officialProfile.role || "HEALTH_OFFICER"}
                </span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Department</span>
                <span style={{ color: "#1f2937", fontWeight: "600" }}>
                  {officialProfile.department || "Health Dept"}
                </span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{
              margin: "0 0 1.5rem 0",
              color: "#1f2937",
              fontSize: "1.25rem",
              fontWeight: "600",
              borderBottom: "2px solid #f3f4f6",
              paddingBottom: "0.75rem"
            }}>
              {t('Personal Details')}
            </h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem"
            }}>
              {/* Name Field */}
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#374151",
                  fontWeight: "500",
                  fontSize: "0.875rem"
                }}>
                  {t('Name')}
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    name="name"
                    value={profileFormData.name || ""}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#667eea"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                ) : (
                  <div style={{
                    padding: "0.75rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    color: "#1f2937",
                    border: "1px solid #e5e7eb"
                  }}>
                    {officialProfile.name || "Not provided"}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#374151",
                  fontWeight: "500",
                  fontSize: "0.875rem"
                }}>
                  {t('Email')}
                </label>
                {isEditingProfile ? (
                  <input
                    type="email"
                    name="mobile"
                    value={profileFormData.mobile || ""}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      transition: "border-color 0.2s",
                      outline: "none"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#667eea"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                ) : (
                  <div style={{
                    padding: "0.75rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    color: "#1f2937",
                    border: "1px solid #e5e7eb"
                  }}>
                    {officialProfile.mobile || "Not provided"}
                  </div>
                )}
              </div>

              {/* Username Field */}
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#374151",
                  fontWeight: "500",
                  fontSize: "0.875rem"
                }}>
                  Username
                </label>
                <div style={{
                  padding: "0.75rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  color: "#1f2937",
                  border: "1px solid #e5e7eb"
                }}>
                  {officialProfile.username || "Not provided"}
                </div>
              </div>

              {/* Role Field */}
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#374151",
                  fontWeight: "500",
                  fontSize: "0.875rem"
                }}>
                  Role
                </label>
                <div style={{
                  padding: "0.75rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  color: "#1f2937",
                  border: "1px solid #e5e7eb"
                }}>
                  {officialProfile.role || "HEALTH_OFFICER"}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div style={{ marginTop: "2rem" }}>
              <h3 style={{
                margin: "0 0 1rem 0",
                color: "#1f2937",
                fontSize: "1.25rem",
                fontWeight: "600",
                borderBottom: "2px solid #f3f4f6",
                paddingBottom: "0.75rem"
              }}>
                Official Information
              </h3>
              
              <div style={{
                padding: "1rem",
                backgroundColor: "#f0f9ff",
                borderRadius: "8px",
                border: "1px solid #0ea5e9"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem"
                }}>
                  <span style={{
                    color: "#374151",
                    fontWeight: "500",
                    fontSize: "0.875rem"
                  }}>
                    Official ID: 
                  </span>
                  <span style={{
                    color: "#1f2937",
                    marginLeft: "0.5rem"
                  }}>
                    {officialProfile.id || "N/A"}
                  </span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span style={{
                    color: "#374151",
                    fontWeight: "500",
                    fontSize: "0.875rem"
                  }}>
                    Department: 
                  </span>
                  <span style={{
                    color: "#1f2937",
                    marginLeft: "0.5rem"
                  }}>
                    {officialProfile.department || "Health Department"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      // case "qrScan":
      //   return (
      //     <div style={{ padding: "2rem", backgroundColor: "#f8fafc", borderRadius: "12px", margin: "2rem auto", maxWidth: "500px" }}>
      //       <h3>QR Code Scanner</h3>
      //       <div style={{ 
      //         width: "300px", 
      //         height: "300px", 
      //         backgroundColor: "#e5e7eb", 
      //         margin: "1rem auto", 
      //         borderRadius: "8px",
      //         display: "flex",
      //         alignItems: "center",
      //         justifyContent: "center",
      //         color: "#6b7280"
      //       }}>
      //         <QrCode size={64} />
      //         <span style={{ marginLeft: "1rem" }}>Scanner View</span>
      //       </div>
      //       <p>Point your camera at a patient's QR code to access their health records</p>
      //     </div>
      //   );
      case "search":
        return <SearchSection />;
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
          // { key: "qrScan", icon: QrCode, color: "#10b981", label: t('qrScan') },
          { key: "search", icon: Search, color: "#f59e0b", label: t('search') },
          { key: "profile", icon: User, color: "#3b82f6", label: t('profile') },
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
