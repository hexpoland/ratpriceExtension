
console.log('Index js zaladowany')
var parts=[]
// $('#ok').hide();
var cennik=$.getJSON('cennik.json',(e)=>{
parts=e.features;
// $('#ok').show();
console.log(parts)


});
// $('#ipss-partlist-table').on('click',(e)=>{
//     console.log('click table')
// })


// $('#ok').on('click',()=>{
//     let numer=$('#numer').val();
//     szukaj(numer)
// })
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.greeting == "hello")
      console.log('Mamy komunikacje z content')
        sendResponse({farewell: "goodbye"});
    });




chrome.contextMenus.onClicked.addListener((clickData)=>{
    if(clickData.menuItemId=="CennikRational"){
        //alert('Rational Extension'+clickData.selectionText)
        szukaj(clickData.selectionText)
    }
})
var replace='';

// function szukaj(findPart){
//     findPart=findPart.toUpperCase();
//    if(findPart.length==7){
//        console.log('scc')
//    }
    
//     parts.find((el,index,array)=>{
//         if(el.properties.numer===findPart){
//             if(el.properties.cena=='0'){
//                 if(el.properties.Informacje){
                    
                    
//                 }
//                 alert(el.properties.numer+' znalazlem:  '+el.properties.nazwa+'  cena to:'+el.properties.cena )

                
//             }
         
            
//          alert('znalazlem:  '+el.properties.nazwa+'  cena to:'+el.properties.cena )
//         }
//      })
// }
function szukaj(findPart){
    findPart=findPart.toUpperCase();
    let tmep;
    let founded=parts.filter((el,index,arr)=>{
           return el.properties.numer.match(findPart)
        
    })
    console.log(founded)
    founded.forEach((el,ind,arr)=>{
        if(el.properties.cena!='0'){
            alert('Znalaziono '+el.properties.nazwa + 'cena: '+el.properties.cena)
        }else{
            if(el.properties.Informacje){
                console.log('zastopione')
                let newNumber=el.properties.Informacje.match(/\d\d.\d\d.\d\d\d/g)
                console.log(newNumber)
                temp=parts.filter((el)=>{
                    return el.properties.numer.match(newNumber)
                })
                temp.forEach((el)=>{
                    if(el.properties.cena!='0'){
                        alert('Znalaziono '+el.properties.nazwa + 'cena: '+el.properties.cena)
                    }
                })
            }
        }
    })
    
}