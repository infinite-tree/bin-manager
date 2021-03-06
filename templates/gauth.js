var CLIENT_ID = '{{ googleClient }}';
var API_KEY = '{{ googleAPIKey }}';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// TODO: these should probably be configurable
var loginContent = document.getElementById('googleLoginContent');
var applicationContent = document.getElementById('applicationContent');
var authorizeText = document.getElementById('googleLoadingText');
var authorizeButton = document.getElementById('googleAuthorizeButton');
var signoutButton = document.getElementById('googleLogoutButton');

// To be set by startGAuth
var gAuthCallback = null;

/**
 *  On load, called to load the auth2 library and API client library.
 */
function startGAuth(callback) {
    gAuthCallback = callback;
    gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    }, function(error) {
        $("#binManagerLoginContent").append(JSON.stringify(error, null, 2));
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        // load the rest of the app and make it visible
        gAuthCallback();
        loginContent.style.display = 'none';
        authorizeButton.style.display = 'none';
        authorizeText.style.display = 'block';
        applicationContent.style.display = 'block';
    } else {
        applicationContent.style.display = 'none';

        loginContent.style.display = 'block';
        authorizeText.style.display = 'none';
        authorizeButton.style.display = 'inline';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    console.log("Logging out...");
    gapi.auth2.getAuthInstance().signOut();
}