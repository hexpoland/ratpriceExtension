var tokenSmtp = '063fe860-cff3-4f1f-bb21-bbf4177f74b3'
var userId, userAvatar, userEmail, syncState
var parts = []
// var cennik = $.getJSON("cennik.json", e => {
//   parts = e.features;
//   // $('#ok').show();
//   // console.log(parts)
// });

init() // init setting from localstorage
loadFromStorage() // load item frmo storage

chrome.runtime.onMessage.addListener(msg => {
  console.log(msg)
  if (msg.type === 'logedIn') {
    alert('LogedIN')
    localStorage.setItem('userId', msg.user.uid)
    localStorage.setItem('userAvatar', msg.user.photoURL)
    localStorage.setItem('live', true)
    $('#avatar').attr('src', msg.user.photoURL)
    $('#avatar').addClass('ease_In')
    $('#avatar').show()
    $('#syncButton').prop('checked', true)
  } else if (msg.type === 'logedOut') {
    alert('LogedOut')
    localStorage.setItem('live', false)
    localStorage.setItem('userId', '')
    localStorage.setItem('userAvatar', '')
    $('#syncButton').prop('checked', false)
    $('#avatar').hide()
  }
})
// BUTTON EVENT HANDLERS
$('#syncButton').on('click', e => {
  e.preventDefault()

  if (e.currentTarget.checked == true) {
    chrome.runtime.sendMessage({ type: 'loginFirebase' })
    console.log('Teraz jest true')
  } else {
    chrome.runtime.sendMessage({ type: 'logoutFirebase' })
    console.log('Teraz jest true')
  }
})
$('.clear').on('click', () => {
  localStorage.clear()
})
$('input').on('keypress', e => {
  if (e.which === 13) {
    $('#ok').click()
  } else if (e.key == ',') {
    // zamiana przecinka na kropke
    e.preventDefault()
    $('#numer').val($('#numer').val() + '.')
  }
})
$('#ok').on('click', () => {
  if ($('#numer').val().length > 7) {
    szukaj($('#numer').val())
    $('#numer').val('')
  }
})
$('.export').on('click', () => {
  let fileData = ''

  for (key in localStorage) {
    if (
      key !== 'length' &&
      key !== 'key' &&
      key !== 'getItem' &&
      key !== 'setItem' &&
      key !== 'clear' &&
      key !== 'removeItem'
    ) {
      fileData = fileData + '1;' + key + '\r\n'
    }
  }
  let file = new Blob([fileData], {
    type: 'text/plain;charset=utf-8'
  })
  let fileName =
    new Date()
      .toJSON()
      .slice(0, 10)
      .replace(/-/g, '_') + '_order.txt'
  saveAs(file, fileName)
})
$('td .remove').on('click', e => {
  let z = confirm('Czy napewno usunac ?')
  if (z === true) {
    let removeKey = $(e.currentTarget.parentNode.parentNode).find(
      'td:first-Child'
    )[0].innerHTML
    localStorage.removeItem(removeKey)

    if (syncState === 'true') {
      chrome.runtime.sendMessage({ type: 'removeFromFirebase', id: removeKey })
    }
    refreshBadge()
    console.log(e.currentTarget.parentNode.parentNode.remove())
  } else {
    console.log('Cancel')
  }
})
$('td .send').on('click', e => {
  let body = $(e.currentTarget.parentNode.parentNode)[0].innerHTML
  console.log(body)
  var to = prompt('Podaj adres email:', 'jerzywolakowski@op.pl')
  if (to != null) {
    sendEmail(
      'wolaqu@poczta.onet.pl',
      'wolaqu@poczta.onet.pl',
      'Wycena czesci',
      body
    )
  }
})
$('#back').on('click', e => {
  location.reload()
})
// BUTON EVENT HANDLERS

// Comunication background.js
chrome.contextMenus.onClicked.addListener(clickData => {
  if (clickData.menuItemId == 'CennikRational') {
    // alert('Rational Extension'+clickData.selectionText)
    szukaj(clickData.selectionText)
  }
})

var replace = ''
// functions
function init () {
  console.log('INIT')
  syncState = localStorage.getItem('live')
  userId = localStorage.getItem('userId')
  userAvatar = localStorage.getItem('userAvatar')
  userEmail = localStorage.getItem('userEmail')
  // chrome.tts.speak('Synchronizacja włączona', { lang: 'pl-PL', rate: 1.0 })
  console.log(`Sync state is ${syncState}`)
  if (syncState === 'true') {
    $('#avatar').attr('src', userAvatar)
    console.log('Tru')
    $('#syncButton').prop('checked', true)
  } else {
    $('#avatar').hide()
    console.log('fals')
    $('#syncButton').prop('checked', false)
  }
}
function toList (el) {
  localStorage.setItem(
    el.properties.numer,
    el.properties.nazwa + ' ' + el.properties.cena + ',-'
  )
  let numer1 = el.properties.numer
  let nazwa = el.properties.nazwa + '    ' + el.properties.cena
  // chrome.storage.sync.set({ [numer1]: nazwa }, function() {
  //   console.log("Value is set to ");
  // });
  let jsonEl = {
    type: 'firebase',
    userId: userId,
    user: userEmail,
    userAvatar: userAvatar,
    numer: el.properties.numer,
    nazwa: el.properties.nazwa,
    cena: el.properties.cena
  }
  if (syncState === 'true') {
    chrome.runtime.sendMessage(jsonEl)
  }
  $('table tbody').empty()
  loadFromStorage()

  // $("#itemsList li:last").append(
  //   "<li>" +
  //     el.properties.numer +
  //     " " +
  //     el.properties.nazwa +
  //     " " +
  //     el.properties.cena +
  //     "</li>"
  // );
}
function szukaj (findPart) {
  // definicja cennika tutaj lepszy perfomrance
  let cennik = $.getJSON('cennik.json', e => {
    parts = e.features
    if (findPart.lenght < 8) {
      return
    }
    findPart = findPart.toUpperCase()
    let temp
    let founded = parts.filter((el, index, arr) => {
      return el.properties.numer.match(findPart)
    })
    console.log(founded)
    founded.every((el, ind, arr) => {
      if (el.properties.cena > 0) {
        console.log('Cena niezerowa')
        // notif.options.items[0].title = el.properties.numer;
        // notif.options.items[0].message = el.properties.nazwa + '   ' + el.properties.cena;
        // notif.show();
        toList(el)
        alert(
          'Rational Price Extension\n\n' +
            '\tNumer:  ' +
            el.properties.numer +
            '\n' +
            '\tNazwa:  ' +
            el.properties.nazwa +
            '\n' +
            '\tCena:   ' +
            el.properties.cena +
            ',- netto\n\n' +
            '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n'
        )
      } else {
        if (el.properties.Informacje) {
          console.log('zastapione' + el.properties.Informacje)
          let newNumber = el.properties.Informacje.match(
            /\d\d.\d\d.\d\d\d[A-Z]?/g
          )
          console.log(newNumber)
          if (newNumber === null) {
            newNumber = el.properties.Informacje.match(
              /\d\d\d\d.\d\d\d\d[A-Z]?/g
            )
          }

          temp = parts.filter(el => {
            return $.isArray(newNumber)
              ? el.properties.numer.match(newNumber[0])
              : el.properties.numer.match(newNumber)
          })
          temp.forEach(el => {
            if (el.properties.cena != '0') {
              // alert('Znalaziono:  ' + el.properties.nazwa + ' Cena: ' + el.properties.cena)
              toList(el)
              alert(
                'Rational Price Extension\n\n' +
                  '\tNumer:  ' +
                  el.properties.numer +
                  '\n' +
                  '\tNazwa:  ' +
                  el.properties.nazwa +
                  '\n' +
                  '\tCena:   ' +
                  el.properties.cena +
                  ',- netto\n\n' +
                  '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n'
              )
            }
          })
        }
      }
    })
  })
}
function sendEmail (to, from, subject, body) {
  Email.send({
    SecureToken: tokenSmtp,
    To: to,
    From: from,
    Subject: subject,
    Body: body
    // Attachments : [
    // {
    //     name : "smtpjs.png",
    //     path : "https://networkprogramming.files.wordpress.com/2017/11/smtpjs.png"
    // }]
  }).then(message => alert('Wyslano email'))
}
function saveAs (blob, fileName) {
  var url = window.URL.createObjectURL(blob)

  var anchorElem = document.createElement('a')
  anchorElem.style = 'display: none'
  anchorElem.href = url
  anchorElem.download = fileName

  document.body.appendChild(anchorElem)
  anchorElem.click()

  document.body.removeChild(anchorElem)

  // On Edge, revokeObjectURL should be called only after
  // a.click() has completed, atleast on EdgeHTML 15.15048
  setTimeout(function () {
    window.URL.revokeObjectURL(url)
  }, 1000)
}
function loadFromStorage () {
  refreshBadge()
  for (key in localStorage) {
    if (
      key !== 'length' &&
      key !== 'key' &&
      key !== 'getItem' &&
      key !== 'setItem' &&
      key !== 'clear' &&
      key !== 'removeItem' &&
      key !== 'live' &&
      key !== 'firebase:host:partsextension.firebaseio.com' &&
      key !== 'userId' &&
      key !== 'userAvatar' &&
      key !== 'userEmail'
    ) {
      // $('#itemsList li:last').append('<li>' + key + ' ' + localStorage.getItem(key) + '</li>')
      $('table tbody').append(
        '<tr><td scope="row" data-label="Numer">' +
          key +
          '</td>' +
          '<td data-label="Opis">' +
          localStorage.getItem(key) +
          '</td>' +
          '<td><button class="remove"></><button class="send"></button></td></tr>'
      )
    }
  }
}
function refreshBadge () {
  let c = 0
  for (key in localStorage) {
    if (
      key !== 'length' &&
      key !== 'key' &&
      key !== 'getItem' &&
      key !== 'setItem' &&
      key !== 'clear' &&
      key !== 'removeItem' &&
      key !== 'live' &&
      key !== 'firebase:host:partsextension.firebaseio.com' &&
      key !== 'userId' &&
      key !== 'userAvatar' &&
      key !== 'userEmail'
    ) {
      c++
    }
    chrome.browserAction.setBadgeText({ text: c.toString() })
  }
}
// functions
