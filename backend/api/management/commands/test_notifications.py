from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.utils.notifications import send_email_notification, send_whatsapp_notification
import os

class Command(BaseCommand):
    help = 'Test notification systems (Email and WhatsApp)'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username of the user to send notifications to')
        parser.add_argument('--email', action='store_true', help='Test Email notification')
        parser.add_argument('--whatsapp', action='store_true', help='Test WhatsApp notification')

    def handle(self, *args, **options):
        username = options['username']
        test_email = options['email']
        test_whatsapp = options['whatsapp']

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User "{username}" not found'))
            return

        self.stdout.write(f'Testing notifications for user: {username}')

        if test_email:
            self.stdout.write('Sending test email...')
            success = send_email_notification(
                user=user,
                subject="Test Notification from SkillMeter",
                message="This is a test email to verify your SMTP settings are working correctly."
            )
            if success:
                self.stdout.write(self.style.SUCCESS('✅ Email sent successfully'))
            else:
                self.stdout.write(self.style.ERROR('❌ Email failed to send (check logs/console)'))

        if test_whatsapp:
            self.stdout.write('Sending test WhatsApp...')
            success = send_whatsapp_notification(
                user=user,
                message_body="This is a test message from SkillMeter backend! 🚀"
            )
            if success:
                self.stdout.write(self.style.SUCCESS('✅ WhatsApp message sent successfully'))
            else:
                self.stdout.write(self.style.ERROR('❌ WhatsApp failed to send (check logs/console)'))

        if not test_email and not test_whatsapp:
            self.stdout.write(self.style.WARNING('No test type specified. Use --email or --whatsapp'))
