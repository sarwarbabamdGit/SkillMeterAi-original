import os
import django
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Course, Chapter, Concept, Assessment

def seed_data():
    print("🌱 Seeding database...")

    # Clear existing data
    Assessment.objects.all().delete()
    Concept.objects.all().delete()
    Chapter.objects.all().delete()
    Course.objects.all().delete()

    # --- Course 1: React ---
    react_course = Course.objects.create(
        title='Master React Development',
        description='Learn React from the ground up. Build modern web applications with hooks, state management, and best practices.',
        thumbnail='https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
        difficulty='intermediate',
        estimated_hours=24,
        tags=['React', 'JavaScript', 'Frontend', 'Web Development']
    )
    print(f"Created Course: {react_course.title}")

    # Chapter 1
    ch1 = Chapter.objects.create(
        course=react_course,
        title='Getting Started with React',
        description='Introduction to React and setting up your development environment',
        order=1
    )
    
    c1 = Concept.objects.create(
        chapter=ch1,
        title='What is React?',
        description='Understanding React and its core philosophy',
        duration=15,
        video_url='https://www.youtube.com/embed/SqcY0GlETPk',
        notes='# What is React?\n\nReact is a JavaScript library for building user interfaces...',
        content_type='video',
        order=1
    )
    
    # Assessment for Concept 1
    Assessment.objects.create(
        concept=c1,
        time_limit=10,
        questions=[
            {
                "id": "q-1",
                "type": "mcq",
                "question": "What is React primarily used for?",
                "options": ["Backend", "Building UI", "Database", "Server"],
                "correctAnswer": "Building UI"
            }
        ]
    )

    c2 = Concept.objects.create(
        chapter=ch1,
        title='JSX Fundamentals',
        description='Learn the syntax that powers React components',
        duration=25,
        video_url='https://www.youtube.com/embed/7fPXI_MnBOY',
        content_type='video',
        order=2
    )

    # --- Course 2: Python DSA ---
    python_course = Course.objects.create(
        title='Python Data Structures & Algorithms',
        description='Master DSA concepts with Python. Prepare for coding interviews.',
        thumbnail='https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop',
        difficulty='intermediate',
        estimated_hours=32,
        tags=['Python', 'DSA', 'Algorithms']
    )
    print(f"Created Course: {python_course.title}")

    ch2 = Chapter.objects.create(
        course=python_course,
        title='Arrays & Strings',
        description='Fundamental operations on arrays',
        order=1
    )
    
    Concept.objects.create(
        chapter=ch2,
        title='Array Operations',
        description='Understanding arrays and common operations',
        duration=25,
        video_url='https://www.youtube.com/embed/D6xkbGLQesk',
        content_type='video',
        order=1
    )

    print("✅ Database seeded successfully!")

if __name__ == '__main__':
    seed_data()
