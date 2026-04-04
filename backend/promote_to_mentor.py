"""
Script to promote the current user (by username) to a Mentor.
Run: python promote_to_mentor.py <username>
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth.models import User
from api.models import MentorProfile

if len(sys.argv) < 2:
    print("Usage: python promote_to_mentor.py <username>")
    print("\nAvailable users:")
    for u in User.objects.all():
        print(f"  - {u.username}")
    sys.exit(1)

username = sys.argv[1]

try:
    user = User.objects.get(username=username)
except User.DoesNotExist:
    print(f"User '{username}' not found.")
    sys.exit(1)

# Check if already a mentor
if hasattr(user, 'mentor_profile'):
    print(f"User '{username}' is already a mentor!")
    print(f"  Title: {user.mentor_profile.title}")
    print(f"  Company: {user.mentor_profile.company}")
    sys.exit(0)

# Create MentorProfile
profile = MentorProfile.objects.create(
    user=user,
    title="Full Stack Developer",
    company="SkillMeter",
    hourly_rate=10,
    about="A passionate mentor helping students learn and grow.",
    skills=["React", "Python", "Django", "JavaScript"],
    is_verified=True
)

print(f"SUCCESS! User '{username}' is now a mentor.")
print(f"  Profile ID: {profile.id}")
print(f"  Title: {profile.title}")
print("\nNow, when you log in as '{username}' and visit Mentor Studio,")
print("any bookings made TO this mentor will appear.")
