/**
 * Dev Fernando Souto @ficiverson
 *
 * This software is under GPL license
 *
 * Show on yout pebble current play from icecast
 */

var UI = require('ui');
var Vector2 = require('vector2');
var Clock = require('clock');
var ajax = require('ajax');

// Create a dynamic window
var splashScreen = new UI.Window({
  fullscreen:true
});

var background = new UI.Rect({
  position: new Vector2(0, 0),
  size: new Vector2(200, 240),
  backgroundColor: 'orange',
});

splashScreen.add(background);

var logo_image = new UI.Image({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  backgroundColor: 'orange',
  image: 'images/cuac-splash.png',
});

splashScreen.add(logo_image);

splashScreen.show();

//menu items
var menuItems = [
  {
    title: 'Info directo',
    subtitle: '¿Qué programa suena?'
  },
  {
    title: 'Web',
    subtitle: 'Visita nuestra página'
  }];

//options list on app
var mainScreen = new UI.Menu({
  backgroundColor:'white',
  textColor: 'black',
  highlightBackgroundColor: 'white',
  highlightTextColor: 'orange',
  sections: [{
    title: '¿Qué quieres hacer?',
    items: menuItems
  }]
});

//live show
  var detailLiveShow = new UI.Card({
    title: 'CUAC FM',
    icon: 'images/cuac-icon.png',
    subtitle: 'En directo:',
    body: 'Cargando...',
    scrollable:true
  });

mainScreen.on('select', function(e) {
  if(e.itemIndex===0){
    //live show
    launchLive(detailLiveShow);
  }
  else if(e.itemIndex===1){
    launchWeb();
  }
});

setTimeout(function() {  
  // Display the mainScreen
  mainScreen.show();
  // Hide the splashScreen to avoid showing it when the user press Back.
  splashScreen.hide();
}, 950);


//function menu screen
function launchLive(detailLiveShow){
  detailLiveShow.show();
  
  //lets look on inet to take data
  ajax({ url: 'https://streaming.cuacfm.org/status-json.xsl', type: 'json' },
    function(data) {
      detailLiveShow.body(data.icestats.source[0].yp_currently_playing);
    },
    function(error, status, request) {
      detailLiveShow.body("Oooops ;(");
    }
  );
  //response of connection its stored
}

function launchWeb(){
  Pebble.openURL('https://cuacfm.org');
}

//on live show make it favorite
/*
function launchNotification(){
  
  var nextTime = Clock.weekday('tuesday', 6, 0);
  //Pebble.showSimpleNotificationOnPebble("welcome to","tijuana");
  console.log('Seconds until then: ' + (nextTime - Date.now()));
}*/






