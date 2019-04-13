console.log('Index js zaladowany')
var parts = []
// $('#ok').hide();
var cennik = $.getJSON('cennik.json', (e) => {
    parts = e.features;
    // $('#ok').show();
    console.log(parts)


});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting == "hello")
            console.log('Mamy komunikacje z content')
        sendResponse({
            farewell: "goodbye"
        });
    });

$("#ok").on('click', () => {

    if ($("#numer").val().length > 7) {


        szukaj($("#numer").val())
    }
})


chrome.contextMenus.onClicked.addListener((clickData) => {
    if (clickData.menuItemId == "CennikRational") {
        //alert('Rational Extension'+clickData.selectionText)
        szukaj(clickData.selectionText)
    }
})
var replace = '';
let notif = {

    options: {
        type: "list",
        title: "Rational Price Extension",
        message: "",
        items: [{
            title: "jseoijfowiejew",
            message: "wqkdpokdpokqpdokqpow"
        }],
        iconUrl: "img/notif.png"

    },
    show() {
        chrome.notifications.create(this.options, () => {
            console.log('notif done')
        })
        // alert(`Hello notif ${this.options.title}`)
    }

}

function toList(el) {
    $('#itemsList li:last').append('<li>' + el.properties.numer + ' ' + el.properties.nazwa + ' ' + el.properties.cena + '</li>')
}

function szukaj(findPart) {
    // notif.show();
    $('#myModal').show();
    if (findPart.lenght < 8) {
        return;
    }
    findPart = findPart.toUpperCase();
    let tmep;
    let founded = parts.filter((el, index, arr) => {
        return el.properties.numer.match(findPart)

    })
    console.log(founded)
    founded.forEach((el, ind, arr) => {
        if (el.properties.cena != '0') {
            // notif.options.items[0].title = el.properties.numer;
            // notif.options.items[0].message = el.properties.nazwa + '   ' + el.properties.cena;
            // notif.show();
            toList(el)
            alert(
                'Rational Price Extension\n\n' +
                "\tNumer:  " + el.properties.numer + "\n" +
                '\tNazwa:  ' + el.properties.nazwa + '\n' +
                '\tCena:   ' + el.properties.cena + 'zł netto\n\n' +
                '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n'
            );
            return;
        } else {
            if (el.properties.Informacje) {
                console.log('zastapione')
                let newNumber = el.properties.Informacje.match(/\d\d.\d\d.\d\d\d[A-Z]?/g)
                console.log(newNumber)
                temp = parts.filter((el) => {
                    return el.properties.numer.match(newNumber)
                })
                temp.forEach((el) => {
                    if (el.properties.cena != '0') {
                        // alert('Znalaziono:  ' + el.properties.nazwa + ' Cena: ' + el.properties.cena)
                        toList(el)
                        alert(
                            'Rational Price Extension\n\n' +
                            "\tNumer:  " + el.properties.numer + "\n" +
                            '\tNazwa:  ' + el.properties.nazwa + '\n' +
                            '\tCena:   ' + el.properties.cena + 'zł netto\n\n' +
                            '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n'
                        );
                    }
                })
            }
        }
    })

}