# React Native Starter App

- React-Native mobile app
  - Login screen
    - Connected with Firebase and form validation using React-Hook-Form.
  - Registration screen
    - Connected with Firebase and form validation using React-Hook-Form.
  - Splash screen
    - Displayed on app startup with animated UI.
  - Home screen
    - Shown to the user after they have been authenticated.
  - Request screen
    - Example screen to show how navigation within the app works.

## Features

- [React Native V0.72.6](https://reactnative.dev/docs/environment-setup)
- [Redux Toolkit](https://redux-toolkit.js.org/introduction/getting-started)
  - Used for state management across the application.
  - Authentication slice has been setup and tracks the user's logged in status.
  - A hook has been provided to allow you to check on this state on any screen and to get any user details.
- [React Native Paper V5.11](https://callstack.github.io/react-native-paper/docs/guides/getting-started/)
  - Used for the UI of the mobile app
  - [Theming with React-Native-Paper and React-Navigation](https://callstack.github.io/react-native-paper/docs/guides/theming-with-react-navigation) has been setup and is 99% working. There is one issue, see issues section below.
- [EXPO V49.0.15](https://docs.expo.dev/)
  - Used for cross-platform development
- [React Hook Form - React Native](https://www.react-hook-form.com/get-started/#ReactNative)
  - Used on the forms for Login and Register.
  - Validation added on all text fields, including email address and confirm password matching password entry.
- [Firebase Authentication V10.6](https://firebase.google.com/docs/auth/android/start)
  - Custom hook is used for Firebase authentication.
  - Authentication with email and password is already built and working.
    - **Replace the firebase config in useAuth.ts file with your firebase app details.**
  - Social authentication can be added easily, use the links to the respective guides below.
    - [How to Add Google signin](https://firebase.google.com/docs/auth/android/google-signin)
    - [How to Add Facebook signin](https://firebase.google.com/docs/auth/android/facebook-login)
    - [How to Add Twitter signin](https://firebase.google.com/docs/auth/android/twitter-login)
    - [How to Add GITHUB signin](https://firebase.google.com/docs/auth/android/github-auth)

- [React Navigation V6](<https://reactnavigation.org/docs/getting-started/>)
  - Used to allow navigation within the application.
  - [Auth flow](https://reactnavigation.org/docs/auth-flow) is handled by React Navigation.
  - Stack navigtor and Drawer Navigator are implemented and working.
- [Typescript V5.1.3](https://www.typescriptlang.org/)
  - Used sparingly across the application.

## Important Notes - PLEASE READ

- I am **NOT an Expert**, the code is very simple and basic, but it does work!
  - This is my first time putting a public repository on GITHUB. So please be gentle! :-)
- I'm sure there are many **improvements that can and/or** should be made.
- I'm still learning REACT/REACT-Native.
- This app is here to help people get started, up and running quickly with a working shell.
- You should be able to take the code here and just started adding screens you need for your app.
- I make **no guarantees, written, verbal or implied**.
  - If you use the code, its your job to validate and test and ensure its working as you need it to.
- I cannot provide any type of support outside of answering some quick questions.
  - I work full time and I don't have time to provide detailed support.
- I will try and keep this template updated, as and when I can, when major versions of the dependencies are changed.

## How to get started
- **Replace** the `cashAppName`, `venmoName` and `paypalEmail` used in `src/hooks/useAuth.ts`
- **Create** an `.env` file in root with the following filled:
```env
API_KEY=
AUTH_DOMAIN=
PROJECT_ID=
STORAGE_BUCKET=
MESSAGING_SENDER_ID=
APP_ID=
```
- **You MUST make these changes, else the app will not work**

Then, naviage to your terminal:
- `npm install`
- `npm run start`
  - Then choose a for Android
  - Scan the QR code with EXPO Go or with camera app on IOS
