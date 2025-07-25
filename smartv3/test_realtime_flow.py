#!/usr/bin/env python3
"""
Comprehensive Real-time Flow Test
Tests the complete customer-kitchen-backend integration
"""

import requests
import time
import json

BASE_URL = "http://localhost:8000/api"
CUSTOMER_URL = "http://localhost:3000"
KITCHEN_URL = "http://localhost:5173"

def test_complete_flow():
    print("🧪 TESTING COMPLETE REAL-TIME FLOW")
    print("=" * 50)
    
    # Step 1: Customer places order
    print("\n1️⃣ CUSTOMER PLACES ORDER")
    order_data = {
        "items": [
            {"menu_item_id": 1, "quantity": 2},
            {"menu_item_id": 2, "quantity": 1}
        ],
        "special_instructions": "Extra spicy please"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/orders/", json=order_data)
        if response.status_code == 201:
            order = response.json()
            order_id = order['id']
            print(f"✅ Order created: #{order['order_number']}")
            print(f"   Status: {order['status']}")
            print(f"   Items: {len(order['items'])}")
        else:
            print(f"❌ Failed to create order: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error creating order: {e}")
        return
    
    # Step 2: Check kitchen dashboard
    print(f"\n2️⃣ KITCHEN RECEIVES ORDER")
    try:
        response = requests.get(f"{BASE_URL}/orders/kitchen_dashboard/")
        if response.status_code == 200:
            kitchen_data = response.json()
            print(f"✅ Kitchen dashboard loaded")
            print(f"   Active orders: {kitchen_data['count']}")
            
            # Find our order
            our_order = None
            for order in kitchen_data['orders']:
                if order['id'] == order_id:
                    our_order = order
                    break
            
            if our_order:
                print(f"✅ Order #{our_order['order_number']} visible in kitchen")
            else:
                print(f"❌ Order not found in kitchen dashboard")
        else:
            print(f"❌ Failed to load kitchen dashboard: {response.status_code}")
    except Exception as e:
        print(f"❌ Error loading kitchen dashboard: {e}")
    
    # Step 3: Chef starts cooking
    print(f"\n3️⃣ CHEF STARTS COOKING")
    try:
        # Get first item ID
        response = requests.get(f"{BASE_URL}/orders/{order_id}/")
        order_detail = response.json()
        first_item_id = order_detail['items'][0]['id']
        
        # Update item status to preparing
        response = requests.post(
            f"{BASE_URL}/orders/{order_id}/items/{first_item_id}/update_status/",
            json={"new_status": "preparing"}
        )
        
        if response.status_code == 200:
            print(f"✅ Item {first_item_id} marked as preparing")
        else:
            print(f"❌ Failed to update item status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error updating item status: {e}")
    
    # Step 4: Customer sees real-time update
    print(f"\n4️⃣ CUSTOMER SEES REAL-TIME UPDATE")
    try:
        response = requests.get(f"{BASE_URL}/orders/{order_id}/")
        if response.status_code == 200:
            updated_order = response.json()
            print(f"✅ Customer tracking updated")
            print(f"   Order status: {updated_order['status']}")
            print(f"   First item status: {updated_order['items'][0]['status']}")
        else:
            print(f"❌ Failed to get order update: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting order update: {e}")
    
    # Step 5: Complete the order
    print(f"\n5️⃣ CHEF COMPLETES ORDER")
    try:
        # Mark all items as served
        for item in order_detail['items']:
            requests.post(
                f"{BASE_URL}/orders/{order_id}/items/{item['id']}/update_status/",
                json={"new_status": "served"}
            )
        
        # Complete the order
        response = requests.post(f"{BASE_URL}/orders/complete/{order_id}/")
        
        if response.status_code == 200:
            print(f"✅ Order completed successfully")
        else:
            print(f"❌ Failed to complete order: {response.status_code}")
    except Exception as e:
        print(f"❌ Error completing order: {e}")
    
    # Step 6: Verify order removed from kitchen
    print(f"\n6️⃣ ORDER REMOVED FROM KITCHEN")
    try:
        response = requests.get(f"{BASE_URL}/orders/kitchen_dashboard/")
        if response.status_code == 200:
            kitchen_data = response.json()
            
            # Check if our order is still there
            our_order = None
            for order in kitchen_data['orders']:
                if order['id'] == order_id:
                    our_order = order
                    break
            
            if not our_order:
                print(f"✅ Order removed from kitchen dashboard")
            else:
                print(f"❌ Order still visible in kitchen")
        else:
            print(f"❌ Failed to check kitchen dashboard: {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking kitchen dashboard: {e}")
    
    print(f"\n🎉 REAL-TIME FLOW TEST COMPLETED")
    print("=" * 50)

if __name__ == "__main__":
    test_complete_flow()