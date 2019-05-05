var contextMenuItem = {
  id: 'CennikRational',
  title: 'Cennikrational',
  contexts: ['selection']
}
chrome.contextMenus.create(contextMenuItem)

chrome.runtime.onInstalled.addListener(function () {
  console.log('Zainstalowano RATIONAL PARTS MANAGER')
})

chrome.tabs.onActiveChanged.addListener(() => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    var url = tabs[0].url
    console.log(url)
  })
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? 'from a content script:' + sender.tab.url
      : 'from the extension'
  )
  if (request.greeting == 'hello') sendResponse({ farewell: 'goodbye' })
})
// FIREBASE
var config = {
  apiKey: 'AIzaSyAyUr_KLRq3_EpC7iZ6-5efhAITfKgE4Rs',
  authDomain: 'partsextension.firebaseapp.com',
  databaseURL: 'https://partsextension.firebaseio.com',
  projectId: 'partsextension',
  storageBucket: 'partsextension.appspot.com',
  messagingSenderId: '750984928739'
}
var partsListFirebase = []

const app = firebase.initializeApp(config)
const db = app.firestore()

chrome.runtime.onMessage.addListener((msg, sender, callback) => {
  console.log(msg)
  if (msg.type === 'firebase') {
    db.collection('parts')
      .doc(msg.numer)
      .set({
        // numer: msg.numer,
        nazwa: msg.nazwa,
        cena: msg.cena
      })
      .then(function () {
        console.log('Document written to firebase')
      })
      .catch(function (error) {
        console.error('Error adding document: ', error)
      })
  } else if (msg.type === 'loginFirebase') {
    let user = loginToFirebase().then(e => {
      getFromFirebase().then(() => {
        console.log(partsListFirebase)
      })
      console.log('zalogowany', e)
      chrome.runtime.sendMessage({ type: 'logedIn', user: e })
    })
  } else if (msg.type === 'logoutFirebase') {
    logoutFromFirebase()
  }
})
db.collection('parts').onSnapshot(() => {
  // console.log('Dodano nowy element info form watcher')
  db.collection('parts')
    .get()
    .then(e => {
      // console.log(e.docs[e.size - 1].id)
      db.collection('parts')
        .doc(e.docs[e.size - 1].id)
        .get()
        .then(r => {
          console.log(r.data())
        })
    })
})

async function loginToFirebase () {
  var provider = new firebase.auth.GoogleAuthProvider()
  provider.addScope('profile')
  provider.addScope('email')
  function loginToFirebase () {}
  let uFirebase
  let u = await firebase
    .auth()
    .signInWithPopup(provider)
    .then(e => {
      uFirebase = e.user
      return e.user
    }) // Opens a popup window and returns a promise to handle errors.
  return uFirebase
}
function logoutFromFirebase () {
  firebase
    .auth()
    .signOut()
    .then(function () {
      chrome.runtime.sendMessage({ type: 'logedOut' })
      console.log('LOGOUT!!!')
    })
    .catch(function (error) {
      // An error happened.
    })
}
async function getFromFirebase () {
  db.collection('parts')
    .get()
    .then(e => {
      e.docs.forEach((el, val, index) => {
        db.collection('parts')
          .doc(el.id)
          .get()
          .then(r => {
            let part = {
              id: el.id,
              nazwa: r.data().nazwa,
              cena: r.data().cena
            }
            // console.log(part)
            partsListFirebase.push(part)
          })
      })
    })
}
