var contextMenuItem = {
  id: 'CennikRational',
  title: 'CennikRational',
  contexts: ['selection']
}
chrome.contextMenus.create(contextMenuItem)

chrome.runtime.onInstalled.addListener(function () {
  console.log('Zainstalowano RATIONAL PARTS MANAGER')
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
var allPartsListFirebase = []

const app = firebase.initializeApp(config)

const db = app.firestore()
const users = db.collection('users')

chrome.runtime.onMessage.addListener((msg, sender, callback) => {
  console.log(msg)
  if (msg.type === 'firebase') {
    addToFirebase(msg)
  } else if (msg.type === 'loginFirebase') {
    let user = loginToFirebase().then(e => {
      getFromFirebase()
        .then(() => {
          console.log(partsListFirebase)
        })
        .then(() => {
          getAllFromFirebase()
        })

      console.log('zalogowany', e)
      chrome.runtime.sendMessage({ type: 'logedIn', user: e })
    })
  } else if (msg.type === 'logoutFirebase') {
    logoutFromFirebase()
  } else if (msg.type === 'removeFromFirebase') {
    console.log('Remove event')
    removeFromFirebase(msg.id).then(() => {
      console.log('Deleted finish')
    })
  }
})

// db.collection("parts").onSnapshot(() => {
//   // console.log('Dodano nowy element info form watcher')
//   db.collection("parts")
//     .get()
//     .then(e => {
//       // console.log(e.docs[e.size - 1].id)
//       db.collection("parts")
//         .doc(e.docs[e.size - 1].id)
//         .get()
//         .then(r => {
//           console.log(r.data());
//         });
//     });
// });

async function loginToFirebase () {
  var provider = new firebase.auth.GoogleAuthProvider()
  provider.addScope('profile')
  provider.addScope('email')
  let uFirebase
  let u = await firebase
    .auth()
    .signInWithPopup(provider)
    .then(e => {
      localStorage.setItem('userEmail', e.user.email)
      localStorage.setItem('userId', e.user.uid)
      localStorage.setItem('userAvatar', e.user.photoURL)
      localStorage.setItem('live', true)
      uFirebase = e.user
      return e.user
    })
    .catch(error => {
      alert('Ups cos poszło nie tak')
      console.log(error)
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
      localStorage.setItem('live', false)
      localStorage.setItem('userId', '')
      localStorage.setItem('userAvatar', '')
    })
    .catch(function (error) {
      // An error happened.
    })
}
async function addToFirebase (msg) {
  users.doc(msg.user).set({
    avatar: msg.userAvatar,
    id: msg.userId
  })

  users
    .doc(msg.user)
    .collection('partslist')
    .doc(msg.numer)
    .set({
      // numer: msg.numer,
      user: msg.user,
      userAvatar: msg.userAvatar,
      nazwa: msg.nazwa,
      cena: msg.cena
    })
    .then(function () {
      console.log('Document written to firebase')
    })
    .catch(function (error) {
      console.error('Error adding document: ', error)
    })
}
async function getFromFirebase () {
  partsListFirebase = [] // clear to dont repeat records
  users
    .doc(localStorage.getItem('userEmail'))
    .collection('partslist')
    .get()
    .then(e => {
      e.docs.forEach((el, val, index) => {
        users
          .doc(localStorage.getItem('userEmail'))
          .collection('partslist')
          .doc(el.id)
          .get()
          .then(r => {
            let part = {
              id: el.id,
              user: r.data().user,
              userAvatar: r.data().userAvatar,
              nazwa: r.data().nazwa,
              cena: r.data().cena
            }
            // console.log(part)
            partsListFirebase.push(part)
          })
      })
    })
    .then(() => {
      console.log(partsListFirebase)
    })
}
async function removeFromFirebase (itemId) {
  users
    .doc(localStorage.getItem('userEmail'))
    .collection('partslist')
    .doc(itemId)
    .delete()
    .then(function () {
      console.log('Document successfully deleted!')
    })
    .catch(function (error) {
      console.error('Error removing document: ', error)
    })
}
async function getAllFromFirebase () {
  users
    .get()
    .then(e => {
      e.forEach(n => {
        users
          .doc(n.id)
          .collection('partslist')
          .get()
          .then(z => {
            z.docs.forEach((el, value, index) => {
              users
                .doc(n.id)
                .collection('partslist')
                .doc(el.id)
                .get()
                .then(r => {
                  let part = {
                    user: r.data().user,
                    parts: {
                      id: el.id,
                      user: r.data().user,
                      userAvatar: r.data().userAvatar,
                      nazwa: r.data().nazwa,
                      cena: r.data().cena
                    }
                  }
                  // console.log(part)
                  allPartsListFirebase.push(part)
                })
            })
          })
      })
    })
    .then(() => {
      console.log(allPartsListFirebase)
    })
}
