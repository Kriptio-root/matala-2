import {TMessageConstants} from '../message-constants.type'

const USER_REPLIES: TMessageConstants = {
  wrongCommand: 'Try to use menu or send /start',

  welcome:
    '\n You can subscribe get forecast in your location. \n' +
    '\n To subscribe, share your geolocation \n' +
    '\n and choose time for forecast \n' +
    '\n press subscribe button below \n',

  errorCaused: '\n Error getting forecast \n',

  locationUpdated: '\n Location updated \n',

  timeUpdated: '\n Time updated \n',

  unsubscribed: '\n Unsubscribed \n',

  shareUserLocation: 'Share your location to continue',

  shareUserLocationOnError: 'Please share your location with me first',

  enterTime: 'Please enter the time in the format HH:MM',

  successfulSubscription: 'You have successfully subscribed!',

  locationRecivedNextStep: 'Location received, please enter the time you want to receive the notification in the format HH:MM',

  forecastNotificationScheduled: 'Your forecast notification was successfully scheduled',
} as const

export { USER_REPLIES }
