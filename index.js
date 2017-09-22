const osmosis = require('osmosis')
const cheerio = require('cheerio')
const firebase = require('firebase')

firebase.initializeApp({
    apiKey: "AIzaSyBhYiR7GJ-l2F_VBqFCsERb67DrHyhJNkU",
    authDomain: "fish-database.firebaseapp.com",
    databaseURL: "https://fish-database.firebaseio.com",
    projectId: "fish-database",
    storageBucket: "fish-database.appspot.com",
    messagingSenderId: "173511138052"
  })

const db = firebase.database()
const email = 'guilha@gmail.com'
const password = 'guilha0123'

firebase.auth().signInWithEmailAndPassword(email, password).catch(error => {
    console.log('Error while authenticating:', error);
}).then(loginObject => {
    if (loginObject) {
        console.log('Success!!');
        console.log('Starting the scraping process...');
        scrapePage();
    } else {
        console.log('Oops, something went wrong while authenticating:', loginObject);
    }
});

function addCommonName(fish) {
    const scientific_name = fish.scientific_name.replace(/ /g,"_")
    console.log(scientific_name)

    firebase.database().ref('fishes/' + scientific_name + '/commonNames/').set(
        fish.commonNames
    );
}

const searchTerm = process.argv[2]
const result = {}

function scrapePage() {
    osmosis
        .get('http://www.fishbase.org/search.php')
        .find('#sciname p.marginLeft100')
        .select('a[1]')
        .follow('@href')
        .find('.commonTable')
        .select('a')
        .set('scientific_name')
        .follow('@href')
        .find('.ss-moreinfo')
        .select('a:contains("Common names")')
        .follow('@href')
        .set({
            commonNames: [
                osmosis
                .find('#dataTable tbody')
                .select('tr')
                .set({
                    name: 'td[1]',
                    usedIn: 'td[2]',
                    language: 'td[3]',
                    type: 'td[4]',
                    official: 'td[5]'
                })
            ]
        })

        .data((data) => {
            console.log(data)
            addCommonName(data)
        })
        .done(() => {
            console.log(result)
        })
        //.debug(console.log)
        .error(console.log)
        .log(console.log)
}



// osmosis
//     .get('http://www.fishbase.org/ComNames/CommonNameSearchList.php',
//     {
//         "Crit1_FieldName":"ComNames.ComName",
//         "Crit1_FieldType":"Char",
//         "crit1_operator":"CONTAINS",
//         "CommonName": searchTerm,
//         "sp":"y",
//         "resultPage":"1",
//         "sortby":"ComName"
//     })
//     .find('tbody tr')
//     .set({
//         name: 'td[2]',
//         url: 'td[2] a@href',
//         image: 'img@src',
//         species: 'td[5]'
//     })
//     .data((list) => {
//         result.push(list)
//     })
//     .done(() => {
//         console.log('result: ', result)
//     })
//     .log(console.log)
//     .error(console.log)
//     .debug(console.log)
