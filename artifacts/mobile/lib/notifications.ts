import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#38BDF8',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    // For local notifications, we don't strictly need a Push Token, 
    // but we can request one if needed in the future.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId || "your-project-id", 
      })).data;
    } catch (e) {
      console.log("Could not fetch Expo Push Token, but local notifications will still work.");
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function scheduleFeeReminderNotification(dueDateStr: string, feeAmount: number, feeType: string, studentName: string) {
  const targetDate = new Date(dueDateStr);
  
  // Schedule a reminder 3 days before due date
  const reminderDate = new Date(targetDate);
  reminderDate.setDate(reminderDate.getDate() - 3);
  reminderDate.setHours(10, 0, 0, 0); // 10:00 AM

  const now = new Date();

  // If the 3-day reminder date is already in the past, schedule it for 1 minute from now for testing
  let triggerTime = reminderDate;
  if (triggerTime.getTime() <= now.getTime()) {
    triggerTime = new Date(now.getTime() + 60 * 1000); // 1 minute from now
  }

  console.log(`[PUSH] Scheduling fee reminder for ${studentName} at ${triggerTime.toLocaleString()}`);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🗓️ Fee Payment Reminder",
      body: `Reminder: The ${feeType.toLowerCase()} fee of ₹${feeAmount} for ${studentName} is due soon.`,
      sound: true,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerTime },
  });
}

export async function triggerImmediateOverdueAlert(studentName: string, amount: number) {
  console.log(`[PUSH] URGENT: Fee Overdue - Triggered immediate alert!`);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⚠️ URGENT: Fee Overdue",
      body: `The fee of ₹${amount} for ${studentName} is overdue. Please settle it as soon as possible.`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null, // null means trigger immediately
  });
}

export async function triggerAbsentNotification(studentName: string, dateStr: string) {
  console.log(`[PUSH] Absent Alert for ${studentName} on ${dateStr}`);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⚠️ Attendance Alert",
      body: `${studentName} has been marked absent today (${dateStr}).`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });
}

export async function scheduleHomeworkReminder(title: string, dueDateStr: string, batch?: string) {
  const targetDate = new Date(dueDateStr);
  const now = new Date();
  
  // Try scheduling it for the morning of the due date, if it's in the future
  let triggerTime = new Date(targetDate);
  triggerTime.setHours(8, 0, 0, 0); // 8:00 AM on the due date

  if (triggerTime.getTime() <= now.getTime()) {
    // If 8 AM is already passed, schedule it 5 seconds from now so they get it immediately
    triggerTime = new Date(now.getTime() + 5 * 1000);
  }

  console.log(`[PUSH] Homework reminder for "${title}" scheduled at ${triggerTime.toLocaleString()}`);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📚 Homework Reminder",
      body: `Don't forget! The homework "${title}" is due on ${targetDate.toLocaleDateString()}.`,
      sound: true,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerTime },
  });
}

export async function broadcastFeeReminder(batchName: string = "All Students") {
  console.log(`[PUSH] Broadcasting fee reminder to ${batchName}`);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📢 Fee Collection Reminder",
      body: `Attention ${batchName}: This is a gentle reminder to clear any pending fee dues as soon as possible.`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });
}
// -- REMOTE PUSH SENDER -----------------------------------
export async function sendRemotePushNotification(tokens: string[], title: string, body: string, data: any = {}) {
  if (!tokens || tokens.length === 0) return;
  
  // Expo Push API allows max 100 messages per request
  const CHUNK_SIZE = 100;
  for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
    const chunk = tokens.slice(i, i + CHUNK_SIZE);
    const messages = chunk.map(token => ({
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: data,
    }));
    
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });
      const result = await response.json();
      console.log("[REMOTE PUSH] Sent batch of", chunk.length, "devices");
    } catch (error) {
      console.error("[REMOTE PUSH] Failed to send push notification chunk:", error);
    }
  }
}
// -- UPCOMING CLASS REMINDERS -----------------------------------
export async function scheduleClassReminders(classes: any[]) {
  // Clear all previous class reminders to avoid duplicates (in a real app you'd cancel specific IDs)
  // await Notifications.cancelAllScheduledNotificationsAsync();
  
  const now = new Date();
  
  for (const c of classes) {
    if (!c.time) continue;
    
    // Parse time like '10:00 AM' or '02:30 PM'
    const timeRegex = /(\d+):(\d+)\s*(AM|PM)/i;
    const match = c.time.match(timeRegex);
    if (!match) continue;
    
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const classDate = new Date();
    classDate.setHours(hours, minutes, 0, 0);
    
    // 1 Hour Before Reminder
    const oneHourBefore = new Date(classDate.getTime() - 60 * 60 * 1000);
    if (oneHourBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏳ Upcoming Class in 1 Hour",
          body: `'${c.title}' is starting soon. Be ready!`,
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: oneHourBefore },
      });
    }
    
    // 30 Mins Before Reminder
    const thirtyMinsBefore = new Date(classDate.getTime() - 30 * 60 * 1000);
    if (thirtyMinsBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🚨 Class Starting in 30 Mins!",
          body: `'${c.title}' is about to begin. Open the app to join.`,
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: thirtyMinsBefore },
      });
    }
  }
}
