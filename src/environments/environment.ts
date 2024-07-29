
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  baseUrl: 'https://deliverylo.com/deliverylo/public/api/', // ex https://yourapi.com/public/api/ don't forgot to add public/api/ at the end
  imageUrl: 'https://deliverylo.com/deliverylo/public/storage/images/', // ex https://yourapi.com/public/storage/images/ don't forgot to add public/storage/images at the end
  firebase: {
    apiKey: "YOURKEY",
    authDomain: "YOURKEY",
    projectId: "deliverylo",
    storageBucket: "YOURKEY",
    messagingSenderId: "251121559276",
    appId: "1:251121559276:android:9bb8c985ddbd24ff65a7c9"
  }
};
