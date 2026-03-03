from typing import Optional


def match_rule(message: str) -> Optional[str]:
    if not message:
        return None

    text = message.lower()

    rules = [
        (["hello", "hi", "hey"], "Hello! How can I help you today?"),
        (["help", "support"], "Tell me what you need help with and I will try to assist."),
        (["login", "sign in"], "If you cannot log in, please check your email and password."),
        (["password", "reset"], "Use the 'Forgot password' option on the login page."),
        (["signup", "register"], "You can create an account from the Sign Up page."),
        (["device", "add device"], "Devices are managed in the Devices section of the dashboard."),
        (["link device", "assign device"], "Only admins can link devices to users."),
        (["consumption", "limit", "max consumption"], "Each device has a max consumption set by the admin."),
        (["alert", "overconsumption"], "Alerts appear when a device exceeds its max consumption."),
        (["report", "daily report", "history"], "Use the device page to view daily reports."),
        (["delete account", "remove account"], "Please contact an admin to delete your account."),
    ]

    for keywords, response in rules:
        if any(keyword in text for keyword in keywords):
            return response

    return None
