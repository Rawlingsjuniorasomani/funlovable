// Arkesel SMS Service - Mock implementation (requires backend for production)

interface SMSPayload {
  to: string;
  message: string;
  sender?: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Mock SMS history for demo
const smsHistory: { to: string; message: string; sentAt: string; status: string }[] = [];

export const sendSMS = async (payload: SMSPayload): Promise<SMSResponse> => {
  const { to, message, sender = "EduPlatform" } = payload;

  // Validate phone number (Ghana format)
  const phoneRegex = /^(\+233|0)[0-9]{9}$/;
  if (!phoneRegex.test(to.replace(/\s/g, ""))) {
    return { success: false, error: "Invalid phone number format" };
  }

  // In production, this would call Arkesel API
  // For demo, we simulate the SMS sending
  console.log(`[Arkesel SMS] Sending to ${to}:`, message);

  // Store in history for demo
  smsHistory.push({
    to,
    message,
    sentAt: new Date().toISOString(),
    status: "delivered",
  });

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    messageId: `SMS-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
  };
};

export const sendWelcomeSMS = async (phone: string, name: string): Promise<SMSResponse> => {
  const message = `Welcome to EduPlatform, ${name}! Your account has been created successfully. Start exploring courses at eduplatform.com`;
  return sendSMS({ to: phone, message });
};

export const sendSubscriptionSMS = async (phone: string, name: string, plan: string): Promise<SMSResponse> => {
  const message = `Hi ${name}, your ${plan} subscription is now active! You can add your children and start learning. Questions? Call us at 0800-EDU-HELP`;
  return sendSMS({ to: phone, message });
};

export const sendPaymentConfirmationSMS = async (
  phone: string,
  name: string,
  amount: number,
  reference: string
): Promise<SMSResponse> => {
  const message = `Payment confirmed! ${name}, your GHS ${amount} payment (Ref: ${reference}) was successful. Thank you for choosing EduPlatform!`;
  return sendSMS({ to: phone, message });
};

export const sendChildAddedSMS = async (phone: string, parentName: string, childName: string): Promise<SMSResponse> => {
  const message = `Hi ${parentName}, ${childName} has been added to your family account. They can now access all learning materials. Happy learning!`;
  return sendSMS({ to: phone, message });
};

export const sendTeacherApprovalSMS = async (phone: string, name: string, approved: boolean): Promise<SMSResponse> => {
  const message = approved
    ? `Congratulations ${name}! Your teacher account has been approved. You can now login and start creating lessons.`
    : `Hi ${name}, your teacher application is being reviewed. We'll notify you once approved.`;
  return sendSMS({ to: phone, message });
};

export const getSMSHistory = () => smsHistory;
