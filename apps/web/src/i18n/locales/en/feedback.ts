
const feedback = {
    title: 'Feedback',
    badge: 'User Feedback',
    description: 'Your opinion is very important to us! Please tell us your thoughts and help us improve YouthLoop to provide a better environmental experience for more users.',
    form: {
        type: {
            label: 'Feedback Type',
            options: {
                suggestion: 'Feature Suggestion',
                bug: 'Bug Report',
                praise: 'Praise',
                other: 'Other',
            },
        },
        rating: { label: 'Satisfaction Rating', stars: 'stars' },
        title: { label: 'Feedback Title', placeholder: 'Please briefly describe your feedback' },
        content: { label: 'Detailed Content', placeholder: 'Please describe your thoughts, issues encountered, or suggestions in detail...' },
        contact: { label: 'Contact Information (Optional)', placeholder: 'Email or phone number for us to reach you' },
        anonymous: 'Submit Anonymously',
        submit: 'Submit Feedback',
        cancel: 'Cancel',
    },
    success: {
        title: 'Submitted Successfully!',
        description: 'Thank you for your feedback. We will read it carefully and continue to improve.',
        backHome: 'Back to Home',
        continueFeedback: 'Continue Feedback',
    },
    otherContact: {
        title: 'Other Contact Methods',
        email: { title: 'Email Feedback', address: 'feedback@youthloop.org' },
        phone: { title: 'Phone Feedback', number: '400-123-4567' },
        hours: { title: 'Service Hours', schedule: 'Weekdays 9:00-18:00' },
    },
};

export default feedback;
