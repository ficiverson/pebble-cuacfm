/**
 * Dev Fernando Souto @ficiverson
 *
 * This software is under GPL license
 *
 * Show on your pebble current play from cuac fm icecast server
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Wakeup = require('wakeup');
var Clock = require('clock');

var ONE_WEEK = 0;
var date = new Date(Date.now());
var day = date.getDay();
var hour = date.getHours();
ONE_WEEK=Clock.weekday(day, hour-1, 50);
ONE_WEEK = ONE_WEEK + (7*24*60*60);
console.log(ONE_WEEK);
console.log(Date.now());

//set wakeups values
var numWakeups = 0;
getWakeUps();

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

//menu items
var menuItems = [
  {
    title: 'Info directo',
    subtitle: '¿Qué programa suena?'
  },
  {
    title: 'Favoritos',
    subtitle: 'Tienes '+numWakeups+" shows favoritos"
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
var liveShowName="";
var detailLiveShow = new UI.Card({
  title: 'CUAC FM',
  icon: 'images/cuac-icon.png',
  subtitle: 'En directo:',
  body: 'Cargando...',
  scrollable:false
});

//add to favorites window
var detailFavorites = new UI.Window({
  fullscreen:true,
  backgroundColor:'orange',
  scrollable:false
});
//begin favorite
var tick_im = new UI.Image({
  position: new Vector2(126, 0),
  size: new Vector2(18,18),
  image: 'images/cross-cuac.png',
});
detailFavorites.add(tick_im);
var cross_im = new UI.Image({
  position: new Vector2(126, 150),
  size: new Vector2(18,18),
  image: 'images/check-cuac.png',
});
detailFavorites.add(cross_im);
//end favorites ui

detailFavorites.on('click','up',function(){
 
     // Schedule a wakeup event.  
      Wakeup.schedule(
        { time: ONE_WEEK,
          cookie :1034,
          data: {showname:liveShowName},
          notifyIfMissed: true
        },
        function(e) {
          if (e.failed) {
            console.log("ERROR AGReGANDO EL TAL"+e.error);
            //after shedule close window
            detailFavorites.hide();
          } else {
            console.log(" AGReGANDO EL TAL con DATA"+e.data.showname);
            getWakeUps();
            menuItems[1].subtitle="Se eliminarán "+numWakeups+" favoritos";
            //after shedule close window
            detailFavorites.hide();
          }
        }
      );
});

detailFavorites.on('click','down',function(){
  //close window
 detailFavorites.hide();
});

//end code for saving favorites shows
detailLiveShow.on('click','select',function(){
  //only open detail if we can reach server to take program name
    if(liveShowName!==null){
      launchFavorites(detailFavorites);
    }
});
detailLiveShow.on('click','up',function(){
  //only open detail if we can reach server to take program name
    if(liveShowName!==null){
      launchFavorites(detailFavorites);
    }
});
detailLiveShow.on('click','down',function(){
  //only open detail if we can reach server to take program name
    if(liveShowName!==null){
      launchFavorites(detailFavorites);
    }
});
//all buttons make same task launch favorites

mainScreen.on('select', function(e) {
  if(e.itemIndex===0){
    //live show
    launchLive(detailLiveShow);
  }
  else if(e.itemIndex===1){
    deleteFavorites();
  }
  else if(e.itemIndex===2){
    launchWeb();
  }
});

// Query whether we launched by a wakeup even
Wakeup.launch(function(e) {
      if (e.wakeup) {
        //notify show is live
        console.log("arranque desde wakeup ......................................");
        mainScreen.show();
        Pebble.showSimpleNotificationOnPebble("Recordatorio de programa","Va a empezar "+e.data.showname);
        resetAndReLaunch(e);
      } else {
        //regular open just open app
        console.log("arranque desde normal ......................................");
        splashScreen.show();
        setTimeout(function() {  
          // Display the mainScreen
          mainScreen.show();
          // Hide the splashScreen to avoid showing it when the user press Back.
          splashScreen.hide();
        }, 950);
      }
});

//function menu screen
function launchLive(detailLiveShow){
  detailLiveShow.show();
  
  //lets look on inet to take data
  ajax({ url: 'https://streaming.cuacfm.org/status-json.xsl', type: 'json' },
    function(data) {
      liveShowName = data.icestats.source[0].yp_currently_playing;
      detailLiveShow.body(data.icestats.source[0].yp_currently_playing);
    },
    function(error, status, request) {
      liveShowName=null;
      detailLiveShow.body("Oooops ;(");
    }
  );
  //response of connection its stored
}

function deleteFavorites(){
  var i=0;
  var menuItemsFav=[];
  var idsFav=[];
  Wakeup.each(function(e) {
      console.log('Wakeup ' + e.id + ': ' + JSON.stringify(e));
      menuItemsFav.push({title:e.data.showname,subtitle:"Borrar show"});
      idsFav.push(e.id);
      i++;
  });
  if(i===0){
     menuItemsFav.push({title:" ",subtitle:"No hay elementos"});
  }
  //options list on app
  var favoriteListScreen = new UI.Menu({
    backgroundColor:'white',
    textColor: 'black',
    highlightBackgroundColor: 'white',
    highlightTextColor: 'orange',
    sections: [{
      title: '¿Qué show deseas borrar?',
      items: menuItemsFav
    }]
  });
  favoriteListScreen.show();
  
  favoriteListScreen.on('select', function(e) {
     console.log("borrando evento"+idsFav[e.itemIndex]);
     Wakeup.cancel(idsFav[e.itemIndex]);
     getWakeUps();
     console.log("quedan evento"+numWakeups);
     menuItems[1].subtitle="Tienes "+numWakeups+" shows favoritos";
     favoriteListScreen.hide();
  });
}

function launchWeb(){
  Pebble.openURL('https://cuacfm.org');
}

//on live show make it favorite
function launchFavorites(detailFavorites){
  // Create TimeText
  var timeText = new UI.TimeText({
    position: new Vector2(0, 25),
    size: new Vector2(144, 168),
    text: "¿Quieres que te avisemos a las %H para escuchar "+liveShowName+"?",
    color: 'black',
    textAlign: 'center'
  });

  detailFavorites.add(timeText);
  detailFavorites.show();
}

function getWakeUps(){
  // Query all wakeups
  numWakeups=0;
  Wakeup.each(function(e) {
    console.log('Wakeup ' + e.id + ': ' + JSON.stringify(e));
    ++numWakeups;
  });
}



// Schedule a wakeup event.  
function resetAndReLaunch(e){
  
    Wakeup.cancel(e.id);
    Wakeup.schedule(
       {  time: ONE_WEEK,
          cookie :1034,
          data: {showname:e.data.showname},
          notifyIfMissed: true
        },
        function(e) {
          if (e.failed) {
            console.log("ERROR AGReGANDO EL TAL"+e.error);
          } else {
            console.log(" AGReGANDO EL TAL con DATA"+e.data.showname);
          }
    });
}




