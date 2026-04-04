import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import random
from django.contrib.auth.models import User
from api.models import MentorProfile

def create_mentors():
    mentors_data = [
        {
            "username": "sarah_chen",
            "first_name": "Sarah",
            "last_name": "Chen",
            "title": "Senior System Architect",
            "company": "Google",
            "rate": 10,
            "skills": ["System Design", "Scalability", "Cloud Architecture"]
        },
        {
            "username": "david_miller",
            "first_name": "David",
            "last_name": "Miller",
            "title": "Staff Engineer",
            "company": "Netflix",
            "rate": 8,
            "skills": ["React", "Performance", "Node.js"]
        },
        {
            "username": "emily_zhang",
            "first_name": "Emily",
            "last_name": "Zhang",
            "title": "AI Researcher",
            "company": "OpenAI",
            "rate": 12,
            "skills": ["Machine Learning", "Python", "LLMs"]
        }
    ]

    for m in mentors_data:
        # Create User if not exists
        user, created = User.objects.get_or_create(username=m['username'])
        if created:
            user.set_password("password123")
            user.first_name = m['first_name']
            user.last_name = m['last_name']
            user.email = f"{m['username']}@example.com"
            user.save()
            print(f"Created user: {m['username']}")
        
        # Create Mentor Profile
        profile, p_created = MentorProfile.objects.get_or_create(user=user)
        profile.title = m['title']
        profile.company = m['company']
        profile.hourly_rate = m['rate']
        profile.skills = m['skills']
        profile.is_verified = True
        profile.about = f"Experienced {m['title']} at {m['company']}."
        profile.save()
        print(f"Updated mentor profile for: {m['username']}")

if __name__ == "__main__":
    create_mentors()
