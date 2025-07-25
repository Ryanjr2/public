// src/pages/ReservationManagementPage.tsx
import React, { useState, useEffect } from 'react';
import {
  FiCalendar, FiClock, FiUsers, FiPlus, FiSearch,
  FiFilter, FiMapPin, FiPhone, FiMail, FiEdit2,
  FiCheck, FiX, FiAlertCircle, FiEye, FiRefreshCw,
  FiTrendingUp, FiUser
} from 'react-icons/fi';
// Define types locally for now
interface Table {
  id: number;
  number: string;
  capacity: number;
  location: 'indoor' | 'outdoor' | 'private' | 'bar';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  position: { x: number; y: number; };
  shape: 'round' | 'square' | 'rectangle';
  features: string[];
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  preferences: string[];
  special_occasions: string[];
  visit_count: number;
  last_visit?: string;
  notes?: string;
}

interface Reservation {
  id: number;
  reservation_number: string;
  customer: Customer;
  table: Table;
  date: string;
  time: string;
  duration: number;
  party_size: number;
  status: 'confirmed' | 'pending' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  special_requests?: string;
  occasion?: string;
  created_at: string;
  confirmed_at?: string;
  seated_at?: string;
  completed_at?: string;
  deposit_required?: boolean;
  deposit_amount?: number;
  deposit_paid?: boolean;
  assigned_staff?: string;
  notes?: string;
}

interface TimeSlot {
  time: string;
  available_tables: number;
  total_capacity: number;
  reservations: Reservation[];
}

interface WaitlistEntry {
  id: number;
  customer: Customer;
  party_size: number;
  preferred_time: string;
  max_wait_time: number;
  created_at: string;
  status: 'waiting' | 'notified' | 'seated' | 'cancelled';
  estimated_wait: number;
  priority: 'normal' | 'high' | 'vip';
}

interface EventBooking {
  id: number;
  event_number: string;
  customer: Customer;
  event_type: 'wedding' | 'corporate' | 'birthday' | 'anniversary' | 'graduation' | 'funeral' | 'other';
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  venue: 'restaurant' | 'outdoor' | 'customer_location';
  venue_address?: string;
  menu_package: string;
  total_amount: number;
  deposit_amount: number;
  deposit_paid: boolean;
  status: 'inquiry' | 'quoted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  special_requirements: string[];
  created_at: string;
  notes?: string;
}
import { formatCurrency } from '../utils/currency';
import ReservationModal from '../components/ReservationModal';
// import TableLayoutView from '../components/TableLayoutView';
import styles from './ReservationManagement.module.css';

const ReservationManagementPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedView, setSelectedView] = useState<'calendar' | 'table' | 'list'>('calendar');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [events, setEvents] = useState<EventBooking[]>([]);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'reservations' | 'waitlist' | 'events'>('reservations');

  // Mock data for demonstration
  const mockTables: Table[] = [
    {
      id: 1, number: 'T1', capacity: 2, location: 'indoor',
      status: 'available', position: { x: 100, y: 100 },
      shape: 'round', features: ['window_view']
    },
    {
      id: 2, number: 'T2', capacity: 4, location: 'indoor',
      status: 'reserved', position: { x: 200, y: 100 },
      shape: 'square', features: ['quiet']
    },
    {
      id: 3, number: 'T3', capacity: 6, location: 'outdoor',
      status: 'occupied', position: { x: 300, y: 100 },
      shape: 'rectangle', features: ['outdoor_view']
    },
    {
      id: 4, number: 'T4', capacity: 8, location: 'private',
      status: 'available', position: { x: 100, y: 200 },
      shape: 'rectangle', features: ['private_dining', 'wheelchair_accessible']
    }
  ];

  const mockCustomers: Customer[] = [
    {
      id: 1, name: 'John Mwangi', phone: '+255 712 345 678',
      email: 'john@example.com', preferences: ['window_seat'],
      special_occasions: ['anniversary'], visit_count: 5,
      last_visit: '2024-01-10'
    },
    {
      id: 2, name: 'Fatuma Hassan', phone: '+255 754 987 654',
      email: 'fatuma@example.com', preferences: ['quiet_area'],
      special_occasions: [], visit_count: 3,
      last_visit: '2024-01-08'
    }
  ];

  const mockReservations: Reservation[] = [
    {
      id: 1,
      reservation_number: 'RES-001',
      customer: mockCustomers[0],
      table: mockTables[1],
      date: selectedDate,
      time: '19:00',
      duration: 120,
      party_size: 4,
      status: 'confirmed',
      special_requests: 'Anniversary celebration',
      occasion: 'anniversary',
      created_at: '2024-01-15T10:00:00Z',
      confirmed_at: '2024-01-15T10:05:00Z',
      assigned_staff: 'Maria'
    },
    {
      id: 2,
      reservation_number: 'RES-002',
      customer: mockCustomers[1],
      table: mockTables[0],
      date: selectedDate,
      time: '20:30',
      duration: 90,
      party_size: 2,
      status: 'pending',
      created_at: '2024-01-15T14:00:00Z'
    }
  ];

  const mockTimeSlots: TimeSlot[] = [
    {
      time: '18:00',
      available_tables: 3,
      total_capacity: 20,
      reservations: []
    },
    {
      time: '19:00',
      available_tables: 2,
      total_capacity: 16,
      reservations: [mockReservations[0]]
    },
    {
      time: '20:00',
      available_tables: 4,
      total_capacity: 20,
      reservations: []
    },
    {
      time: '20:30',
      available_tables: 3,
      total_capacity: 18,
      reservations: [mockReservations[1]]
    },
    {
      time: '21:00',
      available_tables: 4,
      total_capacity: 20,
      reservations: []
    }
  ];

  const mockWaitlist: WaitlistEntry[] = [
    {
      id: 1,
      customer: { id: 3, name: 'Peter Mwalimu', phone: '+255 765 432 109', email: 'peter@example.com', preferences: [], special_occasions: [], visit_count: 1 },
      party_size: 6,
      preferred_time: '19:30',
      max_wait_time: 45,
      created_at: '2024-01-15T18:30:00Z',
      status: 'waiting',
      estimated_wait: 30,
      priority: 'normal'
    }
  ];

  const mockEvents: EventBooking[] = [
    {
      id: 1,
      event_number: 'EVT-001',
      customer: { id: 4, name: 'Grace Mwangi', phone: '+255 712 555 666', email: 'grace@example.com', preferences: [], special_occasions: ['wedding'], visit_count: 1 },
      event_type: 'wedding',
      event_date: '2024-02-14',
      start_time: '14:00',
      end_time: '22:00',
      guest_count: 150,
      venue: 'outdoor',
      menu_package: 'Premium Wedding Package',
      total_amount: 15000000, // 15M TZS
      deposit_amount: 5000000, // 5M TZS
      deposit_paid: true,
      status: 'confirmed',
      special_requirements: ['Vegetarian options', 'Live band setup', 'Flower decorations'],
      created_at: '2024-01-10T10:00:00Z',
      notes: 'Traditional Tanzanian wedding ceremony'
    },
    {
      id: 2,
      event_number: 'EVT-002',
      customer: { id: 5, name: 'John Kimani', phone: '+255 754 777 888', email: 'john.kimani@company.com', preferences: [], special_occasions: [], visit_count: 2 },
      event_type: 'corporate',
      event_date: '2024-01-25',
      start_time: '09:00',
      end_time: '17:00',
      guest_count: 50,
      venue: 'restaurant',
      menu_package: 'Corporate Meeting Package',
      total_amount: 3500000, // 3.5M TZS
      deposit_amount: 1000000, // 1M TZS
      deposit_paid: false,
      status: 'quoted',
      special_requirements: ['Projector setup', 'WiFi access', 'Coffee breaks'],
      created_at: '2024-01-12T14:00:00Z',
      notes: 'Annual company retreat'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API calls
        setTimeout(() => {
          setTables(mockTables);
          setReservations(mockReservations);
          setTimeSlots(mockTimeSlots);
          setWaitlist(mockWaitlist);
          setEvents(mockEvents);
          setLoading(false);
        }, 1000);

        // Real API calls would be:
        // const [tablesRes, reservationsRes] = await Promise.all([
        //   api.get('/tables/'),
        //   api.get(`/reservations/?date=${selectedDate}`)
        // ]);
        // setTables(tablesRes.data);
        // setReservations(reservationsRes.data);
      } catch (error) {
        console.error('Failed to fetch reservation data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.reservation_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateReservationStatus = async (reservationId: number, newStatus: Reservation['status']) => {
    try {
      setReservations(prev => prev.map(res =>
        res.id === reservationId ? {
          ...res,
          status: newStatus,
          seated_at: newStatus === 'seated' ? new Date().toISOString() : res.seated_at,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : res.completed_at
        } : res
      ));
      // await api.patch(`/reservations/${reservationId}/`, { status: newStatus });

      // Show success message
      alert(`Reservation ${newStatus} successfully!`);
    } catch (error) {
      console.error('Failed to update reservation status:', error);
      alert('Failed to update reservation status');
    }
  };

  const handleWaitlistAction = async (entryId: number, action: 'seat' | 'notify' | 'remove') => {
    try {
      switch (action) {
        case 'seat':
          // Move from waitlist to seated
          const entry = waitlist.find(w => w.id === entryId);
          if (entry) {
            // Create a new reservation
            const newReservation: Reservation = {
              id: Date.now(),
              reservation_number: `RES-${String(Date.now()).slice(-3)}`,
              customer: entry.customer,
              table: tables.find(t => t.capacity >= entry.party_size && t.status === 'available') || tables[0],
              date: selectedDate,
              time: entry.preferred_time,
              duration: 120,
              party_size: entry.party_size,
              status: 'seated',
              created_at: new Date().toISOString(),
              seated_at: new Date().toISOString()
            };
            setReservations(prev => [...prev, newReservation]);
            setWaitlist(prev => prev.filter(w => w.id !== entryId));
            alert(`${entry.customer.name} has been seated at a table!`);
          }
          break;
        case 'notify':
          const notifyEntry = waitlist.find(w => w.id === entryId);
          if (notifyEntry) {
            setWaitlist(prev => prev.map(w =>
              w.id === entryId ? { ...w, status: 'notified' as const } : w
            ));
            alert(`Notification sent to ${notifyEntry.customer.name} at ${notifyEntry.customer.phone}`);
          }
          break;
        case 'remove':
          const removeEntry = waitlist.find(w => w.id === entryId);
          if (removeEntry && confirm(`Remove ${removeEntry.customer.name} from waitlist?`)) {
            setWaitlist(prev => prev.filter(w => w.id !== entryId));
            alert('Customer removed from waitlist');
          }
          break;
      }
    } catch (error) {
      console.error('Failed to handle waitlist action:', error);
      alert('Failed to perform action');
    }
  };

  const handleEventAction = async (eventId: number, action: 'view' | 'edit' | 'quote' | 'confirm' | 'cancel') => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      switch (action) {
        case 'view':
          alert(`Event Details:\n\nEvent: ${event.event_number}\nCustomer: ${event.customer.name}\nType: ${event.event_type}\nDate: ${event.event_date}\nGuests: ${event.guest_count}\nVenue: ${event.venue}\nTotal: ${formatCurrency(event.total_amount)}\nDeposit: ${formatCurrency(event.deposit_amount)} (${event.deposit_paid ? 'Paid' : 'Pending'})\n\nSpecial Requirements:\n${event.special_requirements.join('\n')}`);
          break;
        case 'edit':
          setShowEventModal(true);
          // In a real app, you'd set the editing event
          break;
        case 'quote':
          if (confirm(`Send quote to ${event.customer.name}?`)) {
            setEvents(prev => prev.map(e =>
              e.id === eventId ? { ...e, status: 'quoted' as const } : e
            ));
            alert(`Quote sent to ${event.customer.email || event.customer.phone}`);
          }
          break;
        case 'confirm':
          if (confirm(`Confirm event booking for ${event.customer.name}?`)) {
            setEvents(prev => prev.map(e =>
              e.id === eventId ? { ...e, status: 'confirmed' as const } : e
            ));
            alert('Event confirmed successfully!');
          }
          break;
        case 'cancel':
          if (confirm(`Cancel event booking for ${event.customer.name}? This action cannot be undone.`)) {
            setEvents(prev => prev.map(e =>
              e.id === eventId ? { ...e, status: 'cancelled' as const } : e
            ));
            alert('Event cancelled');
          }
          break;
      }
    } catch (error) {
      console.error('Failed to handle event action:', error);
      alert('Failed to perform action');
    }
  };

  const addToWaitlist = () => {
    const customerName = prompt('Customer Name:');
    const customerPhone = prompt('Customer Phone (+255...):');
    const partySize = prompt('Party Size:');
    const preferredTime = prompt('Preferred Time (HH:MM):');

    if (customerName && customerPhone && partySize && preferredTime) {
      const newEntry: WaitlistEntry = {
        id: Date.now(),
        customer: {
          id: Date.now(),
          name: customerName,
          phone: customerPhone,
          preferences: [],
          special_occasions: [],
          visit_count: 1
        },
        party_size: parseInt(partySize),
        preferred_time: preferredTime,
        max_wait_time: 60,
        created_at: new Date().toISOString(),
        status: 'waiting',
        estimated_wait: 30,
        priority: 'normal'
      };
      setWaitlist(prev => [...prev, newEntry]);
      alert('Customer added to waitlist successfully!');
    }
  };

  const createQuickReservation = () => {
    const customerName = prompt('Customer Name:');
    const customerPhone = prompt('Customer Phone (+255...):');
    const partySize = prompt('Party Size:');
    const time = prompt('Time (HH:MM):');

    if (customerName && customerPhone && partySize && time) {
      const availableTable = tables.find(t => t.capacity >= parseInt(partySize) && t.status === 'available');

      if (!availableTable) {
        if (confirm('No tables available. Add to waitlist instead?')) {
          const newEntry: WaitlistEntry = {
            id: Date.now(),
            customer: {
              id: Date.now(),
              name: customerName,
              phone: customerPhone,
              preferences: [],
              special_occasions: [],
              visit_count: 1
            },
            party_size: parseInt(partySize),
            preferred_time: time,
            max_wait_time: 60,
            created_at: new Date().toISOString(),
            status: 'waiting',
            estimated_wait: 30,
            priority: 'normal'
          };
          setWaitlist(prev => [...prev, newEntry]);
          alert('Customer added to waitlist!');
        }
        return;
      }

      const newReservation: Reservation = {
        id: Date.now(),
        reservation_number: `RES-${String(Date.now()).slice(-3)}`,
        customer: {
          id: Date.now(),
          name: customerName,
          phone: customerPhone,
          preferences: [],
          special_occasions: [],
          visit_count: 1
        },
        table: availableTable,
        date: selectedDate,
        time: time,
        duration: 120,
        party_size: parseInt(partySize),
        status: 'confirmed',
        created_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString()
      };

      setReservations(prev => [...prev, newReservation]);
      alert('Reservation created successfully!');
    }
  };

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'seated': return '#3b82f6';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      case 'no_show': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getTodayStats = () => {
    const today = reservations.filter(res => res.date === selectedDate);
    const todayEvents = events.filter(event => event.event_date === selectedDate);
    const activeWaitlist = waitlist.filter(entry => entry.status === 'waiting');

    return {
      total: today.length,
      confirmed: today.filter(res => res.status === 'confirmed').length,
      pending: today.filter(res => res.status === 'pending').length,
      totalCovers: today.reduce((sum, res) => sum + res.party_size, 0),
      waitlistCount: activeWaitlist.length,
      eventsToday: todayEvents.length,
      eventRevenue: todayEvents.reduce((sum, event) => sum + event.total_amount, 0)
    };
  };

  const stats = getTodayStats();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading reservations...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Reservation Management</h1>
          <p className={styles.subtitle}>Manage table bookings and customer reservations</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.addButton}
            onClick={() => setShowReservationModal(true)}
          >
            <FiPlus /> New Reservation
          </button>
          <button
            className={styles.waitlistButton}
            onClick={addToWaitlist}
          >
            <FiClock /> Add to Waitlist
          </button>
          <button
            className={styles.eventButton}
            onClick={() => alert('Event booking form coming soon! For now, use the Events tab to view existing bookings.')}
          >
            <FiCalendar /> Book Event
          </button>
          <button
            className={styles.refreshButton}
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setTables(mockTables);
                setReservations(mockReservations);
                setTimeSlots(mockTimeSlots);
                setWaitlist(mockWaitlist);
                setEvents(mockEvents);
                setLoading(false);
                alert('Data refreshed successfully!');
              }, 500);
            }}
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#3b82f6' }}>
            <FiCalendar />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Reservations</h3>
            <p>{stats.total}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#10b981' }}>
            <FiCheck />
          </div>
          <div className={styles.statInfo}>
            <h3>Confirmed</h3>
            <p>{stats.confirmed}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#f59e0b' }}>
            <FiClock />
          </div>
          <div className={styles.statInfo}>
            <h3>Waitlist</h3>
            <p>{stats.waitlistCount}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#8b5cf6' }}>
            <FiUsers />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Covers</h3>
            <p>{stats.totalCovers}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#ef4444' }}>
            <FiCalendar />
          </div>
          <div className={styles.statInfo}>
            <h3>Events Today</h3>
            <p>{stats.eventsToday}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: '#10b981' }}>
            <FiTrendingUp />
          </div>
          <div className={styles.statInfo}>
            <h3>Event Revenue</h3>
            <p>{formatCurrency(stats.eventRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.dateControl}>
          <FiCalendar className={styles.controlIcon} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>

        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${selectedTab === 'reservations' ? styles.active : ''}`}
            onClick={() => setSelectedTab('reservations')}
          >
            <FiCalendar /> Reservations
          </button>
          <button
            className={`${styles.tabButton} ${selectedTab === 'waitlist' ? styles.active : ''}`}
            onClick={() => setSelectedTab('waitlist')}
          >
            <FiClock /> Waitlist ({waitlist.filter(w => w.status === 'waiting').length})
          </button>
          <button
            className={`${styles.tabButton} ${selectedTab === 'events' ? styles.active : ''}`}
            onClick={() => setSelectedTab('events')}
          >
            <FiUsers /> Events & Catering
          </button>
        </div>

        {selectedTab === 'reservations' && (
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${selectedView === 'calendar' ? styles.active : ''}`}
              onClick={() => setSelectedView('calendar')}
            >
              <FiCalendar /> Calendar
            </button>
            <button
              className={`${styles.viewButton} ${selectedView === 'table' ? styles.active : ''}`}
              onClick={() => setSelectedView('table')}
            >
              <FiMapPin /> Tables
            </button>
            <button
              className={`${styles.viewButton} ${selectedView === 'list' ? styles.active : ''}`}
              onClick={() => setSelectedView('list')}
            >
              <FiEye /> List
            </button>
          </div>
        )}

        <div className={styles.searchFilter}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search reservations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="seated">Seated</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {selectedTab === 'reservations' && selectedView === 'calendar' && (
          <div className={styles.calendarView}>
            <h3>Time Slots for {new Date(selectedDate).toLocaleDateString()}</h3>
            <div className={styles.timeSlots}>
              {timeSlots.map(slot => (
                <div key={slot.time} className={styles.timeSlot}>
                  <div className={styles.slotHeader}>
                    <span className={styles.slotTime}>{slot.time}</span>
                    <span className={styles.slotCapacity}>
                      {slot.available_tables} tables • {slot.total_capacity} seats
                    </span>
                  </div>
                  <div className={styles.slotReservations}>
                    {slot.reservations.map(reservation => (
                      <div key={reservation.id} className={styles.slotReservation}>
                        <span className={styles.customerName}>{reservation.customer.name}</span>
                        <span className={styles.partySize}>{reservation.party_size} guests</span>
                        <span className={styles.tableNumber}>Table {reservation.table.number}</span>
                        <span 
                          className={styles.reservationStatus}
                          style={{ backgroundColor: getStatusColor(reservation.status) }}
                        >
                          {reservation.status}
                        </span>
                      </div>
                    ))}
                    {slot.reservations.length === 0 && (
                      <div className={styles.emptySlot}>No reservations</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'reservations' && selectedView === 'table' && (
          <div className={styles.tableView}>
            <h3>Restaurant Layout</h3>
            <p>Table layout view coming soon...</p>
          </div>
        )}

        {selectedTab === 'reservations' && selectedView === 'list' && (
          <div className={styles.listView}>
            <div className={styles.reservationsList}>
              {filteredReservations.map(reservation => (
                <div key={reservation.id} className={styles.reservationCard}>
                  <div className={styles.reservationHeader}>
                    <div className={styles.reservationInfo}>
                      <h4>{reservation.reservation_number}</h4>
                      <span className={styles.reservationTime}>
                        {reservation.time} • {reservation.party_size} guests
                      </span>
                    </div>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(reservation.status) }}
                    >
                      {reservation.status}
                    </span>
                  </div>

                  <div className={styles.customerDetails}>
                    <div className={styles.customerInfo}>
                      <FiUsers /> {reservation.customer.name}
                    </div>
                    <div className={styles.customerInfo}>
                      <FiPhone /> {reservation.customer.phone}
                    </div>
                    {reservation.customer.email && (
                      <div className={styles.customerInfo}>
                        <FiMail /> {reservation.customer.email}
                      </div>
                    )}
                  </div>

                  <div className={styles.reservationDetails}>
                    <span>Table {reservation.table.number}</span>
                    <span>{reservation.duration} minutes</span>
                    {reservation.occasion && (
                      <span className={styles.occasion}>{reservation.occasion}</span>
                    )}
                  </div>

                  {reservation.special_requests && (
                    <div className={styles.specialRequests}>
                      <FiAlertCircle />
                      <span>{reservation.special_requests}</span>
                    </div>
                  )}

                  <div className={styles.reservationActions}>
                    {reservation.status === 'pending' && (
                      <button
                        className={styles.confirmButton}
                        onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                      >
                        <FiCheck /> Confirm
                      </button>
                    )}
                    {reservation.status === 'confirmed' && (
                      <button
                        className={styles.seatButton}
                        onClick={() => updateReservationStatus(reservation.id, 'seated')}
                      >
                        <FiUsers /> Seat Guests
                      </button>
                    )}
                    <button
                      className={styles.editButton}
                      onClick={() => {
                        setEditingReservation(reservation);
                        setShowReservationModal(true);
                      }}
                    >
                      <FiEdit2 /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waitlist View */}
        {selectedTab === 'waitlist' && (
          <div className={styles.waitlistView}>
            <h3>Customer Waitlist</h3>
            <div className={styles.waitlistGrid}>
              {waitlist.map(entry => (
                <div key={entry.id} className={styles.waitlistCard}>
                  <div className={styles.waitlistHeader}>
                    <div className={styles.customerInfo}>
                      <h4>{entry.customer.name}</h4>
                      <span>{entry.party_size} guests • {entry.preferred_time}</span>
                    </div>
                    <span
                      className={`${styles.priorityBadge} ${styles[entry.priority]}`}
                    >
                      {entry.priority}
                    </span>
                  </div>
                  <div className={styles.waitlistDetails}>
                    <div className={styles.waitInfo}>
                      <FiClock />
                      <span>Est. wait: {entry.estimated_wait} min</span>
                    </div>
                    <div className={styles.waitInfo}>
                      <FiPhone />
                      <span>{entry.customer.phone}</span>
                    </div>
                  </div>
                  <div className={styles.waitlistActions}>
                    <button
                      className={styles.seatButton}
                      onClick={() => handleWaitlistAction(entry.id, 'seat')}
                    >
                      <FiCheck /> Seat Now
                    </button>
                    <button
                      className={styles.notifyButton}
                      onClick={() => handleWaitlistAction(entry.id, 'notify')}
                    >
                      <FiPhone /> Notify
                    </button>
                    <button
                      className={styles.removeButton}
                      onClick={() => handleWaitlistAction(entry.id, 'remove')}
                    >
                      <FiX /> Remove
                    </button>
                  </div>
                </div>
              ))}
              {waitlist.length === 0 && (
                <div className={styles.emptyState}>
                  <FiClock size={48} />
                  <h3>No customers waiting</h3>
                  <p>Waitlist is currently empty</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Events & Catering View */}
        {selectedTab === 'events' && (
          <div className={styles.eventsView}>
            <h3>Events & Catering Bookings</h3>
            <div className={styles.eventsGrid}>
              {events.map(event => (
                <div key={event.id} className={styles.eventCard}>
                  <div className={styles.eventHeader}>
                    <div className={styles.eventInfo}>
                      <h4>{event.event_number}</h4>
                      <span className={styles.eventType}>{event.event_type}</span>
                    </div>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(event.status) }}
                    >
                      {event.status}
                    </span>
                  </div>

                  <div className={styles.eventDetails}>
                    <div className={styles.eventCustomer}>
                      <FiUser />
                      <span>{event.customer.name}</span>
                    </div>
                    <div className={styles.eventDate}>
                      <FiCalendar />
                      <span>{new Date(event.event_date).toLocaleDateString()} • {event.start_time} - {event.end_time}</span>
                    </div>
                    <div className={styles.eventGuests}>
                      <FiUsers />
                      <span>{event.guest_count} guests • {event.venue}</span>
                    </div>
                    <div className={styles.eventPackage}>
                      <span className={styles.packageName}>{event.menu_package}</span>
                    </div>
                  </div>

                  <div className={styles.eventFinancials}>
                    <div className={styles.totalAmount}>
                      Total: {formatCurrency(event.total_amount)}
                    </div>
                    <div className={styles.depositInfo}>
                      Deposit: {formatCurrency(event.deposit_amount)}
                      <span className={`${styles.depositStatus} ${event.deposit_paid ? styles.paid : styles.pending}`}>
                        {event.deposit_paid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {event.special_requirements.length > 0 && (
                    <div className={styles.specialRequirements}>
                      <FiAlertCircle />
                      <span>{event.special_requirements.join(', ')}</span>
                    </div>
                  )}

                  <div className={styles.eventActions}>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleEventAction(event.id, 'view')}
                    >
                      <FiEye /> View Details
                    </button>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEventAction(event.id, 'edit')}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    {event.status === 'inquiry' && (
                      <button
                        className={styles.quoteButton}
                        onClick={() => handleEventAction(event.id, 'quote')}
                      >
                        <FiTrendingUp /> Send Quote
                      </button>
                    )}
                    {event.status === 'quoted' && (
                      <button
                        className={styles.confirmButton}
                        onClick={() => handleEventAction(event.id, 'confirm')}
                      >
                        <FiCheck /> Confirm
                      </button>
                    )}
                    {(event.status === 'confirmed' || event.status === 'quoted') && (
                      <button
                        className={styles.cancelButton}
                        onClick={() => handleEventAction(event.id, 'cancel')}
                      >
                        <FiX /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className={styles.emptyState}>
                  <FiCalendar size={48} />
                  <h3>No events booked</h3>
                  <p>No events or catering bookings found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => {
          setShowReservationModal(false);
          setEditingReservation(null);
        }}
        reservation={editingReservation}
        tables={tables}
        onSave={(reservationData) => {
          try {
            if (editingReservation) {
              // Update existing reservation
              setReservations(prev => prev.map(res =>
                res.id === editingReservation.id ? {
                  ...res,
                  customer: {
                    ...res.customer,
                    name: reservationData.customer_name,
                    phone: reservationData.customer_phone,
                    email: reservationData.customer_email
                  },
                  date: reservationData.date,
                  time: reservationData.time,
                  party_size: reservationData.party_size,
                  duration: reservationData.duration,
                  table: tables.find(t => t.id === reservationData.table_id) || res.table,
                  special_requests: reservationData.special_requests,
                  occasion: reservationData.occasion
                } : res
              ));
              alert('Reservation updated successfully!');
            } else {
              // Create new reservation
              const selectedTable = tables.find(t => t.id === reservationData.table_id);
              if (!selectedTable) {
                alert('Please select a valid table');
                return;
              }

              const newReservation: Reservation = {
                id: Date.now(),
                reservation_number: `RES-${String(Date.now()).slice(-3)}`,
                customer: {
                  id: Date.now(),
                  name: reservationData.customer_name,
                  phone: reservationData.customer_phone,
                  email: reservationData.customer_email,
                  preferences: [],
                  special_occasions: reservationData.occasion ? [reservationData.occasion] : [],
                  visit_count: 1
                },
                table: selectedTable,
                date: reservationData.date,
                time: reservationData.time,
                duration: reservationData.duration,
                party_size: reservationData.party_size,
                status: 'confirmed',
                special_requests: reservationData.special_requests,
                occasion: reservationData.occasion,
                created_at: new Date().toISOString(),
                confirmed_at: new Date().toISOString()
              };

              setReservations(prev => [...prev, newReservation]);
              alert('Reservation created successfully!');
            }

            setShowReservationModal(false);
            setEditingReservation(null);
          } catch (error) {
            console.error('Failed to save reservation:', error);
            alert('Failed to save reservation');
          }
        }}
      />
    </div>
  );
};

export default ReservationManagementPage;
