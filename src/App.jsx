import React, { useState, useEffect, useRef } from 'react';

// Google Maps API Key - Replace with your own key
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// Load Google Maps Script
const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google);
      return;
    }
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Location Search Component with Google Places Autocomplete
const LocationSearchInput = ({ value, onChange, onPlaceSelected, placeholder, inputStyle }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        if (inputRef.current && window.google) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ['establishment', 'geocode'],
            fields: ['formatted_address', 'geometry', 'name', 'place_id']
          });
          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            if (place && place.geometry) {
              onPlaceSelected({
                name: place.name || place.formatted_address,
                address: place.formatted_address,
                placeId: place.place_id,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              });
            }
          });
        }
      })
      .catch(err => console.error('Failed to load Google Maps:', err));
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      style={inputStyle}
      placeholder={placeholder || "Search for a location..."}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

// Location Confirmation Modal with Map Preview
const LocationConfirmModal = ({ location, onConfirm, onCancel, onEdit }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (location && location.lat && location.lng && mapRef.current) {
      loadGoogleMapsScript().then(() => {
        const position = { lat: location.lat, lng: location.lng };
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: position,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });
        markerRef.current = new window.google.maps.Marker({
          position: position,
          map: mapInstanceRef.current,
          title: location.name
        });
      });
    }
  }, [location]);

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}&query_place_id=${location.placeId}`;
    window.open(url, '_blank');
  };

  return (
    <div style={locationConfirmStyles.modal}>
      <div style={locationConfirmStyles.modalContent}>
        <div style={locationConfirmStyles.modalHeader}>
          <h3 style={locationConfirmStyles.modalTitle}>Confirm Location</h3>
          <button style={locationConfirmStyles.modalClose} onClick={onCancel}>✕</button>
        </div>

        <div style={locationConfirmStyles.locationConfirmBox}>
          <div style={locationConfirmStyles.locationIcon}>📍</div>
          <div style={locationConfirmStyles.locationDetails}>
            <div style={locationConfirmStyles.locationName}>{location?.name}</div>
            <div style={locationConfirmStyles.locationAddress}>{location?.address}</div>
          </div>
        </div>

        <div ref={mapRef} style={locationConfirmStyles.mapPreview}></div>

        <button style={locationConfirmStyles.viewOnMapsBtn} onClick={openInGoogleMaps}>
          🗺️ View on Google Maps
        </button>

        <div style={locationConfirmStyles.locationConfirmText}>
          Is this the correct location?
        </div>

        <div style={locationConfirmStyles.locationConfirmButtons}>
          <button style={locationConfirmStyles.btnOutlineMedium} onClick={onEdit}>
            Change Location
          </button>
          <button style={locationConfirmStyles.btnPrimaryMedium} onClick={onConfirm}>
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

// Styles for location confirmation modal
const locationConfirmStyles = {
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 },
  modalContent: { background: 'white', borderRadius: 16, padding: 24, width: '90%', maxWidth: 400, maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 },
  modalClose: { background: '#f3f4f6', border: 'none', borderRadius: 20, width: 32, height: 32, cursor: 'pointer', fontSize: 16 },
  locationConfirmBox: { display: 'flex', alignItems: 'flex-start', gap: 12, background: '#f0fdf4', borderRadius: 12, padding: 16, marginBottom: 16 },
  locationIcon: { fontSize: 24 },
  locationDetails: { flex: 1 },
  locationName: { fontWeight: 600, color: '#1f2937', fontSize: 16 },
  locationAddress: { color: '#6b7280', fontSize: 14, marginTop: 4 },
  mapPreview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16, background: '#e5e7eb' },
  viewOnMapsBtn: { width: '100%', padding: '12px', fontSize: 14, fontWeight: 500, background: '#f3f4f6', color: '#1f2937', border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: 16 },
  locationConfirmText: { textAlign: 'center', color: '#6b7280', fontSize: 14, marginBottom: 16 },
  locationConfirmButtons: { display: 'flex', gap: 12 },
  btnOutlineMedium: { flex: 1, padding: '12px', fontSize: 14, fontWeight: 600, background: 'white', color: '#16a34a', border: '2px solid #16a34a', borderRadius: 10, cursor: 'pointer' },
  btnPrimaryMedium: { flex: 1, padding: '12px', fontSize: 14, fontWeight: 600, background: '#16a34a', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer' }
};

// ==================== IN-MEMORY DATABASE (No external calls) ====================
const createInitialDB = () => ({
  users: [
    { id: 'coach-1', email: 'coach@teamkick.com', password: 'password123', name: 'Coach Mike', isCoach: true, teamId: 'team-1' }
  ],
  teams: [
    { id: 'team-1', name: 'Cary Lightning', code: 'LIGHT-2025', ageGroup: 'U10', coachId: 'coach-1' }
  ],
  players: [
    { id: 'player-1', name: 'Emma Wilson', parentId: 'parent-1', teamId: 'team-1', jersey: 7 },
    { id: 'player-2', name: 'Liam Chen', parentId: 'parent-2', teamId: 'team-1', jersey: 10 },
    { id: 'player-3', name: 'Olivia Martinez', parentId: 'parent-3', teamId: 'team-1', jersey: 3 },
    { id: 'player-4', name: 'Noah Johnson', parentId: 'parent-4', teamId: 'team-1', jersey: 5 },
    { id: 'player-5', name: 'Ava Thompson', parentId: 'parent-5', teamId: 'team-1', jersey: 11 },
    { id: 'player-6', name: 'Mason Davis', parentId: 'parent-6', teamId: 'team-1', jersey: 9 },
  ],
  parents: [
    { id: 'parent-1', name: 'Sarah Wilson', email: 'sarah@email.com', canDrive: true, seats: 3, teamId: 'team-1' },
    { id: 'parent-2', name: 'David Chen', email: 'david@email.com', canDrive: true, seats: 4, teamId: 'team-1' },
    { id: 'parent-3', name: 'Maria Martinez', email: 'maria@email.com', canDrive: true, seats: 2, teamId: 'team-1' },
    { id: 'parent-4', name: 'Mike Johnson', email: 'mike@email.com', canDrive: false, seats: 0, teamId: 'team-1' },
    { id: 'parent-5', name: 'Jen Thompson', email: 'jen@email.com', canDrive: true, seats: 3, teamId: 'team-1' },
    { id: 'parent-6', name: 'Chris Davis', email: 'chris@email.com', canDrive: true, seats: 4, teamId: 'team-1' },
  ],
  chats: [
    { id: 'chat-team-1', teamId: 'team-1', name: 'Team Chat', type: 'team', icon: '💬' },
    { id: 'chat-carpool-1', teamId: 'team-1', name: 'Carpool Coordination', type: 'carpool', icon: '🚗' },
    { id: 'chat-coaches-1', teamId: 'team-1', name: 'Coaches Only', type: 'coaches', icon: '🏆' },
  ],
  messages: [
    { id: 'msg-1', chatId: 'chat-team-1', senderId: 'coach-1', senderName: 'Coach Mike', text: 'Great practice today everyone! Remember to bring water bottles Saturday.', isCoach: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'msg-2', chatId: 'chat-team-1', senderId: 'parent-1', senderName: 'Sarah Wilson', text: 'Thanks coach! Emma is excited for the game!', isCoach: false, createdAt: new Date(Date.now() - 3000000).toISOString() },
    { id: 'msg-3', chatId: 'chat-team-1', senderId: 'parent-2', senderName: 'David Chen', text: 'I can bring extra oranges for halftime', isCoach: false, createdAt: new Date(Date.now() - 2400000).toISOString() },
    { id: 'msg-4', chatId: 'chat-carpool-1', senderId: 'coach-1', senderName: 'Coach Mike', text: "Who needs rides to Saturday's game?", isCoach: true, createdAt: new Date(Date.now() - 1800000).toISOString() },
    { id: 'msg-5', chatId: 'chat-carpool-1', senderId: 'parent-4', senderName: 'Mike Johnson', text: 'Noah needs a ride - we have a conflict', isCoach: false, createdAt: new Date(Date.now() - 1200000).toISOString() },
  ],
  events: [
    { id: 'event-1', teamId: 'team-1', type: 'game', title: 'vs Thunder FC', date: '2025-12-06', time: '10:00 AM', location: 'North Fields Complex', field: 'Field 3', arriveBy: '9:15 AM', needsSnacks: true },
    { id: 'event-2', teamId: 'team-1', type: 'practice', title: 'Practice', date: '2025-12-03', time: '5:30 PM', location: 'Community Park', field: 'Field A', arriveBy: '5:15 PM', needsSnacks: false },
    { id: 'event-3', teamId: 'team-1', type: 'practice', title: 'Practice', date: '2025-12-05', time: '5:30 PM', location: 'Community Park', field: 'Field A', arriveBy: '5:15 PM', needsSnacks: false },
    { id: 'event-4', teamId: 'team-1', type: 'game', title: 'vs Lightning', date: '2025-12-13', time: '2:00 PM', location: 'Riverside Soccer Complex', field: 'Field 7', arriveBy: '1:15 PM', needsSnacks: true },
  ],
  carpools: [
    { id: 'carpool-1', eventId: 'event-1', driverId: 'parent-1', driverName: 'Sarah Wilson', seats: 3, passengers: ['Liam Chen', 'Noah Johnson'] },
    { id: 'carpool-2', eventId: 'event-1', driverId: 'parent-2', driverName: 'David Chen', seats: 4, passengers: ['Olivia Martinez'] },
  ],
  carpoolGroups: [
    { id: 'cgroup-1', teamId: 'team-1', creatorId: 'parent-1', creatorName: 'Sarah Wilson', name: 'North Side Neighbors', type: 'private', memberIds: ['parent-1', 'parent-2', 'parent-3'], seats: 3, description: 'For families living in north side', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'cgroup-2', teamId: 'team-1', creatorId: 'parent-5', creatorName: 'Jen Thompson', name: 'General Carpool - Jen', type: 'public', memberIds: [], seats: 3, description: 'Available for anyone who needs a ride', createdAt: new Date(Date.now() - 43200000).toISOString() },
  ],
  duties: [
    { id: 'duty-1', eventId: 'event-1', type: 'snacks', assignedTo: 'Sarah Wilson', assignedId: 'parent-1' },
    { id: 'duty-2', eventId: 'event-1', type: 'drinks', assignedTo: 'David Chen', assignedId: 'parent-2' },
    { id: 'duty-3', eventId: 'event-4', type: 'snacks', assignedTo: null, assignedId: null },
    { id: 'duty-4', eventId: 'event-4', type: 'drinks', assignedTo: 'Maria Martinez', assignedId: 'parent-3' },
  ],
  notifications: [
    { id: 'notif-1', teamId: 'team-1', type: 'game', title: 'Game Tomorrow', message: 'vs Thunder FC at 10:00 AM', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'notif-2', teamId: 'team-1', type: 'carpool', title: 'Carpool Request', message: 'Noah Johnson needs a ride Saturday', read: false, createdAt: new Date(Date.now() - 10800000).toISOString() },
  ],
});

const uuid = () => 'id-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
const formatDate = (dateStr) => new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const getMonthDay = (dateStr) => { const d = new Date(dateStr + 'T12:00:00'); return { month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(), day: d.getDate() }; };
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const getRelativeTime = (dateStr) => { const m = Math.floor((Date.now() - new Date(dateStr)) / 60000); if (m < 1) return 'Just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; };

const WelcomeScreen = ({ onSignIn, onCreateAccount }) => (
  <div style={styles.authContainer}>
    <div style={styles.welcomeContent}>
      <div style={styles.welcomeLogo}>⚽</div>
      <h1 style={styles.welcomeTitle}>TeamKick</h1>
      <p style={styles.welcomeSubtitle}>Youth soccer coordination made simple</p>
      <div style={styles.featureList}>{[['📅', 'Schedule games & practices'], ['🚗', 'Coordinate carpools'], ['💬', 'Team group chats'], ['👥', 'Connect with parents']].map(([i, t]) => <div key={t} style={styles.featureItem}><span style={styles.featureIcon}>{i}</span><span>{t}</span></div>)}</div>
    </div>
    <div style={styles.welcomeButtons}><button style={styles.btnPrimaryLarge} onClick={onSignIn}>Sign In</button><button style={styles.btnOutlineLarge} onClick={onCreateAccount}>Create Account</button></div>
  </div>
);

const SignInScreen = ({ onBack, onSignIn, onForgotPassword, onCreateAccount, db }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCoach, setIsCoach] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = () => {
    setError('');
    if (!email) { setError('Please enter your email'); return; }
    if (!password) { setError('Please enter your password'); return; }
    const user = db.users.find(u => u.email === email);
    if (!user || user.password !== password) { setError('Invalid email or password'); return; }
    if (user.isCoach !== isCoach) { setError(`This account is registered as a ${user.isCoach ? 'coach' : 'parent'}`); return; }
    onSignIn(user);
  };
  return (
    <div style={styles.authContainer}>
      <div style={styles.authHeader}><button style={styles.backBtn} onClick={onBack}>← Back</button></div>
      <div style={styles.authContent}>
        <div style={styles.authLogo}>⚽</div>
        <h1 style={styles.authTitle}>Welcome back!</h1>
        <p style={styles.authSubtitle}>Sign in to your TeamKick account</p>
        {error && <div style={styles.errorBox}>{error}</div>}
        <div style={styles.roleToggle}><button style={{...styles.roleBtn, ...(!isCoach && styles.roleBtnActive)}} onClick={() => setIsCoach(false)}><span style={styles.roleIcon}>👨‍👩‍👧</span><span>Parent</span></button><button style={{...styles.roleBtn, ...(isCoach && styles.roleBtnActive)}} onClick={() => setIsCoach(true)}><span style={styles.roleIcon}>🏆</span><span>Coach</span></button></div>
        <div style={styles.inputGroup}><label style={styles.inputLabel}>Email</label><input type="email" style={styles.input} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div style={styles.inputGroup}><label style={styles.inputLabel}>Password</label><input type="password" style={styles.input} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button style={styles.forgotLink} onClick={onForgotPassword}>Forgot password?</button>
        <button style={styles.btnPrimaryLarge} onClick={handleSubmit}>Sign In as {isCoach ? 'Coach' : 'Parent'}</button>
        <div style={styles.demoBox}><div style={styles.demoTitle}>🔑 Demo Credentials</div><div style={styles.demoText}>Coach: coach@teamkick.com / password123</div><div style={styles.demoText}>Team Code: LIGHT-2025</div></div>
      </div>
      <div style={styles.authFooter}><span style={styles.footerText}>Don't have an account?</span><button style={styles.footerLink} onClick={onCreateAccount}>Create one</button></div>
    </div>
  );
};

const CreateAccountScreen = ({ onBack, onCreateAccount, onSignIn, db, setDb }) => {
  const [step, setStep] = useState(1);
  const [isCoach, setIsCoach] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', childName: '', teamName: '', ageGroup: 'U10', teamCode: '', canDrive: false, seats: '' });
  const [error, setError] = useState('');
  const update = (k, v) => setForm({ ...form, [k]: v });
  const handleStep1 = () => { setError(''); if (!form.name) { setError('Please enter your name'); return; } if (!form.email) { setError('Please enter your email'); return; } if (db.users.find(u => u.email === form.email)) { setError('Email already registered'); return; } if (!form.password || form.password.length < 6) { setError('Password must be at least 6 characters'); return; } if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; } setStep(2); };
  const handleStep2 = () => {
    setError('');
    const newDb = { ...db };
    if (isCoach) {
      if (!form.teamName) { setError('Please enter your team name'); return; }
      const teamId = uuid(), userId = uuid();
      const code = form.teamName.substring(0, 5).toUpperCase() + '-' + new Date().getFullYear();
      newDb.teams = [...db.teams, { id: teamId, name: form.teamName, code, ageGroup: form.ageGroup, coachId: userId }];
      newDb.chats = [...db.chats, { id: `chat-team-${teamId}`, teamId, name: 'Team Chat', type: 'team', icon: '💬' }, { id: `chat-carpool-${teamId}`, teamId, name: 'Carpool Coordination', type: 'carpool', icon: '🚗' }, { id: `chat-coaches-${teamId}`, teamId, name: 'Coaches Only', type: 'coaches', icon: '🏆' }];
      const user = { id: userId, email: form.email, password: form.password, name: form.name, isCoach: true, teamId };
      newDb.users = [...db.users, user];
      setDb(newDb);
      onCreateAccount(user);
    } else {
      if (!form.childName) { setError("Please enter your child's name"); return; }
      if (!form.teamCode) { setError('Please enter your team code'); return; }
      const team = db.teams.find(t => t.code === form.teamCode);
      if (!team) { setError('Invalid team code'); return; }
      const userId = uuid(), parentId = uuid();
      newDb.parents = [...db.parents, { id: parentId, name: form.name, email: form.email, canDrive: form.canDrive, seats: parseInt(form.seats) || 0, teamId: team.id }];
      newDb.players = [...db.players, { id: uuid(), name: form.childName, parentId, teamId: team.id, jersey: null }];
      const user = { id: userId, email: form.email, password: form.password, name: form.name, isCoach: false, teamId: team.id, parentId };
      newDb.users = [...db.users, user];
      setDb(newDb);
      onCreateAccount(user);
    }
  };
  return (
    <div style={styles.authContainer}>
      <div style={styles.authHeader}><button style={styles.backBtn} onClick={step === 1 ? onBack : () => setStep(1)}>← Back</button><div style={styles.stepIndicator}><div style={{...styles.stepDot, background: '#16a34a'}}></div><div style={{...styles.stepLine, background: step >= 2 ? '#16a34a' : '#e5e7eb'}}></div><div style={{...styles.stepDot, background: step >= 2 ? '#16a34a' : '#e5e7eb'}}></div></div></div>
      <div style={styles.authContent}>
        {step === 1 ? (<><h1 style={styles.authTitle}>Create your account</h1><p style={styles.authSubtitle}>Join TeamKick to coordinate with your team</p>{error && <div style={styles.errorBox}>{error}</div>}<div style={styles.roleToggle}><button style={{...styles.roleBtn, ...(!isCoach && styles.roleBtnActive)}} onClick={() => setIsCoach(false)}><span style={styles.roleIcon}>👨‍👩‍👧</span><span>Parent</span></button><button style={{...styles.roleBtn, ...(isCoach && styles.roleBtnActive)}} onClick={() => setIsCoach(true)}><span style={styles.roleIcon}>🏆</span><span>Coach</span></button></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Your Name</label><input type="text" style={styles.input} placeholder="Sarah Wilson" value={form.name} onChange={(e) => update('name', e.target.value)} /></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Email</label><input type="email" style={styles.input} placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} /></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Password</label><input type="password" style={styles.input} placeholder="At least 6 characters" value={form.password} onChange={(e) => update('password', e.target.value)} /></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Confirm Password</label><input type="password" style={styles.input} placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} /></div><button style={styles.btnPrimaryLarge} onClick={handleStep1}>Continue</button></>) : (<><h1 style={styles.authTitle}>{isCoach ? 'Set Up Your Team' : 'Team Details'}</h1><p style={styles.authSubtitle}>{isCoach ? 'Create your team and invite parents' : 'Tell us about your player'}</p>{error && <div style={styles.errorBox}>{error}</div>}{isCoach ? (<><div style={styles.inputGroup}><label style={styles.inputLabel}>Team Name</label><input type="text" style={styles.input} placeholder="Cary Lightning" value={form.teamName} onChange={(e) => update('teamName', e.target.value)} /></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Age Group</label><select style={styles.input} value={form.ageGroup} onChange={(e) => update('ageGroup', e.target.value)}>{['U6','U8','U10','U12','U14','U16'].map(g => <option key={g} value={g}>{g}</option>)}</select></div></>) : (<><div style={styles.inputGroup}><label style={styles.inputLabel}>Child's Name</label><input type="text" style={styles.input} placeholder="Emma Wilson" value={form.childName} onChange={(e) => update('childName', e.target.value)} /></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Team Code</label><input type="text" style={styles.input} placeholder="LIGHT-2025" value={form.teamCode} onChange={(e) => update('teamCode', e.target.value)} /><span style={styles.inputHint}>Ask your coach for the team code</span></div><div style={styles.checkboxGroup}><label style={styles.checkboxLabel}><input type="checkbox" checked={form.canDrive} onChange={(e) => update('canDrive', e.target.checked)} style={styles.checkbox} /><span>I can help with carpools</span></label></div>{form.canDrive && <div style={styles.inputGroup}><label style={styles.inputLabel}>Available Seats</label><input type="number" style={styles.input} placeholder="3" value={form.seats} onChange={(e) => update('seats', e.target.value)} /></div>}</>)}<button style={styles.btnPrimaryLarge} onClick={handleStep2}>{isCoach ? 'Create Team' : 'Join Team'}</button></>)}
      </div>
      <div style={styles.authFooter}><span style={styles.footerText}>Already have an account?</span><button style={styles.footerLink} onClick={onSignIn}>Sign in</button></div>
    </div>
  );
};

const ForgotPasswordScreen = ({ onBack }) => { const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); return (<div style={styles.authContainer}><div style={styles.authHeader}><button style={styles.backBtn} onClick={onBack}>← Back</button></div><div style={styles.authContent}>{sent ? (<><div style={styles.successIcon}>✉️</div><h1 style={styles.authTitle}>Check your email</h1><p style={styles.authSubtitle}>We sent a reset link to <strong>{email}</strong></p><button style={styles.btnPrimaryLarge} onClick={onBack}>Back to Sign In</button></>) : (<><div style={styles.authLogo}>🔐</div><h1 style={styles.authTitle}>Forgot password?</h1><p style={styles.authSubtitle}>We'll send you reset instructions</p><div style={styles.inputGroup}><label style={styles.inputLabel}>Email</label><input type="email" style={styles.input} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div><button style={styles.btnPrimaryLarge} onClick={() => email && setSent(true)}>Send Reset Link</button></>)}</div></div>); };

const ToastNotification = ({ notification, onDismiss }) => { useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, [onDismiss]); const icons = { game: '⚽', carpool: '🚗', volunteer: '🍎', announcement: '📢', reminder: '⏰', chat: '💬' }; return (<div style={styles.toast} onClick={onDismiss}><div style={styles.toastIcon}>{icons[notification.type] || '🔔'}</div><div style={styles.toastContent}><div style={styles.toastTitle}>{notification.title}</div><div style={styles.toastMessage}>{notification.message}</div></div><button style={styles.toastClose}>✕</button></div>); };

const NotificationBell = ({ count, onClick }) => (<button style={styles.bellButton} onClick={onClick}><span style={styles.bellIcon}>🔔</span>{count > 0 && <span style={styles.bellBadge}>{count > 9 ? '9+' : count}</span>}</button>);

const NotificationsScreen = ({ notifications, onMarkRead, onMarkAllRead, onBack }) => { const icons = { game: '⚽', carpool: '🚗', volunteer: '🍎', announcement: '📢', reminder: '⏰', chat: '💬' }; const colors = { game: '#ffedd5', carpool: '#dbeafe', volunteer: '#fef3c7', announcement: '#dcfce7', reminder: '#f3e8ff', chat: '#e0e7ff' }; return (<div style={styles.notificationsContainer}><div style={styles.notificationsHeader}><button style={styles.backBtn} onClick={onBack}>← Back</button><h2 style={styles.notificationsTitle}>Notifications</h2><div style={{width:40}}></div></div>{notifications.length > 0 && <div style={styles.notificationsActions}><button style={styles.actionLink} onClick={onMarkAllRead}>Mark all read</button></div>}<div style={styles.notificationsList}>{notifications.length === 0 ? (<div style={styles.emptyNotifications}><div style={styles.emptyIcon}>🔔</div><div style={styles.emptyTitle}>No notifications</div><div style={styles.emptySubtitle}>You're all caught up!</div></div>) : notifications.map(n => (<div key={n.id} style={{...styles.notificationItem, background: n.read ? 'white' : '#f0fdf4'}} onClick={() => onMarkRead(n.id)}><div style={{...styles.notificationIcon, background: colors[n.type] || '#f3f4f6'}}>{icons[n.type] || '🔔'}</div><div style={styles.notificationContent}><div style={styles.notificationItemTitle}>{n.title}</div><div style={styles.notificationMessage}>{n.message}</div><div style={styles.notificationTime}>{getRelativeTime(n.createdAt)}</div></div>{!n.read && <div style={styles.unreadDot}></div>}</div>))}</div></div>); };

const ChatScreen = ({ user, chat, messages, onSendMessage, onBack }) => {
  const [newMessage, setNewMessage] = useState('');
  const chatMessages = messages.filter(m => m.chatId === chat.id).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const sendMessage = () => { if (!newMessage.trim()) return; onSendMessage(chat.id, newMessage); setNewMessage(''); };
  return (<div style={styles.chatContainer}><div style={styles.chatHeader}><button style={styles.backBtn} onClick={onBack}>← Back</button><div style={styles.chatHeaderInfo}><div style={styles.chatHeaderTitle}>{chat.name}</div><div style={styles.chatHeaderSub}>{chatMessages.length} messages</div></div></div><div style={styles.chatMessages}>{chatMessages.length === 0 ? <div style={styles.emptyChat}>No messages yet. Start the conversation!</div> : chatMessages.map(msg => (<div key={msg.id} style={{...styles.messageWrapper, justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start'}}><div style={{...styles.messageBubble, ...(msg.senderId === user.id ? styles.myMessage : styles.otherMessage)}}>{msg.senderId !== user.id && <div style={{...styles.messageSender, color: msg.isCoach ? '#16a34a' : '#6b7280'}}>{msg.senderName} {msg.isCoach && '🏆'}</div>}<div style={styles.messageText}>{msg.text}</div><div style={styles.messageTime}>{formatTime(msg.createdAt)}</div></div></div>))}</div><div style={styles.chatInput}><input type="text" style={styles.chatInputField} placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} /><button style={styles.chatSendBtn} onClick={sendMessage}>Send</button></div></div>);
};

const CoachDashboard = ({ user, db, setDb, onLogout }) => {
  const [tab, setTab] = useState('home');
  const [showChat, setShowChat] = useState(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showSendPush, setShowSendPush] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', parent: '', email: '', jersey: '' });
  const [newEvent, setNewEvent] = useState({ type: 'practice', title: '', date: '', time: '', location: '' });
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushType, setPushType] = useState('announcement');
  const [toast, setToast] = useState(null);

  // Location validation states
  const [locationInput, setLocationInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const [locationError, setLocationError] = useState('');

  const team = db.teams.find(t => t.id === user.teamId);
  const roster = db.players.filter(p => p.teamId === user.teamId).map(p => ({ ...p, parent: db.parents.find(x => x.id === p.parentId)?.name || 'Unknown', email: db.parents.find(x => x.id === p.parentId)?.email || '' }));
  const events = db.events.filter(e => e.teamId === user.teamId).sort((a, b) => new Date(a.date) - new Date(b.date));
  const chats = db.chats.filter(c => c.teamId === user.teamId).map(c => ({ ...c, messageCount: db.messages.filter(m => m.chatId === c.id).length, lastMessage: db.messages.filter(m => m.chatId === c.id).slice(-1)[0]?.text || '' }));
  const notifications = db.notifications.filter(n => n.teamId === user.teamId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const unreadCount = notifications.filter(n => !n.read).length;

  const addPlayer = () => { if (!newPlayer.name || !newPlayer.parent) return; const parentId = uuid(); setDb({ ...db, parents: [...db.parents, { id: parentId, name: newPlayer.parent, email: newPlayer.email, canDrive: false, seats: 0, teamId: user.teamId }], players: [...db.players, { id: uuid(), name: newPlayer.name, parentId, teamId: user.teamId, jersey: parseInt(newPlayer.jersey) || null }] }); setNewPlayer({ name: '', parent: '', email: '', jersey: '' }); setShowAddPlayer(false); setToast({ type: 'announcement', title: 'Player Added', message: `${newPlayer.name} added to roster` }); };
  const removePlayer = (id) => { const p = db.players.find(x => x.id === id); if (p) setDb({ ...db, players: db.players.filter(x => x.id !== id), parents: db.parents.filter(x => x.id !== p.parentId) }); };

  // Handle place selection from Google Maps autocomplete
  const handlePlaceSelected = (place) => {
    setSelectedLocation(place);
    setLocationInput(place.name);
    setLocationError('');
    setShowLocationConfirm(true);
  };

  // Confirm the selected location
  const confirmLocation = () => {
    if (selectedLocation) {
      setNewEvent({ ...newEvent, location: selectedLocation.name, locationData: selectedLocation });
      setShowLocationConfirm(false);
    }
  };

  // Cancel location selection
  const cancelLocationConfirm = () => {
    setShowLocationConfirm(false);
  };

  // Edit location (go back to search)
  const editLocation = () => {
    setShowLocationConfirm(false);
    setSelectedLocation(null);
    setLocationInput('');
  };

  // Modified addEvent to require validated location
  const addEvent = () => {
    if (!newEvent.date || !newEvent.time) {
      setLocationError('Please fill in all required fields');
      return;
    }
    if (!selectedLocation) {
      setLocationError('Please select a valid location from Google Maps');
      return;
    }
    const e = {
      id: uuid(),
      teamId: user.teamId,
      type: newEvent.type,
      title: newEvent.type === 'game' ? (newEvent.title || 'Game') : 'Practice',
      date: newEvent.date,
      time: newEvent.time,
      location: selectedLocation.name,
      locationAddress: selectedLocation.address,
      locationPlaceId: selectedLocation.placeId,
      locationLat: selectedLocation.lat,
      locationLng: selectedLocation.lng,
      field: '',
      arriveBy: newEvent.time,
      needsSnacks: newEvent.type === 'game'
    };
    const newDuties = newEvent.type === 'game' ? [{ id: uuid(), eventId: e.id, type: 'snacks', assignedTo: null, assignedId: null }, { id: uuid(), eventId: e.id, type: 'drinks', assignedTo: null, assignedId: null }] : [];
    setDb({ ...db, events: [...db.events, e], duties: [...db.duties, ...newDuties] });
    setNewEvent({ type: 'practice', title: '', date: '', time: '', location: '' });
    setLocationInput('');
    setSelectedLocation(null);
    setLocationError('');
    setShowAddEvent(false);
    setToast({ type: 'game', title: 'Event Created', message: `${e.title} on ${formatDate(e.date)}` });
  };

  const sendPush = () => { if (!pushTitle || !pushMessage) return; setDb({ ...db, notifications: [...db.notifications, { id: uuid(), teamId: user.teamId, type: pushType, title: pushTitle, message: pushMessage, read: false, createdAt: new Date().toISOString() }] }); setPushTitle(''); setPushMessage(''); setShowSendPush(false); setToast({ type: pushType, title: 'Notification Sent', message: `Sent to ${roster.length} players` }); };
  const markRead = (id) => setDb({ ...db, notifications: db.notifications.map(n => n.id === id ? { ...n, read: true } : n) });
  const markAllRead = () => setDb({ ...db, notifications: db.notifications.map(n => n.teamId === user.teamId ? { ...n, read: true } : n) });
  const sendMessage = (chatId, text) => setDb({ ...db, messages: [...db.messages, { id: uuid(), chatId, senderId: user.id, senderName: user.name, text, isCoach: true, createdAt: new Date().toISOString() }] });

  if (showNotifications) return <NotificationsScreen notifications={notifications} onMarkRead={markRead} onMarkAllRead={markAllRead} onBack={() => setShowNotifications(false)} />;
  if (showChat) return <ChatScreen user={user} chat={showChat} messages={db.messages} onSendMessage={sendMessage} onBack={() => setShowChat(null)} />;

  return (
    <div style={styles.app}>
      <div style={styles.header}><span style={styles.logo}>TeamKick</span><div style={styles.coachBadge}>🏆 Coach</div><div style={styles.headerActions}><NotificationBell count={unreadCount} onClick={() => setShowNotifications(true)} /><span style={styles.headerRight} onClick={onLogout}>👤</span></div></div>
      <div style={styles.content}>
        {tab === 'home' && (<><div style={styles.coachHero}><h2 style={styles.heroTitle}>{team?.name} {team?.ageGroup}</h2><p style={styles.heroSubtitle}>Team Code: <strong>{team?.code}</strong></p><div style={styles.statsRow}><div style={styles.statBox}><div style={styles.statNumber}>{roster.length}</div><div style={styles.statLabel}>Players</div></div><div style={styles.statBox}><div style={styles.statNumber}>{events.length}</div><div style={styles.statLabel}>Events</div></div></div></div><h3 style={styles.sectionTitle}>Quick Actions</h3><div style={styles.quickActions}><button style={styles.quickActionBtn} onClick={() => setShowSendPush(true)}><span style={styles.quickActionIcon}>🔔</span><span>Push</span></button><button style={styles.quickActionBtn} onClick={() => setShowAddEvent(true)}><span style={styles.quickActionIcon}>📅</span><span>Event</span></button><button style={styles.quickActionBtn} onClick={() => setShowInvite(true)}><span style={styles.quickActionIcon}>✉️</span><span>Invite</span></button><button style={styles.quickActionBtn} onClick={() => setShowAddPlayer(true)}><span style={styles.quickActionIcon}>➕</span><span>Player</span></button></div><h3 style={styles.sectionTitle}>Upcoming Events</h3>{events.slice(0, 3).map(e => (<div key={e.id} style={styles.eventCard}><div style={styles.eventRow}><div style={{...styles.eventIcon, background: e.type === 'game' ? '#ffedd5' : '#dbeafe'}}>{e.type === 'game' ? '⚽' : '🏃'}</div><div style={styles.eventInfo}><div style={styles.eventTitle}>{e.title}</div><div style={styles.eventMeta}>{formatDate(e.date)} • {e.time}</div></div></div></div>))}</>)}
        {tab === 'team' && (<><div style={styles.pageHeader}><h2 style={styles.pageTitle}>Team Roster</h2><button style={styles.btnPrimary} onClick={() => setShowAddPlayer(true)}>+ Add</button></div>{roster.map(p => (<div key={p.id} style={styles.rosterCardCoach}><div style={styles.jerseyBadge}>#{p.jersey || '?'}</div><div style={styles.playerInfo}><div style={styles.playerName}>{p.name}</div><div style={styles.parentName}>{p.parent}</div><div style={styles.playerContact}>{p.email}</div></div><button style={styles.removeBtn} onClick={() => removePlayer(p.id)}>✕</button></div>))}</>)}
        {tab === 'schedule' && (<><div style={styles.pageHeader}><h2 style={styles.pageTitle}>Schedule</h2><button style={styles.btnPrimary} onClick={() => setShowAddEvent(true)}>+ Add</button></div>{events.map(e => { const { month, day } = getMonthDay(e.date); return (<div key={e.id} style={styles.scheduleCard}><div style={styles.dateBox}><div style={styles.dateMonth}>{month}</div><div style={styles.dateDay}>{day}</div></div><div style={{flex: 1}}><span style={{...styles.typeBadgeSmall, background: e.type === 'game' ? '#fed7aa' : '#bfdbfe', color: e.type === 'game' ? '#c2410c' : '#1d4ed8'}}>{e.type}</span><div style={{...styles.eventTitle, marginTop: 4}}>{e.title}</div><div style={styles.eventMeta}>{e.time} • {e.location}</div></div></div>); })}</>)}
        {tab === 'chat' && (<><h2 style={styles.pageTitle}>Group Chats</h2><div style={styles.chatList}>{chats.map(c => (<div key={c.id} style={styles.chatListItem} onClick={() => setShowChat(c)}><div style={styles.chatListIcon}>{c.icon}</div><div style={styles.chatListInfo}><div style={styles.chatListName}>{c.name}</div><div style={styles.chatListPreview}>{c.lastMessage?.substring(0, 30) || 'No messages yet'}</div></div>{c.messageCount > 0 && <div style={styles.chatListBadge}>{c.messageCount}</div>}</div>))}</div></>)}
      </div>
      {showAddPlayer && (<div style={styles.modal}><div style={styles.modalContent}><div style={styles.modalHeader}><h3 style={styles.modalTitle}>Add Player</h3><button style={styles.modalClose} onClick={() => setShowAddPlayer(false)}>✕</button></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Player Name</label><input type="text" style={styles.input} placeholder="Emma Wilson" value={newPlayer.name} onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})} /></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Parent Name</label><input type="text" style={styles.input} placeholder="Sarah Wilson" value={newPlayer.parent} onChange={(e) => setNewPlayer({...newPlayer, parent: e.target.value})} /></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Email</label><input type="email" style={styles.input} placeholder="sarah@email.com" value={newPlayer.email} onChange={(e) => setNewPlayer({...newPlayer, email: e.target.value})} /></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Jersey #</label><input type="number" style={styles.input} placeholder="7" value={newPlayer.jersey} onChange={(e) => setNewPlayer({...newPlayer, jersey: e.target.value})} /></div><button style={styles.btnPrimaryLarge} onClick={addPlayer}>Add Player</button></div></div>)}
      {showAddEvent && (<div style={styles.modal}><div style={styles.modalContent}><div style={styles.modalHeader}><h3 style={styles.modalTitle}>Add Event</h3><button style={styles.modalClose} onClick={() => { setShowAddEvent(false); setLocationInput(''); setSelectedLocation(null); setLocationError(''); }}>✕</button></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Event Type</label><div style={styles.roleToggle}><button style={{...styles.roleBtn, ...(newEvent.type === 'practice' && styles.roleBtnActive)}} onClick={() => setNewEvent({...newEvent, type: 'practice'})}>🏃 Practice</button><button style={{...styles.roleBtn, ...(newEvent.type === 'game' && styles.roleBtnActive)}} onClick={() => setNewEvent({...newEvent, type: 'game'})}>⚽ Game</button></div></div>{newEvent.type === 'game' && <div style={styles.inputGroup}><label style={styles.inputLabel}>Opponent</label><input type="text" style={styles.input} placeholder="vs Thunder FC" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} /></div>}<div style={styles.inputGroup}><label style={styles.inputLabel}>Date</label><input type="date" style={styles.input} value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} /></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Time</label><input type="time" style={styles.input} value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} /></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Location</label><LocationSearchInput value={locationInput} onChange={setLocationInput} onPlaceSelected={handlePlaceSelected} placeholder="Search for a location on Google Maps..." inputStyle={styles.input} />{selectedLocation && (<div style={styles.selectedLocationBox}><span style={styles.selectedLocationIcon}>✓</span><div style={styles.selectedLocationText}><div style={styles.selectedLocationName}>{selectedLocation.name}</div><div style={styles.selectedLocationAddress}>{selectedLocation.address}</div></div><button style={styles.selectedLocationEdit} onClick={() => { setSelectedLocation(null); setLocationInput(''); }}>Change</button></div>)}{locationError && <div style={styles.locationErrorText}>{locationError}</div>}<span style={styles.inputHint}>Start typing to search for real locations on Google Maps</span></div><button style={styles.btnPrimaryLarge} onClick={addEvent}>Create Event</button></div></div>)}
      {showLocationConfirm && selectedLocation && (<LocationConfirmModal location={selectedLocation} onConfirm={confirmLocation} onCancel={cancelLocationConfirm} onEdit={editLocation} />)}
      {showSendPush && (<div style={styles.modal}><div style={styles.modalContent}><div style={styles.modalHeader}><h3 style={styles.modalTitle}>Send Notification</h3><button style={styles.modalClose} onClick={() => setShowSendPush(false)}>✕</button></div><div style={styles.pushPreview}><div style={styles.pushPreviewHeader}><span style={styles.pushPreviewIcon}>⚽</span><span style={styles.pushPreviewApp}>TeamKick</span><span style={styles.pushPreviewTime}>now</span></div><div style={styles.pushPreviewTitle}>{pushTitle || 'Notification Title'}</div><div style={styles.pushPreviewMessage}>{pushMessage || 'Your message here...'}</div></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Type</label><select style={styles.input} value={pushType} onChange={(e) => setPushType(e.target.value)}><option value="announcement">📢 Announcement</option><option value="reminder">⏰ Reminder</option><option value="game">⚽ Game Update</option></select></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Title</label><input type="text" style={styles.input} placeholder="Important Update" value={pushTitle} onChange={(e) => setPushTitle(e.target.value)} /></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Message</label><textarea style={{...styles.input, minHeight: 80}} placeholder="Enter your message..." value={pushMessage} onChange={(e) => setPushMessage(e.target.value)} /></div><button style={styles.btnPrimaryLarge} onClick={sendPush}>🔔 Send Notification</button></div></div>)}
      {showInvite && (<div style={styles.modal}><div style={styles.modalContent}><div style={styles.modalHeader}><h3 style={styles.modalTitle}>Invite Parents</h3><button style={styles.modalClose} onClick={() => setShowInvite(false)}>✕</button></div><div style={styles.teamCodeBox}><div style={styles.teamCodeLabel}>Team Code</div><div style={styles.teamCodeValue}>{team?.code}</div><div style={styles.teamCodeHint}>Share this code with parents to join</div></div><button style={styles.btnPrimaryLarge} onClick={() => setShowInvite(false)}>Done</button></div></div>)}
      <div style={styles.bottomNav}>{[{id:'home',icon:'🏠',label:'Home'},{id:'team',icon:'👥',label:'Team'},{id:'schedule',icon:'📅',label:'Schedule'},{id:'chat',icon:'💬',label:'Chats'}].map(i => (<button key={i.id} onClick={() => setTab(i.id)} style={{...styles.navItem, color: tab === i.id ? '#16a34a' : '#9ca3af'}}><span style={styles.navIcon}>{i.icon}</span><span style={styles.navLabel}>{i.label}</span></button>))}</div>
      {toast && <ToastNotification notification={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
};

const ParentDashboard = ({ user, db, setDb, onLogout }) => {
  const [tab, setTab] = useState('home');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showChat, setShowChat] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', type: 'public', description: '', seats: 3, memberIds: [] });

  const team = db.teams.find(t => t.id === user.teamId);
  const roster = db.players.filter(p => p.teamId === user.teamId).map(p => ({ ...p, parent: db.parents.find(x => x.id === p.parentId)?.name || 'Unknown', canDrive: db.parents.find(x => x.id === p.parentId)?.canDrive, seats: db.parents.find(x => x.id === p.parentId)?.seats }));
  const events = db.events.filter(e => e.teamId === user.teamId).sort((a, b) => new Date(a.date) - new Date(b.date));
  const chats = db.chats.filter(c => c.teamId === user.teamId && c.type !== 'coaches').map(c => ({ ...c, messageCount: db.messages.filter(m => m.chatId === c.id).length, lastMessage: db.messages.filter(m => m.chatId === c.id).slice(-1)[0]?.text || '' }));
  const notifications = db.notifications.filter(n => n.teamId === user.teamId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const unreadCount = notifications.filter(n => !n.read).length;

  const offerRide = (eventId) => { setDb({ ...db, carpools: [...db.carpools, { id: uuid(), eventId, driverId: user.id, driverName: user.name, seats: 3, passengers: [] }] }); setToast({ type: 'carpool', title: 'Ride Offered!', message: 'Your carpool has been added' }); };
  const requestRide = (id) => { const c = db.carpools.find(x => x.id === id); if (c && c.passengers.length < c.seats) setDb({ ...db, carpools: db.carpools.map(x => x.id === id ? { ...x, passengers: [...x.passengers, 'My child'] } : x) }); setToast({ type: 'carpool', title: 'Ride Requested!', message: "You've been added" }); };
  const volunteer = (id) => { const d = db.duties.find(x => x.id === id); if (d) { setDb({ ...db, duties: db.duties.map(x => x.id === id ? { ...x, assignedTo: user.name, assignedId: user.id } : x) }); setToast({ type: 'volunteer', title: 'Thank You!', message: `Signed up for ${d.type}` }); } };
  const markRead = (id) => setDb({ ...db, notifications: db.notifications.map(n => n.id === id ? { ...n, read: true } : n) });
  const markAllRead = () => setDb({ ...db, notifications: db.notifications.map(n => n.teamId === user.teamId ? { ...n, read: true } : n) });
  const sendMessage = (chatId, text) => setDb({ ...db, messages: [...db.messages, { id: uuid(), chatId, senderId: user.id, senderName: user.name, text, isCoach: false, createdAt: new Date().toISOString() }] });
  const createCarpoolGroup = () => { if (!newGroup.name) return; const parent = db.parents.find(p => p.id === user.parentId); const group = { id: uuid(), teamId: user.teamId, creatorId: user.parentId, creatorName: user.name, name: newGroup.name, type: newGroup.type, memberIds: newGroup.type === 'private' ? [user.parentId, ...newGroup.memberIds] : [], seats: parent?.seats || newGroup.seats, description: newGroup.description, createdAt: new Date().toISOString() }; setDb({ ...db, carpoolGroups: [...db.carpoolGroups, group] }); setNewGroup({ name: '', type: 'public', description: '', seats: 3, memberIds: [] }); setShowCreateGroup(false); setToast({ type: 'carpool', title: 'Group Created!', message: `${group.name} is ready` }); };
  const joinCarpoolGroup = (groupId) => { const group = db.carpoolGroups.find(g => g.id === groupId); if (group && !group.memberIds.includes(user.parentId)) { setDb({ ...db, carpoolGroups: db.carpoolGroups.map(g => g.id === groupId ? { ...g, memberIds: [...g.memberIds, user.parentId] } : g) }); setToast({ type: 'carpool', title: 'Joined Group!', message: `You're now in ${group.name}` }); } };
  const leaveCarpoolGroup = (groupId) => { const group = db.carpoolGroups.find(g => g.id === groupId); if (group) { setDb({ ...db, carpoolGroups: db.carpoolGroups.map(g => g.id === groupId ? { ...g, memberIds: g.memberIds.filter(id => id !== user.parentId) } : g) }); setToast({ type: 'carpool', title: 'Left Group', message: `You left ${group.name}` }); } };

  // Helper function to open location in Google Maps
  const openLocationInMaps = (event) => {
    if (event.locationPlaceId) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.locationAddress || event.location)}&query_place_id=${event.locationPlaceId}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`, '_blank');
    }
  };

  if (showNotifications) return <NotificationsScreen notifications={notifications} onMarkRead={markRead} onMarkAllRead={markAllRead} onBack={() => setShowNotifications(false)} />;
  if (showChat) return <ChatScreen user={user} chat={showChat} messages={db.messages} onSendMessage={sendMessage} onBack={() => setShowChat(null)} />;

  if (selectedEvent) {
    const event = events.find(e => e.id === selectedEvent);
    if (!event) { setSelectedEvent(null); return null; }
    const carpools = db.carpools.filter(c => c.eventId === event.id);
    const duties = db.duties.filter(d => d.eventId === event.id);
    const isGame = event.type === 'game';
    return (
      <div style={styles.app}>
        <div style={styles.header}><span style={styles.logo}>TeamKick</span><div style={styles.headerActions}><NotificationBell count={unreadCount} onClick={() => setShowNotifications(true)} /><span style={styles.headerRight} onClick={onLogout}>👤</span></div></div>
        <div style={styles.content}>
          <button onClick={() => setSelectedEvent(null)} style={styles.backBtn}>← Back</button>
          <div style={{...styles.eventHero, background: isGame ? '#fff7ed' : '#eff6ff'}}><div style={styles.eventTypeRow}><span style={{fontSize: 28}}>{isGame ? '⚽' : '🏃'}</span><span style={{...styles.typeBadge, background: isGame ? '#fed7aa' : '#bfdbfe', color: isGame ? '#c2410c' : '#1d4ed8'}}>{event.type.toUpperCase()}</span></div><h2 style={styles.eventHeroTitle}>{event.title}</h2><div style={styles.eventDetails}><p style={styles.detailRow}>📅 {formatDate(event.date)} at {event.time}</p><p style={{...styles.detailRow, cursor: 'pointer'}} onClick={() => openLocationInMaps(event)}>📍 {event.location} {event.field && `- ${event.field}`} <span style={styles.mapLink}>View on Map</span></p>{event.arriveBy && <p style={{...styles.detailRow, color: '#dc2626', fontWeight: 500}}>⏰ Arrive by {event.arriveBy}</p>}</div></div>
          <div style={styles.card}><div style={styles.cardHeader}><h3 style={styles.cardTitle}>🚗 Carpools</h3><button style={styles.btnPrimary} onClick={() => offerRide(event.id)}>+ Offer</button></div>{carpools.length === 0 ? <p style={styles.emptyText}>No carpools yet</p> : carpools.map(c => (<div key={c.id} style={styles.listItem}><div style={styles.listItemHeader}><div><div style={styles.driverName}>🚗 {c.driverName}</div><div style={styles.itemSubtitle}>{c.passengers.length}/{c.seats} seats</div></div>{c.passengers.length < c.seats && c.driverId !== user.id && <button style={styles.btnLink} onClick={() => requestRide(c.id)}>Request</button>}</div>{c.passengers.length > 0 && <p style={styles.passengers}>Passengers: {c.passengers.join(', ')}</p>}</div>))}</div>
          {event.needsSnacks && (<div style={styles.card}><h3 style={{...styles.cardTitle, marginBottom: 16}}>🍪 Volunteer Duties</h3>{duties.map(d => (<div key={d.id} style={styles.listItem}><div style={styles.listItemHeader}><div style={{display: 'flex', alignItems: 'center', gap: 12}}><span style={{fontSize: 24}}>{d.type === 'snacks' ? '🍎' : '🧃'}</span><div><div style={styles.itemTitle}>{d.type.charAt(0).toUpperCase() + d.type.slice(1)}</div>{d.assignedTo ? <div style={{...styles.itemSubtitle, color: '#16a34a'}}>✓ {d.assignedTo}</div> : <div style={{...styles.itemSubtitle, color: '#ca8a04'}}>Needs volunteer</div>}</div></div>{!d.assignedTo && <button style={styles.btnPurple} onClick={() => volunteer(d.id)}>Sign Up</button>}</div></div>))}</div>)}
        </div>
        <div style={styles.bottomNav}>{[{id:'home',icon:'🏠',label:'Home'},{id:'schedule',icon:'📅',label:'Schedule'},{id:'carpools',icon:'🚗',label:'Carpools'},{id:'chat',icon:'💬',label:'Chats'},{id:'roster',icon:'👥',label:'Roster'}].map(i => (<button key={i.id} onClick={() => { setTab(i.id); setSelectedEvent(null); }} style={{...styles.navItem, color: tab === i.id ? '#16a34a' : '#9ca3af'}}><span style={styles.navIcon}>{i.icon}</span><span style={styles.navLabel}>{i.label}</span></button>))}</div>
        {toast && <ToastNotification notification={toast} onDismiss={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <div style={styles.header}><span style={styles.logo}>TeamKick</span><div style={styles.headerActions}><NotificationBell count={unreadCount} onClick={() => setShowNotifications(true)} /><span style={styles.headerRight} onClick={onLogout}>👤</span></div></div>
      <div style={styles.content}>
        {tab === 'home' && (<><div style={styles.heroCard}><h2 style={styles.heroTitle}>{team?.name} {team?.ageGroup}</h2><p style={styles.heroSubtitle}>Fall 2025 Season</p><div style={styles.statsRow}><div style={styles.statBox}><div style={styles.statNumber}>{events.length}</div><div style={styles.statLabel}>Upcoming</div></div><div style={styles.statBox}><div style={styles.statNumber}>{roster.length}</div><div style={styles.statLabel}>Players</div></div></div></div><h3 style={styles.sectionTitle}>Upcoming Events</h3>{events.map(e => (<div key={e.id} style={styles.eventCard} onClick={() => setSelectedEvent(e.id)}><div style={styles.eventRow}><div style={{...styles.eventIcon, background: e.type === 'game' ? '#ffedd5' : '#dbeafe'}}>{e.type === 'game' ? '⚽' : '🏃'}</div><div style={styles.eventInfo}><div style={styles.eventTitle}>{e.title}</div><div style={styles.eventMeta}>{formatDate(e.date)} • {e.time}</div></div><span style={styles.chevron}>›</span></div></div>))}</>)}
        {tab === 'schedule' && (<><h2 style={styles.pageTitle}>Schedule</h2>{events.map(e => { const { month, day } = getMonthDay(e.date); return (<div key={e.id} style={styles.scheduleCard} onClick={() => setSelectedEvent(e.id)}><div style={styles.dateBox}><div style={styles.dateMonth}>{month}</div><div style={styles.dateDay}>{day}</div></div><div style={{flex: 1}}><span style={{...styles.typeBadgeSmall, background: e.type === 'game' ? '#fed7aa' : '#bfdbfe', color: e.type === 'game' ? '#c2410c' : '#1d4ed8'}}>{e.type}</span><div style={{...styles.eventTitle, marginTop: 4}}>{e.title}</div><div style={styles.eventMeta}>{e.time} • {e.location}</div></div></div>); })}</>)}
        {tab === 'carpools' && (<><div style={styles.pageHeader}><h2 style={styles.pageTitle}>Carpool Groups</h2><button style={styles.btnPrimary} onClick={() => setShowCreateGroup(true)}>+ Create</button></div><div style={styles.carpoolSection}><h3 style={styles.carpoolSectionTitle}>🔒 Private Groups</h3><p style={styles.carpoolSectionSubtitle}>Groups with people you know</p>{db.carpoolGroups.filter(g => g.teamId === user.teamId && g.type === 'private').map(g => { const isMember = g.memberIds.includes(user.parentId); const isCreator = g.creatorId === user.parentId; const members = g.memberIds.map(id => db.parents.find(p => p.id === id)?.name || 'Unknown'); return (<div key={g.id} style={styles.carpoolGroupCard}><div style={styles.carpoolGroupHeader}><div><div style={styles.carpoolGroupName}>🚗 {g.name}</div><div style={styles.carpoolGroupMeta}>{g.creatorName} • {members.length} members</div></div>{isMember && <div style={styles.memberBadge}>Member</div>}</div><p style={styles.carpoolGroupDesc}>{g.description}</p><div style={styles.carpoolGroupMembers}>Members: {members.join(', ')}</div>{!isMember && <button style={styles.btnLink} onClick={() => joinCarpoolGroup(g.id)}>Request to Join</button>}{isMember && !isCreator && <button style={{...styles.btnLink, color: '#dc2626'}} onClick={() => leaveCarpoolGroup(g.id)}>Leave Group</button>}</div>); })}</div><div style={styles.carpoolSection}><h3 style={styles.carpoolSectionTitle}>🌍 Public Offers</h3><p style={styles.carpoolSectionSubtitle}>Available to anyone on the team</p>{db.carpoolGroups.filter(g => g.teamId === user.teamId && g.type === 'public').map(g => { const isCreator = g.creatorId === user.parentId; return (<div key={g.id} style={styles.carpoolGroupCard}><div style={styles.carpoolGroupHeader}><div><div style={styles.carpoolGroupName}>🚗 {g.name}</div><div style={styles.carpoolGroupMeta}>{g.creatorName} • {g.seats} seats available</div></div>{isCreator && <div style={{...styles.memberBadge, background: '#fef3c7', color: '#b45309'}}>Your Offer</div>}</div><p style={styles.carpoolGroupDesc}>{g.description}</p></div>); })}</div></>)}
        {tab === 'chat' && (<><h2 style={styles.pageTitle}>Group Chats</h2><div style={styles.chatList}>{chats.map(c => (<div key={c.id} style={styles.chatListItem} onClick={() => setShowChat(c)}><div style={styles.chatListIcon}>{c.icon}</div><div style={styles.chatListInfo}><div style={styles.chatListName}>{c.name}</div><div style={styles.chatListPreview}>{c.lastMessage?.substring(0, 30) || 'No messages yet'}</div></div>{c.messageCount > 0 && <div style={styles.chatListBadge}>{c.messageCount}</div>}</div>))}</div></>)}
        {tab === 'roster' && (<><h2 style={styles.pageTitle}>Team Roster</h2>{roster.map(p => (<div key={p.id} style={styles.rosterCard}><div style={styles.playerAvatar}>⚽</div><div style={styles.playerInfo}><div style={styles.playerName}>{p.name}</div><div style={styles.parentName}>{p.parent}</div></div>{p.canDrive && <div style={styles.driverBadge}>🚗 {p.seats}</div>}</div>))}</>)}
      </div>
      <div style={styles.bottomNav}>{[{id:'home',icon:'🏠',label:'Home'},{id:'schedule',icon:'📅',label:'Schedule'},{id:'carpools',icon:'🚗',label:'Carpools'},{id:'chat',icon:'💬',label:'Chats'},{id:'roster',icon:'👥',label:'Roster'}].map(i => (<button key={i.id} onClick={() => setTab(i.id)} style={{...styles.navItem, color: tab === i.id ? '#16a34a' : '#9ca3af'}}><span style={styles.navIcon}>{i.icon}</span><span style={styles.navLabel}>{i.label}</span></button>))}</div>
      {showCreateGroup && (<div style={styles.modal}><div style={styles.modalContent}><div style={styles.modalHeader}><h3 style={styles.modalTitle}>Create Carpool Group</h3><button style={styles.modalClose} onClick={() => setShowCreateGroup(false)}>✕</button></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Group Type</label><div style={styles.roleToggle}><button style={{...styles.roleBtn, ...(newGroup.type === 'public' && styles.roleBtnActive)}} onClick={() => setNewGroup({...newGroup, type: 'public'})}>🌍 Public</button><button style={{...styles.roleBtn, ...(newGroup.type === 'private' && styles.roleBtnActive)}} onClick={() => setNewGroup({...newGroup, type: 'private'})}>🔒 Private</button></div><p style={styles.inputHint}>{newGroup.type === 'public' ? 'Available to all team members' : 'Only for people you invite'}</p></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Group Name</label><input type="text" style={styles.input} placeholder="North Side Neighbors" value={newGroup.name} onChange={(e) => setNewGroup({...newGroup, name: e.target.value})} /></div><div style={styles.inputGroup}><label style={styles.inputLabel}>Description</label><textarea style={{...styles.input, minHeight: 80}} placeholder="For families living in the north side..." value={newGroup.description} onChange={(e) => setNewGroup({...newGroup, description: e.target.value})} /></div>{newGroup.type === 'public' && <div style={styles.inputGroup}><label style={styles.inputLabel}>Available Seats</label><input type="number" style={styles.input} placeholder="3" min="1" max="7" value={newGroup.seats} onChange={(e) => setNewGroup({...newGroup, seats: parseInt(e.target.value) || 1})} /></div>}{newGroup.type === 'private' && <div style={styles.inputGroup}><label style={styles.inputLabel}>Add Members (Optional)</label><div style={styles.memberSelectList}>{db.parents.filter(p => p.teamId === user.teamId && p.id !== user.parentId).map(p => (<label key={p.id} style={styles.checkboxLabel}><input type="checkbox" checked={newGroup.memberIds.includes(p.id)} onChange={(e) => { if (e.target.checked) { setNewGroup({...newGroup, memberIds: [...newGroup.memberIds, p.id]}); } else { setNewGroup({...newGroup, memberIds: newGroup.memberIds.filter(id => id !== p.id)}); } }} style={styles.checkbox} /><span>{p.name}</span></label>))}</div></div>}<button style={styles.btnPrimaryLarge} onClick={createCarpoolGroup}>Create Group</button></div></div>)}
      {toast && <ToastNotification notification={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
};

export default function TeamKickApp() {
  const [db, setDb] = useState(createInitialDB);
  const [user, setUser] = useState(null);
  const [authScreen, setAuthScreen] = useState('welcome');
  const handleLogout = () => { setUser(null); setAuthScreen('welcome'); };
  if (!user) {
    if (authScreen === 'welcome') return <WelcomeScreen onSignIn={() => setAuthScreen('signin')} onCreateAccount={() => setAuthScreen('create')} />;
    if (authScreen === 'signin') return <SignInScreen db={db} onBack={() => setAuthScreen('welcome')} onSignIn={setUser} onForgotPassword={() => setAuthScreen('forgot')} onCreateAccount={() => setAuthScreen('create')} />;
    if (authScreen === 'create') return <CreateAccountScreen db={db} setDb={setDb} onBack={() => setAuthScreen('welcome')} onCreateAccount={setUser} onSignIn={() => setAuthScreen('signin')} />;
    if (authScreen === 'forgot') return <ForgotPasswordScreen onBack={() => setAuthScreen('signin')} />;
  }
  return user.isCoach ? <CoachDashboard user={user} db={db} setDb={setDb} onLogout={handleLogout} /> : <ParentDashboard user={user} db={db} setDb={setDb} onLogout={handleLogout} />;
}

const styles = {
  toast: { position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 40px)', maxWidth: 390, background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'flex-start', gap: 12, zIndex: 2000, cursor: 'pointer' },
  toastIcon: { width: 40, height: 40, background: '#f0fdf4', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  toastContent: { flex: 1 },
  toastTitle: { fontWeight: 600, color: '#1f2937', fontSize: 14 },
  toastMessage: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  toastClose: { background: 'none', border: 'none', color: '#9ca3af', fontSize: 18, cursor: 'pointer', padding: 0 },
  bellButton: { background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4 },
  bellIcon: { fontSize: 22 },
  bellBadge: { position: 'absolute', top: -2, right: -2, background: '#dc2626', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 10, minWidth: 16, textAlign: 'center' },
  notificationsContainer: { minHeight: '100vh', maxWidth: 430, margin: '0 auto', background: '#f9fafb', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif", boxShadow: '0 0 40px rgba(0,0,0,0.1)' },
  notificationsHeader: { background: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #e5e7eb' },
  notificationsTitle: { flex: 1, fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0, textAlign: 'center' },
  notificationsActions: { display: 'flex', justifyContent: 'flex-end', gap: 16, padding: '12px 20px', background: 'white', borderBottom: '1px solid #e5e7eb' },
  actionLink: { background: 'none', border: 'none', color: '#16a34a', fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: 0 },
  notificationsList: { padding: 20 },
  emptyNotifications: { textAlign: 'center', padding: '60px 20px' },
  emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: 600, color: '#374151' },
  emptySubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  notificationItem: { background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  notificationIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },
  notificationContent: { flex: 1, minWidth: 0 },
  notificationItemTitle: { fontWeight: 600, color: '#1f2937', fontSize: 15 },
  notificationMessage: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  notificationTime: { fontSize: 12, color: '#9ca3af', marginTop: 6 },
  unreadDot: { width: 10, height: 10, background: '#16a34a', borderRadius: '50%', flexShrink: 0 },
  pushPreview: { background: '#1f2937', borderRadius: 16, padding: 16, marginBottom: 20 },
  pushPreviewHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  pushPreviewIcon: { fontSize: 16 },
  pushPreviewApp: { color: '#9ca3af', fontSize: 12, flex: 1 },
  pushPreviewTime: { color: '#6b7280', fontSize: 12 },
  pushPreviewTitle: { color: 'white', fontWeight: 600, fontSize: 14 },
  pushPreviewMessage: { color: '#d1d5db', fontSize: 13, marginTop: 4 },
  headerActions: { display: 'flex', alignItems: 'center', gap: 8 },
  demoBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 12, marginTop: 16 },
  demoTitle: { fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 4 },
  demoText: { fontSize: 12, color: '#15803d' },
  authContainer: { minHeight: '100vh', maxWidth: 430, margin: '0 auto', background: 'white', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif", display: 'flex', flexDirection: 'column', boxShadow: '0 0 40px rgba(0,0,0,0.1)' },
  authHeader: { padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  authContent: { flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  authFooter: { padding: '20px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center', gap: 8 },
  welcomeContent: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' },
  welcomeLogo: { fontSize: 64, marginBottom: 16 },
  welcomeTitle: { fontSize: 32, fontWeight: 700, color: '#16a34a', margin: 0 },
  welcomeSubtitle: { fontSize: 16, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  featureList: { marginTop: 40, width: '100%' },
  featureItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', color: '#374151' },
  featureIcon: { fontSize: 24 },
  welcomeButtons: { padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 },
  authLogo: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  successIcon: { fontSize: 64, textAlign: 'center', marginBottom: 16 },
  authTitle: { fontSize: 24, fontWeight: 700, color: '#1f2937', margin: 0, textAlign: 'center' },
  authSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center', marginBottom: 24 },
  roleToggle: { display: 'flex', gap: 12, marginBottom: 20 },
  roleBtn: { flex: 1, padding: '12px', border: '2px solid #e5e7eb', borderRadius: 12, background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  roleBtnActive: { borderColor: '#16a34a', background: '#f0fdf4' },
  roleIcon: { fontSize: 24 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '12px 14px', fontSize: 16, border: '1px solid #d1d5db', borderRadius: 10, outline: 'none', boxSizing: 'border-box' },
  inputHint: { fontSize: 12, color: '#9ca3af', marginTop: 4, display: 'block' },
  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', color: '#dc2626', fontSize: 14, marginBottom: 16 },
  forgotLink: { background: 'none', border: 'none', color: '#16a34a', fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'right', marginBottom: 20, padding: 0 },
  btnPrimaryLarge: { width: '100%', padding: '14px', fontSize: 16, fontWeight: 600, background: '#16a34a', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer' },
  btnOutlineLarge: { width: '100%', padding: '14px', fontSize: 16, fontWeight: 600, background: 'white', color: '#16a34a', border: '2px solid #16a34a', borderRadius: 12, cursor: 'pointer' },
  footerText: { fontSize: 14, color: '#6b7280' },
  footerLink: { background: 'none', border: 'none', color: '#16a34a', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0 },
  stepIndicator: { display: 'flex', alignItems: 'center' },
  stepDot: { width: 10, height: 10, borderRadius: '50%' },
  stepLine: { width: 40, height: 2 },
  checkboxGroup: { marginBottom: 16 },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
  checkbox: { width: 20, height: 20, accentColor: '#16a34a' },
  teamCodeBox: { background: '#f0fdf4', border: '2px dashed #16a34a', borderRadius: 12, padding: 20, textAlign: 'center', marginBottom: 16 },
  teamCodeLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  teamCodeValue: { fontSize: 28, fontWeight: 700, color: '#16a34a', letterSpacing: 2 },
  teamCodeHint: { fontSize: 12, color: '#6b7280', marginTop: 8 },
  app: { minHeight: '100vh', maxWidth: 430, margin: '0 auto', background: '#f9fafb', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif", position: 'relative', paddingBottom: 80, boxShadow: '0 0 40px rgba(0,0,0,0.1)' },
  header: { background: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontSize: 24, fontWeight: 700, color: '#16a34a' },
  headerRight: { fontSize: 20, cursor: 'pointer' },
  coachBadge: { background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  content: { padding: 20 },
  heroCard: { background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', borderRadius: 16, padding: 20, color: 'white', marginBottom: 24 },
  coachHero: { background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', borderRadius: 16, padding: 20, color: 'white', marginBottom: 24 },
  heroTitle: { fontSize: 20, fontWeight: 600, margin: 0 },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  statsRow: { display: 'flex', gap: 12, marginTop: 16 },
  statBox: { background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 16px' },
  statNumber: { fontSize: 24, fontWeight: 700 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  sectionTitle: { fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 16 },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  quickActions: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 },
  quickActionBtn: { background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontSize: 12, color: '#374151', fontWeight: 500 },
  quickActionIcon: { fontSize: 24 },
  eventCard: { background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', cursor: 'pointer' },
  eventRow: { display: 'flex', alignItems: 'center', gap: 12 },
  eventIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
  eventInfo: { flex: 1 },
  eventTitle: { fontWeight: 500, color: '#1f2937' },
  eventMeta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  chevron: { fontSize: 24, color: '#9ca3af' },
  backBtn: { background: 'none', border: 'none', color: '#16a34a', fontWeight: 500, cursor: 'pointer', fontSize: 15, padding: 0, marginBottom: 16 },
  eventHero: { borderRadius: 16, padding: 20, marginBottom: 20 },
  eventTypeRow: { display: 'flex', alignItems: 'center', gap: 8 },
  typeBadge: { fontSize: 10, fontWeight: 600, padding: '4px 8px', borderRadius: 6 },
  typeBadgeSmall: { fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, display: 'inline-block' },
  eventHeroTitle: { fontSize: 22, fontWeight: 700, color: '#1f2937', marginTop: 12 },
  eventDetails: { marginTop: 16 },
  detailRow: { color: '#4b5563', marginBottom: 8, fontSize: 14 },
  card: { background: 'white', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 600, color: '#374151', margin: 0 },
  btnPrimary: { background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', fontSize: 13, padding: '8px 14px' },
  btnPurple: { background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', fontSize: 13, padding: '8px 14px' },
  btnLink: { background: 'none', border: 'none', color: '#16a34a', fontWeight: 500, cursor: 'pointer', fontSize: 14 },
  listItem: { background: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 8 },
  listItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  driverName: { fontWeight: 500, color: '#1f2937' },
  itemTitle: { fontWeight: 500, color: '#1f2937' },
  itemSubtitle: { fontSize: 13, color: '#6b7280' },
  passengers: { fontSize: 13, color: '#6b7280', marginTop: 8 },
  scheduleCard: { background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', gap: 16, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  dateBox: { textAlign: 'center', minWidth: 50 },
  dateMonth: { fontSize: 11, color: '#6b7280' },
  dateDay: { fontSize: 26, fontWeight: 700, color: '#1f2937' },
  rosterCard: { background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  rosterCardCoach: { background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  jerseyBadge: { width: 48, height: 48, background: '#dbeafe', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#1d4ed8' },
  playerAvatar: { width: 48, height: 48, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
  playerInfo: { flex: 1 },
  playerName: { fontWeight: 500, color: '#1f2937' },
  parentName: { fontSize: 13, color: '#6b7280' },
  playerContact: { fontSize: 12, color: '#9ca3af' },
  driverBadge: { fontSize: 11, background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 20 },
  removeBtn: { background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
  emptyChat: { textAlign: 'center', padding: 40, color: '#9ca3af' },
  chatList: { display: 'flex', flexDirection: 'column', gap: 12 },
  chatListItem: { background: 'white', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  chatListIcon: { width: 48, height: 48, background: '#f3f4f6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
  chatListInfo: { flex: 1 },
  chatListName: { fontWeight: 500, color: '#1f2937' },
  chatListPreview: { fontSize: 13, color: '#6b7280' },
  chatListBadge: { background: '#16a34a', color: 'white', fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 10 },
  chatContainer: { minHeight: '100vh', maxWidth: 430, margin: '0 auto', background: '#f9fafb', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif", display: 'flex', flexDirection: 'column', boxShadow: '0 0 40px rgba(0,0,0,0.1)' },
  chatHeader: { background: 'white', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 },
  chatHeaderInfo: { flex: 1 },
  chatHeaderTitle: { fontWeight: 600, color: '#1f2937' },
  chatHeaderSub: { fontSize: 12, color: '#6b7280' },
  chatMessages: { flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 },
  messageWrapper: { display: 'flex' },
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  myMessage: { background: '#16a34a', color: 'white', borderBottomRightRadius: 4 },
  otherMessage: { background: 'white', color: '#1f2937', borderBottomLeftRadius: 4 },
  messageSender: { fontSize: 12, fontWeight: 600, marginBottom: 4 },
  messageText: { fontSize: 15, lineHeight: 1.4 },
  messageTime: { fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: 'right' },
  chatInput: { background: 'white', padding: 16, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 12 },
  chatInputField: { flex: 1, padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 24, outline: 'none', fontSize: 15 },
  chatSendBtn: { background: '#16a34a', color: 'white', border: 'none', borderRadius: 24, padding: '12px 20px', fontWeight: 600, cursor: 'pointer' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: 'white', borderRadius: '24px 24px 0 0', padding: 24, width: '100%', maxWidth: 430, maxHeight: '85vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 },
  modalClose: { background: '#f3f4f6', border: 'none', borderRadius: 20, width: 32, height: 32, cursor: 'pointer', fontSize: 16 },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'white', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-around', padding: '12px 0', zIndex: 100 },
  navItem: { background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 12px' },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 11, fontWeight: 500 },
  carpoolSection: { marginBottom: 24 },
  carpoolSectionTitle: { fontSize: 16, fontWeight: 600, color: '#1f2937', marginBottom: 4 },
  carpoolSectionSubtitle: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  carpoolGroupCard: { background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  carpoolGroupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  carpoolGroupName: { fontSize: 16, fontWeight: 600, color: '#1f2937' },
  carpoolGroupMeta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  carpoolGroupDesc: { fontSize: 14, color: '#4b5563', marginBottom: 8 },
  carpoolGroupMembers: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  memberBadge: { background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20 },
  memberSelectList: { maxHeight: 200, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 },
  // New styles for location validation
  selectedLocationBox: { display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 12, marginTop: 8 },
  selectedLocationIcon: { color: '#16a34a', fontSize: 18, fontWeight: 700 },
  selectedLocationText: { flex: 1 },
  selectedLocationName: { fontWeight: 600, color: '#166534', fontSize: 14 },
  selectedLocationAddress: { fontSize: 12, color: '#15803d', marginTop: 2 },
  selectedLocationEdit: { background: 'none', border: 'none', color: '#16a34a', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  locationErrorText: { color: '#dc2626', fontSize: 12, marginTop: 4 },
  mapLink: { color: '#16a34a', fontSize: 12, fontWeight: 500, marginLeft: 4 },
};
