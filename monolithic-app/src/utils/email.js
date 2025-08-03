// Mock email functions for development
// In production, these would use nodemailer or AWS SES

const sendEmail = async (to, subject, html, text) => {
    console.log('Mock email sent:', { to, subject, html, text });
    return { success: true, messageId: 'mock-message-id' };
};

const sendVerificationEmail = async (email, otp) => {
    const subject = 'Verify Your Account - TheInfluencer.in';
    const html = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto;">
            <h2 style="color: #333;">Verify Your Account</h2>
            <p style="font-size: 18px; color: #555;">Use the following OTP to complete your verification:</p>
            <h1 style="font-size: 32px; color: #007BFF; margin: 10px 0;">${otp}</h1>
            <p style="font-size: 14px; color: #888;">This OTP is valid for 5 minutes.</p>
        </div>
    `;
    const text = `Your verification code is: ${otp}. This code is valid for 5 minutes.`;
    
    return await sendEmail(email, subject, html, text);
};

const sendPasswordResetEmail = async (email, otp) => {
    const subject = 'Password Reset - TheInfluencer.in';
    const html = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto;">
            <h2 style="color: #333;">Password Reset</h2>
            <p style="font-size: 18px; color: #555;">Use the following OTP to reset your password:</p>
            <h1 style="font-size: 32px; color: #007BFF; margin: 10px 0;">${otp}</h1>
            <p style="font-size: 14px; color: #888;">This OTP is valid for 10 minutes.</p>
        </div>
    `;
    const text = `Your password reset code is: ${otp}. This code is valid for 10 minutes.`;
    
    return await sendEmail(email, subject, html, text);
};

const sendCollaborationNotification = async (email, collaborationData) => {
    const subject = 'New Collaboration Request - TheInfluencer.in';
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #333;">New Collaboration Request</h2>
            <p>You have received a new collaboration request from ${collaborationData.brand_name}.</p>
            <p><strong>Campaign:</strong> ${collaborationData.title}</p>
            <p><strong>Budget:</strong> $${collaborationData.budget.min} - $${collaborationData.budget.max}</p>
            <p>Log in to your dashboard to view the full details and respond.</p>
        </div>
    `;
    const text = `You have received a new collaboration request from ${collaborationData.brand_name}. Campaign: ${collaborationData.title}. Budget: $${collaborationData.budget.min} - $${collaborationData.budget.max}. Log in to your dashboard to view the full details and respond.`;
    
    return await sendEmail(email, subject, html, text);
};

const sendWelcomeEmail = async (email, name, userType) => {
    const subject = 'Welcome to TheInfluencer.in!';
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #333;">Welcome to TheInfluencer.in!</h2>
            <p>Hi ${name},</p>
            <p>Welcome to TheInfluencer.in! We're excited to have you join our platform as a ${userType}.</p>
            <p>Complete your profile to start connecting with ${userType === 'influencer' ? 'brands' : 'influencers'} and grow your business.</p>
        </div>
    `;
    const text = `Hi ${name}, Welcome to TheInfluencer.in! We're excited to have you join our platform as a ${userType}. Complete your profile to start connecting with ${userType === 'influencer' ? 'brands' : 'influencers'} and grow your business.`;
    
    return await sendEmail(email, subject, html, text);
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendCollaborationNotification,
    sendWelcomeEmail
}; 