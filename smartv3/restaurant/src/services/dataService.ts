// src/services/dataService.ts

// Define all data types
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  preparation_time: number;
}

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  special_instructions?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  table_number?: number;
  delivery_address?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  priority: 'normal' | 'high' | 'urgent';
  items: OrderItem[];
  total_amount: number;
  created_at: string;
  estimated_completion: string;
  special_instructions?: string;
  assigned_staff?: string;
  confirmed_at?: string;
  seated_at?: string;
  completed_at?: string;
}

export interface Reservation {
  id: number;
  reservation_number: string;
  customer: {
    id: number;
    name: string;
    phone: string;
    email?: string;
    preferences: string[];
    special_occasions: string[];
    visit_count: number;
    last_visit?: string;
    notes?: string;
  };
  table: {
    id: number;
    number: string;
    capacity: number;
    location: 'indoor' | 'outdoor' | 'private' | 'bar';
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    position: { x: number; y: number; };
    shape: 'round' | 'square' | 'rectangle';
    features: string[];
  };
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
}

class DataService {
  private storageKeys = {
    menuItems: 'restaurant_menu_items',
    orders: 'restaurant_orders',
    reservations: 'restaurant_reservations',
    completedOrders: 'restaurant_completed_orders'
  };

  // Menu Items Management
  getMenuItems(): MenuItem[] {
    try {
      const stored = localStorage.getItem(this.storageKeys.menuItems);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.getDefaultMenuItems();
    } catch (error) {
      console.error('Failed to load menu items:', error);
      return this.getDefaultMenuItems();
    }
  }

  saveMenuItems(items: MenuItem[]): void {
    try {
      localStorage.setItem(this.storageKeys.menuItems, JSON.stringify(items));
      console.log('✅ Menu items saved to localStorage');
    } catch (error) {
      console.error('Failed to save menu items:', error);
    }
  }

  // Orders Management
  getOrders(): Order[] {
    try {
      const stored = localStorage.getItem(this.storageKeys.orders);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.getDefaultOrders();
    } catch (error) {
      console.error('Failed to load orders:', error);
      return this.getDefaultOrders();
    }
  }

  saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(this.storageKeys.orders, JSON.stringify(orders));
      console.log('✅ Orders saved to localStorage');
    } catch (error) {
      console.error('Failed to save orders:', error);
    }
  }

  // Reservations Management
  getReservations(): Reservation[] {
    try {
      const stored = localStorage.getItem(this.storageKeys.reservations);
      if (stored) {
        return JSON.parse(stored);
      }
      return this.getDefaultReservations();
    } catch (error) {
      console.error('Failed to load reservations:', error);
      return this.getDefaultReservations();
    }
  }

  saveReservations(reservations: Reservation[]): void {
    try {
      localStorage.setItem(this.storageKeys.reservations, JSON.stringify(reservations));
      console.log('✅ Reservations saved to localStorage');
    } catch (error) {
      console.error('Failed to save reservations:', error);
    }
  }

  // Default data generators
  private getDefaultMenuItems(): MenuItem[] {
    return [
      {
        id: 1,
        name: 'Nyama Choma',
        description: 'Grilled meat served with ugali and vegetables',
        price: 25000,
        category: 'Main Dishes',
        available: true,
        preparation_time: 25
      },
      {
        id: 2,
        name: 'Ugali',
        description: 'Traditional cornmeal staple',
        price: 3000,
        category: 'Sides',
        available: true,
        preparation_time: 10
      },
      {
        id: 3,
        name: 'Pilau',
        description: 'Spiced rice with meat and vegetables',
        price: 22000,
        category: 'Main Dishes',
        available: true,
        preparation_time: 30
      },
      {
        id: 4,
        name: 'Samosa',
        description: 'Crispy pastry filled with meat or vegetables',
        price: 2000,
        category: 'Appetizers',
        available: true,
        preparation_time: 15
      },
      {
        id: 5,
        name: 'Chai ya Tangawizi',
        description: 'Ginger tea with milk and spices',
        price: 2500,
        category: 'Beverages',
        available: true,
        preparation_time: 5
      }
    ];
  }

  private getDefaultOrders(): Order[] {
    return [
      {
        id: 1,
        order_number: 'ORD-001',
        customer_name: 'John Mwangi',
        customer_phone: '+255 712 345 678',
        customer_email: 'john@example.com',
        order_type: 'dine_in',
        table_number: 5,
        status: 'confirmed',
        priority: 'normal',
        items: [
          {
            id: 1,
            name: 'Nyama Choma',
            quantity: 2,
            price: 25000,
            status: 'pending'
          },
          {
            id: 2,
            name: 'Ugali',
            quantity: 2,
            price: 3000,
            status: 'pending'
          }
        ],
        total_amount: 56000,
        created_at: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + 30 * 60000).toISOString(),
        special_instructions: 'Medium spice level'
      }
    ];
  }

  private getDefaultReservations(): Reservation[] {
    return [
      {
        id: 1,
        reservation_number: 'RES-001',
        customer: {
          id: 1,
          name: 'John Mwangi',
          phone: '+255 712 345 678',
          email: 'john@example.com',
          preferences: ['window_seat'],
          special_occasions: ['anniversary'],
          visit_count: 5,
          last_visit: '2024-01-10'
        },
        table: {
          id: 2,
          number: 'T2',
          capacity: 4,
          location: 'indoor',
          status: 'reserved',
          position: { x: 200, y: 100 },
          shape: 'square',
          features: ['quiet']
        },
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        duration: 120,
        party_size: 4,
        status: 'confirmed',
        special_requests: 'Anniversary celebration',
        occasion: 'anniversary',
        created_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString()
      }
    ];
  }

  // Clear all data
  clearAllData(): void {
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ All data cleared from localStorage');
  }

  // Initialize with default data if empty
  initializeData(): void {
    if (!localStorage.getItem(this.storageKeys.menuItems)) {
      this.saveMenuItems(this.getDefaultMenuItems());
    }
    if (!localStorage.getItem(this.storageKeys.orders)) {
      this.saveOrders(this.getDefaultOrders());
    }
    if (!localStorage.getItem(this.storageKeys.reservations)) {
      this.saveReservations(this.getDefaultReservations());
    }
    console.log('🔄 Data service initialized');
  }
}

// Create singleton instance
export const dataService = new DataService();

// Initialize on load
if (typeof window !== 'undefined') {
  dataService.initializeData();
}
