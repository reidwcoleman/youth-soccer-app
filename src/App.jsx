import React, { useState } from 'react';

// Sample Data
const sampleTeam = {
  id: 'team-1',
  name: 'Lightning FC U12',
  coach: 'Coach Sarah',
  players: [
    { id: 1, name: 'Emma Wilson', number: 7, parent: 'Mike Wilson', phone: '555-0101', canDrive: true, seats: 4 },
    { id: 2, name: 'Liam Chen', number: 10, parent: 'Lisa Chen', phone: '555-0102', canDrive: true, seats: 5 },
    { id: 3, name: 'Olivia Martinez', number: 3, parent: 'Carlos Martinez', phone: '555-0103', canDrive: false, seats: 0 },
    { id: 4, name: 'Noah Johnson', number: 5, parent: 'Amy Johnson', phone: '555-0104', canDrive: true, seats: 3 },
    { id: 5, name: 'Ava Thompson', number: 11, parent: 'James Thompson', phone: '555-0105', canDrive: false, seats: 0 },
    { id: 6, name: 'Mason Davis', number: 9, parent: 'Rachel Davis', phone: '555-0106', canDrive: true, seats: 4 },
  ],
  schedule: [
    { id: 1, type: 'game', title: 'vs Thunder United', date: '2025-01-15', time: '10:00 AM', location: 'North Park Field 3' },
    { id: 2, type: 'practice', title: 'Team Practice', date: '2025-01-17', time: '5:30 PM', location: 'Central Sports Complex' },
    { id: 3, type: 'game', title: 'vs Storm FC', date: '2025-01-22', time: '11:30 AM', location: 'Riverside Stadium' },
    { id: 4, type: 'practice', title: 'Scrimmage Day', date: '2025-01-24', time: '5:30 PM', location: 'Central Sports Complex' },
  ]
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [user, setUser] = useState({ name: 'Mike Wilson', role: 'parent', player: 'Emma Wilson' });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [carpoolData, setCarpoolData] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Coach Sarah', message: 'Great practice today team!', time: '2:30 PM' },
    { id: 2, sender: 'Mike Wilson', message: 'Thanks coach! Emma loved it', time: '2:35 PM' },
    { id: 3, sender: 'Lisa Chen', message: 'Can someone give Liam a ride Saturday?', time: '3:15 PM' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [carpoolGroups, setCarpoolGroups] = useState([
    {
      id: 1,
      name: 'Wilson Carpool',
      driver: 'Mike Wilson',
      members: ['Emma Wilson', 'Liam Chen'],
      notes: 'Pick up from school, drop off at field'
    }
  ]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupNotes, setGroupNotes] = useState('');

  // Calculate Carpool Suggestions
  const calculateCarpools = (event) => {
    const drivers = sampleTeam.players.filter(p => p.canDrive);
    const needsRide = sampleTeam.players.filter(p => !p.canDrive);

    const suggestions = drivers.map(driver => ({
      driver: driver.parent,
      driverPlayer: driver.name,
      seats: driver.seats,
      passengers: needsRide.slice(0, Math.min(needsRide.length, driver.seats - 1)).map(p => p.name)
    }));

    setCarpoolData({
      event: event,
      suggestions: suggestions
    });
    setCurrentScreen('carpool');
  };

  // Send Message
  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        sender: user.name,
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    }
  };

  // Toggle Member Selection
  const toggleMember = (playerName) => {
    if (selectedMembers.includes(playerName)) {
      setSelectedMembers(selectedMembers.filter(m => m !== playerName));
    } else {
      setSelectedMembers([...selectedMembers, playerName]);
    }
  };

  // Create Carpool Group
  const createCarpoolGroup = () => {
    if (newGroupName.trim() && selectedMembers.length > 0) {
      const newGroup = {
        id: carpoolGroups.length + 1,
        name: newGroupName,
        driver: user.name,
        members: selectedMembers,
        notes: groupNotes
      };
      setCarpoolGroups([...carpoolGroups, newGroup]);
      setNewGroupName('');
      setSelectedMembers([]);
      setGroupNotes('');
      setShowCreateGroup(false);
    }
  };

  // Delete Carpool Group
  const deleteCarpoolGroup = (groupId) => {
    setCarpoolGroups(carpoolGroups.filter(g => g.id !== groupId));
  };

  // Styles
  const styles = {
    app: {
      minHeight: '100vh',
      maxWidth: '430px',
      margin: '0 auto',
      background: '#f5f5f7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      paddingBottom: currentScreen !== 'login' ? '80px' : '0',
      boxShadow: '0 0 40px rgba(0,0,0,0.1)'
    },
    header: {
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      padding: '16px 20px',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    logo: {
      fontSize: '24px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    content: {
      padding: '20px'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '15px',
      outline: 'none',
      marginBottom: '16px',
      transition: 'border 0.2s',
      boxSizing: 'border-box'
    },
    btn: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '8px',
      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
    },
    // Home Dashboard
    heroCard: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      borderRadius: '20px',
      padding: '24px',
      color: 'white',
      marginBottom: '24px',
      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
    },
    heroTitle: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '4px'
    },
    heroSubtitle: {
      fontSize: '14px',
      opacity: '0.9'
    },
    statsRow: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
    },
    statBox: {
      flex: 1,
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '12px',
      padding: '12px',
      textAlign: 'center',
      backdropFilter: 'blur(10px)'
    },
    statNumber: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: '11px',
      opacity: '0.9',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      border: '1px solid #f3f4f6'
    },
    eventCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      display: 'flex',
      gap: '16px',
      cursor: 'pointer',
      border: '1px solid #f3f4f6'
    },
    eventDate: {
      textAlign: 'center',
      minWidth: '56px'
    },
    eventMonth: {
      fontSize: '12px',
      color: '#6b7280',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    eventDay: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1f2937',
      lineHeight: '1'
    },
    eventInfo: {
      flex: 1
    },
    eventTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '4px'
    },
    eventTime: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px'
    },
    badge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    gameBadge: {
      background: '#fef3c7',
      color: '#b45309'
    },
    practiceBadge: {
      background: '#dbeafe',
      color: '#1e40af'
    },
    // Roster
    playerCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      border: '1px solid #f3f4f6'
    },
    playerNumber: {
      width: '56px',
      height: '56px',
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: '700',
      color: 'white',
      flexShrink: 0
    },
    playerInfo: {
      flex: 1
    },
    playerName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '4px'
    },
    parentName: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px'
    },
    driverBadge: {
      background: '#dcfce7',
      color: '#166534',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    },
    // Carpool
    carpoolHeader: {
      background: 'white',
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      border: '1px solid #f3f4f6'
    },
    carpoolTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '12px'
    },
    carpoolCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      border: '2px solid #22c55e'
    },
    driverHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px',
      paddingBottom: '16px',
      borderBottom: '1px solid #f3f4f6'
    },
    driverIcon: {
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    },
    driverName: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#1f2937'
    },
    passengerList: {
      marginTop: '12px'
    },
    passengerItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      background: '#f9fafb',
      borderRadius: '10px',
      marginBottom: '8px',
      fontSize: '14px',
      color: '#4b5563'
    },
    // Chat
    chatContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 140px)'
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    message: {
      maxWidth: '75%',
      padding: '12px 16px',
      borderRadius: '16px',
      fontSize: '15px',
      lineHeight: '1.4'
    },
    myMessage: {
      alignSelf: 'flex-end',
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      color: 'white',
      borderBottomRightRadius: '4px'
    },
    otherMessage: {
      alignSelf: 'flex-start',
      background: 'white',
      color: '#1f2937',
      borderBottomLeftRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      border: '1px solid #f3f4f6'
    },
    messageSender: {
      fontSize: '12px',
      fontWeight: '600',
      marginBottom: '4px',
      opacity: '0.8'
    },
    messageTime: {
      fontSize: '11px',
      opacity: '0.6',
      marginTop: '4px'
    },
    chatInput: {
      display: 'flex',
      gap: '12px',
      padding: '16px 20px',
      background: 'white',
      borderTop: '1px solid #e5e7eb',
      position: 'sticky',
      bottom: '80px'
    },
    chatTextField: {
      flex: 1,
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '24px',
      fontSize: '15px',
      outline: 'none'
    },
    sendBtn: {
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      fontSize: '20px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
    },
    // Bottom Navigation
    bottomNav: {
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '430px',
      background: 'white',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '12px 0 16px',
      zIndex: 100,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
    },
    navBtn: {
      background: 'none',
      border: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      cursor: 'pointer',
      padding: '4px 16px',
      transition: 'transform 0.2s'
    },
    navIcon: {
      fontSize: '24px'
    },
    navLabel: {
      fontSize: '11px',
      fontWeight: '600'
    },
    backBtn: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '0'
    },
    removeBtn: {
      background: '#fef2f2',
      color: '#dc2626',
      border: 'none',
      borderRadius: '8px',
      width: '32px',
      height: '32px',
      cursor: 'pointer',
      fontSize: '16px',
      flexShrink: 0
    }
  };

  // HOME SCREEN
  if (currentScreen === 'home') {
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <span>⚽</span>
            <span>TeamKick</span>
          </div>
          <div style={{ fontSize: '20px', cursor: 'pointer' }}>👤</div>
        </div>

        <div style={styles.content}>
          <div style={styles.heroCard}>
            <div style={styles.heroTitle}>{sampleTeam.name}</div>
            <div style={styles.heroSubtitle}>Coach: {sampleTeam.coach}</div>
            <div style={styles.statsRow}>
              <div style={styles.statBox}>
                <div style={styles.statNumber}>{sampleTeam.players.length}</div>
                <div style={styles.statLabel}>Players</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statNumber}>{sampleTeam.schedule.filter(e => e.type === 'game').length}</div>
                <div style={styles.statLabel}>Games</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statNumber}>{sampleTeam.players.filter(p => p.canDrive).length}</div>
                <div style={styles.statLabel}>Drivers</div>
              </div>
            </div>
          </div>

          <div style={styles.sectionTitle}>
            <span>📅</span>
            <span>Upcoming Events</span>
          </div>
          {sampleTeam.schedule.slice(0, 3).map(event => (
            <div key={event.id} style={styles.eventCard} onClick={() => { setSelectedEvent(event); calculateCarpools(event); }}>
              <div style={styles.eventDate}>
                <div style={styles.eventMonth}>{new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
                <div style={styles.eventDay}>{new Date(event.date).getDate()}</div>
              </div>
              <div style={styles.eventInfo}>
                <div style={styles.eventTitle}>{event.title}</div>
                <div style={styles.eventTime}>⏰ {event.time}</div>
                <div style={styles.eventTime}>📍 {event.location}</div>
                <span style={{...styles.badge, ...(event.type === 'game' ? styles.gameBadge : styles.practiceBadge)}}>
                  {event.type}
                </span>
              </div>
            </div>
          ))}

          <div style={{...styles.card, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', marginTop: '20px', cursor: 'default'}}>
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>💬 Team Chat Active</div>
            <div style={{ fontSize: '14px', opacity: '0.9' }}>{chatMessages.length} messages • Tap Chat to view</div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div style={styles.bottomNav}>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('home')}>
            <div style={{...styles.navIcon, color: '#22c55e'}}>🏠</div>
            <div style={{...styles.navLabel, color: '#22c55e'}}>Home</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('schedule')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>📅</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Schedule</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('carpoolManage')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>🚗</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Carpool</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('roster')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>👥</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Roster</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('chat')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>💬</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Chat</div>
          </button>
        </div>
      </div>
    );
  }

  // SCHEDULE SCREEN
  if (currentScreen === 'schedule') {
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <div style={styles.logo}>📅 Schedule</div>
        </div>

        <div style={styles.content}>
          <div style={styles.sectionTitle}>All Events</div>
          {sampleTeam.schedule.map(event => (
            <div key={event.id} style={styles.eventCard} onClick={() => { setSelectedEvent(event); calculateCarpools(event); }}>
              <div style={styles.eventDate}>
                <div style={styles.eventMonth}>{new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
                <div style={styles.eventDay}>{new Date(event.date).getDate()}</div>
              </div>
              <div style={styles.eventInfo}>
                <div style={styles.eventTitle}>{event.title}</div>
                <div style={styles.eventTime}>⏰ {event.time}</div>
                <div style={styles.eventTime}>📍 {event.location}</div>
                <span style={{...styles.badge, ...(event.type === 'game' ? styles.gameBadge : styles.practiceBadge)}}>
                  {event.type}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.bottomNav}>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('home')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>🏠</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Home</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('schedule')}>
            <div style={{...styles.navIcon, color: '#22c55e'}}>📅</div>
            <div style={{...styles.navLabel, color: '#22c55e'}}>Schedule</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('carpoolManage')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>🚗</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Carpool</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('roster')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>👥</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Roster</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('chat')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>💬</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Chat</div>
          </button>
        </div>
      </div>
    );
  }

  // ROSTER SCREEN
  if (currentScreen === 'roster') {
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <div style={styles.logo}>👥 Team Roster</div>
        </div>

        <div style={styles.content}>
          <div style={styles.sectionTitle}>{sampleTeam.players.length} Players</div>
          {sampleTeam.players.map(player => (
            <div key={player.id} style={styles.playerCard}>
              <div style={styles.playerNumber}>#{player.number}</div>
              <div style={styles.playerInfo}>
                <div style={styles.playerName}>{player.name}</div>
                <div style={styles.parentName}>Parent: {player.parent}</div>
                {player.canDrive && (
                  <span style={styles.driverBadge}>
                    🚗 Driver ({player.seats} seats)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.bottomNav}>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('home')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>🏠</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Home</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('schedule')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>📅</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Schedule</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('carpoolManage')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>🚗</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Carpool</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('roster')}>
            <div style={{...styles.navIcon, color: '#22c55e'}}>👥</div>
            <div style={{...styles.navLabel, color: '#22c55e'}}>Roster</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('chat')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>💬</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Chat</div>
          </button>
        </div>
      </div>
    );
  }

  // CARPOOL SCREEN
  if (currentScreen === 'carpool' && carpoolData) {
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => setCurrentScreen('home')}>←</button>
          <div style={styles.logo}>🚗 Carpool</div>
          <div></div>
        </div>

        <div style={styles.content}>
          <div style={styles.carpoolHeader}>
            <div style={styles.carpoolTitle}>{carpoolData.event.title}</div>
            <div style={{fontSize: '14px', color: '#6b7280', marginBottom: '4px'}}>
              📅 {carpoolData.event.date} at {carpoolData.event.time}
            </div>
            <div style={{fontSize: '14px', color: '#6b7280'}}>
              📍 {carpoolData.event.location}
            </div>
          </div>

          <div style={styles.sectionTitle}>
            <span>🚗</span>
            <span>Suggested Carpools</span>
          </div>

          {carpoolData.suggestions.map((suggestion, index) => (
            <div key={index} style={styles.carpoolCard}>
              <div style={styles.driverHeader}>
                <div style={styles.driverIcon}>🚗</div>
                <div>
                  <div style={styles.driverName}>{suggestion.driver}</div>
                  <div style={{fontSize: '13px', color: '#6b7280'}}>
                    Driver • {suggestion.driverPlayer}
                  </div>
                </div>
              </div>

              <div>
                <div style={{fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase'}}>
                  Passengers ({suggestion.passengers.length}/{suggestion.seats - 1} seats)
                </div>
                <div style={styles.passengerList}>
                  {suggestion.passengers.map((passenger, i) => (
                    <div key={i} style={styles.passengerItem}>
                      <span>✓</span>
                      <span>{passenger}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button style={{...styles.btn, marginTop: '16px'}}>
                Request Ride
              </button>
            </div>
          ))}

          <div style={{...styles.card, background: '#fef3c7', border: '2px solid #fbbf24', cursor: 'default', textAlign: 'center'}}>
            <div style={{fontSize: '40px', marginBottom: '8px'}}>💡</div>
            <div style={{fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '4px'}}>
              Smart Carpool Matching
            </div>
            <div style={{fontSize: '13px', color: '#92400e'}}>
              We automatically suggest efficient carpool groups based on available drivers and seating capacity
            </div>
          </div>
        </div>

        <div style={styles.bottomNav}>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('home')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>🏠</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Home</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('schedule')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>📅</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Schedule</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('roster')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>👥</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Roster</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('chat')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>💬</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Chat</div>
          </button>
        </div>
      </div>
    );
  }

  // CHAT SCREEN
  if (currentScreen === 'chat') {
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <div style={styles.logo}>💬 Team Chat</div>
        </div>

        <div style={styles.chatContainer}>
          <div style={styles.messagesContainer}>
            {chatMessages.map(msg => (
              <div key={msg.id}>
                <div style={{
                  ...styles.message,
                  ...(msg.sender === user.name ? styles.myMessage : styles.otherMessage)
                }}>
                  {msg.sender !== user.name && (
                    <div style={styles.messageSender}>{msg.sender}</div>
                  )}
                  <div>{msg.message}</div>
                  <div style={styles.messageTime}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.chatInput}>
            <input
              type="text"
              placeholder="Type a message..."
              style={styles.chatTextField}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button style={styles.sendBtn} onClick={sendMessage}>
              📤
            </button>
          </div>
        </div>

        <div style={styles.bottomNav}>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('home')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>🏠</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Home</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('schedule')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>📅</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Schedule</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('carpoolManage')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>🚗</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Carpool</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('roster')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>👥</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Roster</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('chat')}>
            <div style={{...styles.navIcon, color: '#22c55e'}}>💬</div>
            <div style={{...styles.navLabel, color: '#22c55e'}}>Chat</div>
          </button>
        </div>
      </div>
    );
  }

  // CARPOOL MANAGEMENT SCREEN
  if (currentScreen === 'carpoolManage') {
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <div style={styles.logo}>🚗 My Carpools</div>
        </div>

        <div style={styles.content}>
          <div style={styles.sectionTitle}>
            <span>Your Carpool Groups</span>
          </div>

          {carpoolGroups.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px 20px', color: '#6b7280'}}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>🚗</div>
              <div style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px'}}>No Carpool Groups Yet</div>
              <div style={{fontSize: '14px'}}>Create a group to coordinate rides with families you're comfortable with</div>
            </div>
          ) : (
            carpoolGroups.map(group => (
              <div key={group.id} style={styles.card}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
                  <div>
                    <div style={{fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '4px'}}>
                      {group.name}
                    </div>
                    <div style={{fontSize: '13px', color: '#6b7280'}}>
                      Driver: {group.driver}
                    </div>
                  </div>
                  <button
                    style={{...styles.removeBtn}}
                    onClick={() => deleteCarpoolGroup(group.id)}
                  >
                    ✕
                  </button>
                </div>

                <div style={{marginBottom: '12px'}}>
                  <div style={{fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px'}}>
                    Members ({group.members.length})
                  </div>
                  {group.members.map((member, idx) => (
                    <div key={idx} style={{
                      padding: '8px 12px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      marginBottom: '6px',
                      fontSize: '14px',
                      color: '#4b5563',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>⚽</span>
                      <span>{member}</span>
                    </div>
                  ))}
                </div>

                {group.notes && (
                  <div style={{
                    background: '#fef3c7',
                    borderLeft: '3px solid #f59e0b',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#92400e'
                  }}>
                    📝 {group.notes}
                  </div>
                )}
              </div>
            ))
          )}

          <button
            style={{...styles.btn, width: '100%', padding: '16px', fontSize: '16px', marginTop: '20px'}}
            onClick={() => setShowCreateGroup(true)}
          >
            + Create New Carpool Group
          </button>

          <div style={{...styles.card, background: '#dbeafe', border: '2px solid #3b82f6', marginTop: '20px', cursor: 'default'}}>
            <div style={{fontSize: '16px', fontWeight: '600', color: '#1e40af', marginBottom: '8px'}}>
              💡 How Carpool Groups Work
            </div>
            <div style={{fontSize: '13px', color: '#1e3a8a', lineHeight: '1.6'}}>
              Create groups with families you're comfortable carpooling with. When you organize carpools for events, the app will prioritize matching you with your group members.
            </div>
          </div>
        </div>

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div style={styles.modal} onClick={() => setShowCreateGroup(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Create Carpool Group</h3>
                <button style={styles.modalClose} onClick={() => setShowCreateGroup(false)}>✕</button>
              </div>

              <input
                type="text"
                placeholder="Group Name (e.g., Wilson Carpool)"
                style={styles.input}
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />

              <div style={{marginBottom: '16px'}}>
                <div style={{fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px'}}>
                  Select Players to Include:
                </div>
                {sampleTeam.players.map(player => (
                  <div
                    key={player.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      background: selectedMembers.includes(player.name) ? '#dcfce7' : '#f9fafb',
                      borderRadius: '10px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      border: selectedMembers.includes(player.name) ? '2px solid #22c55e' : '2px solid transparent'
                    }}
                    onClick={() => toggleMember(player.name)}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      border: '2px solid #22c55e',
                      background: selectedMembers.includes(player.name) ? '#22c55e' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      {selectedMembers.includes(player.name) && '✓'}
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '15px', fontWeight: '600', color: '#1f2937'}}>{player.name}</div>
                      <div style={{fontSize: '13px', color: '#6b7280'}}>Parent: {player.parent}</div>
                    </div>
                  </div>
                ))}
              </div>

              <textarea
                placeholder="Notes (optional - e.g., pickup/dropoff details)"
                style={{...styles.input, minHeight: '80px', resize: 'vertical'}}
                value={groupNotes}
                onChange={(e) => setGroupNotes(e.target.value)}
              />

              <button
                style={{...styles.btn, width: '100%', padding: '14px', fontSize: '15px'}}
                onClick={createCarpoolGroup}
              >
                Create Group
              </button>
            </div>
          </div>
        )}

        <div style={styles.bottomNav}>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('home')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>🏠</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Home</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('schedule')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>📅</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Schedule</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('carpoolManage')}>
            <div style={{...styles.navIcon, color: '#22c55e'}}>🚗</div>
            <div style={{...styles.navLabel, color: '#22c55e'}}>Carpool</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('roster')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>👥</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Roster</div>
          </button>
          <button style={styles.navBtn} onClick={() => setCurrentScreen('chat')}>
            <div style={{...styles.navIcon, color: '#6b7280'}}>💬</div>
            <div style={{...styles.navLabel, color: '#6b7280'}}>Chat</div>
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
