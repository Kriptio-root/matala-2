import type { TInteractiveString } from '../types'

export const getWelcomeMessage: TInteractiveString = (name: string): string => `Welcome to my telegram bot ${name}!`

export const getHTTPStatusMessage: TInteractiveString = (statusCode: string): string => `HTTP Status: ${statusCode}`
export const rawDataReceivedMessage: TInteractiveString = (data: string): string => `Raw data received: ${data}`
export const formattedDataMessage: TInteractiveString = (formattedData: string): string => `Formatted data: ${formattedData}`
export const userSubscriptionAbortedMessage: TInteractiveString = (userName: string): string => `User ${userName} subscription aborted due to inactivity`

export const gettingActiveUserTrackMessage: TInteractiveString = (telegramID: string): string => `Getting active user track for ${telegramID}`
export const deletingActiveUserTrackMessage: TInteractiveString = (telegramID: string): string => `Deleting active user track for ${telegramID}`

export const userSubscriptionMessage: TInteractiveString = (userName: string): string => `User ${userName} not in the active users list, setting up a new subscription`

export const userAlreadyInActiveUsersMessage: TInteractiveString = (userName: string): string => `User ${userName} is already in the active users list`

export const subscriptionSavedForUser: TInteractiveString = (userName: string): string => `Subscription saved for user ${userName}`

export const userContextTransitionTo: TInteractiveString = (state: string): string => `UserContext: Transition to ${state}`

export const coordinatesSetForUser: TInteractiveString = (
  userName: string,
  latitude: string,
  longitude: string,
): string => `Coordinates set for user ${userName}:
         [${latitude},
         ${longitude}]`

export const userDataNotFound: TInteractiveString = (userName: string): string => `User data not found for ${userName}`

export const userNotificationTimeSet: TInteractiveString = (
  userName: string,
  notificationTime: string,
): string => `Notification time set for user ${userName}: ${notificationTime}`

export const errorSavingSubscription: TInteractiveString = (userName: string): string => `Error saving subscription for user ${userName}`

export const subscriptionProcessCompleted: TInteractiveString = (userName: string): string => `Subscription process completed for user ${userName}`

export const userUpdateProcessCompleted: TInteractiveString = (userName: string): string => `User update process completed for user ${userName}`

export const messageSentToUser: TInteractiveString = (userName: string): string => `Message sent to user ${userName}`

export const errorSendingMessage: TInteractiveString = (userName: string): string => `Error sending message to user ${userName}`

export const locationUpdatedForUser: TInteractiveString = (userName: string): string => `Location updated for user ${userName}`

export const errorUpdatingLocation: TInteractiveString = (userName: string): string => `Error updating location for user ${userName}`

export const notificationTimeUpdatedForUser: TInteractiveString = (userName: string): string => `Notification time updated for user ${userName}`

export const errorUpdatingNotificationTime: TInteractiveString = (userName: string): string => `Error updating notification time for user ${userName}`

export const cancelledNotificationForUser: TInteractiveString = (userName: string): string => `Cancelled notification for user ${userName}`

export const userNotFountInDatabase: TInteractiveString = (userName: string): string => `User ${userName} not found in database`

export const scheduledNotificationForUser: TInteractiveString = (
  userName: string,
  notificationTime: string,
  userTimeZone: string,
): string => `Scheduled notification for user ${userName} at ${notificationTime} on their timezone(${userTimeZone})`

export const sendingNotificationToUser: TInteractiveString = (userName: string): string => `Sending notification to user ${userName}`

export const userSubcribed: TInteractiveString = (userName: string): string => `User ${userName} subscribed`

export const errorInUserSubscribe: TInteractiveString = (userName: string): string => `Error in user ${userName} subscribe`
