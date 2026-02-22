
const help = {
    title: 'Help Center',
    badge: 'Help Support',
    description: "Welcome to YouthLoop Help Center! Here you'll find all the information and support you need. If you can't find the answer, please feel free to contact our customer service team.",
    quickContact: {
        title: 'Quick Contact',
        phone: { title: 'Customer Service', number: '400-123-4567' },
        email: { title: 'Email Support', address: 'help@youthloop.org' },
        chat: { title: 'Online Customer Service', hours: 'Weekdays 9:00-18:00' },
        hours: { title: 'Service Hours', schedule: '7×24 hours' },
        contactUs: 'Contact Us',
    },
    search: { placeholder: 'Search help content...' },
    faq: {
        account: {
            title: 'Account Related',
            register: {
                q: 'How to register a YouthLoop account?',
                a: "Click the 'Register' button in the top right corner of the homepage and fill in the necessary information to complete registration. You can also use third-party accounts for quick login.",
            },
            password: {
                q: 'What to do if I forget my password?',
                a: "Click 'Forgot Password' on the login page, enter your registered email, and we'll send a password reset link to your email.",
            },
            profile: {
                q: 'How to modify personal information?',
                a: "After logging in, go to 'Personal Center' and click 'Edit Profile' to modify your personal information.",
            },
        },
        activities: {
            title: 'Activity Participation',
            register: {
                q: 'How to register for environmental activities?',
                a: "Browse the activity plaza, select activities you're interested in, click 'Register Now' and fill in relevant information.",
            },
            cancel: {
                q: 'Can I cancel after registration?',
                a: "Yes. You can cancel your registration in 'My Activities' up to 24 hours before the activity starts.",
            },
            cancelled: {
                q: 'What if an activity is cancelled?',
                a: 'If an activity is cancelled for any reason, we will notify all registered users promptly and provide alternative activity options.',
            },
        },
        points: {
            title: 'Points System',
            earn: {
                q: 'How to earn points?',
                a: 'Participate in environmental activities, complete daily check-ins, share environmental knowledge, invite friends, etc. can all earn point rewards.',
            },
            use: {
                q: 'What are points for?',
                a: 'Points can be used to redeem environmental gifts, participate in special activities, improve user level, etc.',
            },
            expire: {
                q: 'Do points expire?',
                a: 'Points are valid for 2 years. Points that exceed the validity period will be automatically cleared.',
            },
        },
    },
    moreHelp: {
        title: 'Have other questions?',
        description: "If you haven't found the answer you need, our customer service team is always here to help.",
        contactService: 'Contact Customer Service',
        feedback: 'Feedback',
    },
};

export default help;
