console.log('Index js zaladowany');
// document.addEventListener('contextmenu', event => event.preventDefault());

var parts = []
// $('#ok').hide();
var cennik = $.getJSON('cennik.json', (e) => {
    parts = e.features;
    // $('#ok').show();
    console.log(parts)


});

for (key in localStorage) {
    
    if (key !== 'length' && key !== 'key' && key !== 'getItem' && key !== 'setItem' && key !== 'clear' && key !== 'removeItem') {
        // $('#itemsList li:last').append('<li>' + key + ' ' + localStorage.getItem(key) + '</li>')
        $('table tbody').append('<tr><td scope="row" data-label="Numer">'+key+'</td>'+
        '<td data-label="Opis">'+localStorage.getItem(key)+'</td>'+
        '<td><button class="remove"></><button class="send"></button></td></tr>')
        // '<td data-label="Ilość">$842</td>'+
        // '<td data-label="Control">01/01/2016 - 01/31/2016</td>')
    }
}

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

 // BUTTON EVENT
$(".clear").on('click', () => {
    localStorage.clear();
    location.reload();

})
$("#ok").on('click', () => {

    if ($("#numer").val().length > 7) {


        szukaj($("#numer").val())
        $('#numer').val('')
    }
})
$('.export').on('click',()=>{
    let fileData='';

  
  for (key in localStorage) {
    if (key !== 'length' && key !== 'key' && key !== 'getItem' && key !== 'setItem' && key !== 'clear' && key !== 'removeItem') {
        fileData=fileData+'1;'+key+'\r\n';

    }
}
let file=new Blob([fileData],{type: "text/plain;charset=utf-8"});
let fileName=new Date().toJSON().slice(0,10).replace(/-/g,'_')+'_order.txt'
saveAs(file,fileName)

})
$('td .remove').on('click',(e)=>{
    let removeKey=$(e.currentTarget.parentNode.parentNode).find('td:first-Child')[0].innerHTML;
    localStorage.removeItem(removeKey);
    console.log(e.currentTarget.parentNode.parentNode.remove())
})

// BUTON EVENT


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
    localStorage.setItem(el.properties.numer, el.properties.nazwa + ' ' + el.properties.cena + ',-');
    let numer1=el.properties.numer;
    let nazwa=el.properties.nazwa+'    '+el.properties.cena;
    chrome.storage.sync.set({[numer1]:nazwa}, function() {
        console.log('Value is set to ');
      });
    $('#itemsList li:last').append('<li>' + el.properties.numer + ' ' + el.properties.nazwa + ' ' + el.properties.cena + '</li>')
    //location.reload();
}

function szukaj(findPart) {
    // notif.show();
    //$('#myModal').show();
    if (findPart.lenght < 8) {
        return;
    }
    findPart = findPart.toUpperCase();
    let tmep;
    let founded = parts.filter((el, index, arr) => {
        return el.properties.numer.match(findPart)

    })
    console.log(founded)
    founded.every((el, ind, arr) => {
        if (el.properties.cena != '0') {
            // notif.options.items[0].title = el.properties.numer;
            // notif.options.items[0].message = el.properties.nazwa + '   ' + el.properties.cena;
            // notif.show();
            toList(el)
            alert(
                'Rational Price Extension\n\n' +
                "\tNumer:  " + el.properties.numer + "\n" +
                '\tNazwa:  ' + el.properties.nazwa + '\n' +
                '\tCena:   ' + el.properties.cena + ',- netto\n\n' +
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
                            '\tCena:   ' + el.properties.cena + ',- netto\n\n' +
                            '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n'
                        );
                    }
                })
            }
        }
    })

}

function saveAs(blob, fileName) {
    var url = window.URL.createObjectURL(blob);

    var anchorElem = document.createElement("a");
    anchorElem.style = "display: none";
    anchorElem.href = url;
    anchorElem.download = fileName;

    document.body.appendChild(anchorElem);
    anchorElem.click();

    document.body.removeChild(anchorElem);

    // On Edge, revokeObjectURL should be called only after
    // a.click() has completed, atleast on EdgeHTML 15.15048
    setTimeout(function() {
        window.URL.revokeObjectURL(url);
    }, 1000);
}