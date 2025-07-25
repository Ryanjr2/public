#!/usr/bin/env python3
"""
Script to clear Django cache and rate limiting data
"""

import os
import sys
import django

# Add the Django project to the path
sys.path.append('/home/ryan/Desktop/smart/smartrestaurant-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartrestaurant.settings')

# Setup Django
django.setup()

from django.core.cache import cache
from django.core.management import execute_from_command_line

def clear_cache():
    """Clear Django cache"""
    try:
        cache.clear()
        print("✅ Django cache cleared successfully!")
    except Exception as e:
        print(f"❌ Error clearing cache: {e}")

def main():
    print("🔧 Clearing rate limiting cache...")
    clear_cache()
    
    print("\n🔄 Rate limiting has been disabled in settings.py")
    print("📝 Changes made:")
    print("   - DRF throttling classes commented out")
    print("   - Throttle rates increased to 10000/hour")
    print("   - RATELIMIT_ENABLE set to False")
    
    print("\n🚀 Please restart the Django server:")
    print("   cd smartrestaurant-backend")
    print("   python manage.py runserver")
    
    print("\n✅ After restart, you should be able to:")
    print("   - Register new customers without rate limit errors")
    print("   - Login without rate limit errors")
    print("   - Use the API normally for development")

if __name__ == "__main__":
    main()
