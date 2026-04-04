from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from twilio.rest import Client
from ..models import NotificationLog

def send_email_notification(user, subject, message, attachment=None):
    """
    Sends an email notification via Django's SMTP backend.
    Logs the attempt in NotificationLog.
    Attachment format: ('filename.pdf', content, 'application/pdf')
    """
    try:
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=settings.EMAIL_HOST_USER,
            to=[user.email]
        )
        if attachment:
            email.attach(*attachment)
        
        email.send()
        
        # Log success
        NotificationLog.objects.create(
            user=user,
            notification_type='EMAIL',
            event_name=subject,
            recipient=user.email,
            status='SENT'
        )
        print(f"✅ Email sent to {user.email}")
        return True
    except Exception as e:
        # Log failure
        NotificationLog.objects.create(
            user=user,
            notification_type='EMAIL',
            event_name=subject,
            recipient=user.email,
            status='FAILED',
            error_message=str(e)
        )
        print(f"❌ Email failed: {e}")
        return False

def send_whatsapp_notification(user, message_body):
    """
    Sends a WhatsApp notification via Twilio Sandbox.
    Logs the attempt in NotificationLog.
    Requires user to have a 'profile' with 'phone_number'.
    """
    try:
        # Check if user has a profile and phone number
        if not hasattr(user, 'profile') or not user.profile.phone_number:
            print("⚠️ User has no phone profile/number")
            return False

        # Init Twilio Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        message = client.messages.create(
            from_=f"whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}",
            body=message_body,
            to=f"whatsapp:{user.profile.phone_number}"
        )
        
        NotificationLog.objects.create(
            user=user,
            notification_type='WHATSAPP',
            event_name="WhatsApp Message",
            recipient=str(user.profile.phone_number),
            status='SENT'
        )
        print(f"✅ WhatsApp sent to {user.profile.phone_number}")
        return True
    except Exception as e:
        NotificationLog.objects.create(
            user=user,
            notification_type='WHATSAPP',
            event_name="WhatsApp Message",
            recipient=str(getattr(user.profile, 'phone_number', 'Unknown')),
            status='FAILED',
            error_message=str(e)
        )
        print(f"❌ WhatsApp failed: {e}")
        return False
