loadKitties = function(){


$(function(){
  console.log("Kitties AI has loadeded.");
  setTimeout(function(){
    $('a:contains(Trade)').click();
    $('a:contains(Bonfire)').click();
  },5000);
  setInterval(function () { $('span:contains(Gather catnip)').click() }, 1);
  window.resTable = $($('.resTable').get(0));
  window.catnipTd = $($(resTable).children('td').get(1));
  alertCatnup = function(){console.log("currennt catnip is " + Number(catnipTd.text()) )};
  window.maxResource = function(name){
    max = $($(".resTable tr td:contains("+name+":)").parent().find('td').get(2)).text();
    max = max.replace('/','');
    return kParse(max);
  };
  window.currentResource = function(name){
    return kParse($($(".resTable tr td:contains("+name+":)").parent().find('td').get(1)).text());
  }

  window.kParse = function(input){
    kParser = /([\d]*)\.?([\d]*)(K|M|G)/i;
    matches = input.match(kParser);
    if (null === matches) return parseInt(input);
    if(matches[2].length)
      hundreds = parseInt(matches[2]);
    else
      hundreds = 0;
    if (matches[3]=='K')
      multiplier=1000;
    if (matches[3]=='M')
      multiplier=1000000;
    if (matches[3]=='G')
      multiplier=1000000000;
    return parseInt(parseInt(matches[1]*multiplier)+(hundreds*(multiplier/100)));
  }
  //currentCatnip = function(){ return Number(catnipTd.text()) };
  function refineCatnip(){

    autoCraft('catnip','wood');
  }
  catnipButton = $('.tab :contains(Workshop)');
  autoCatnip = setInterval(refineCatnip,50);
  var autoAstroEvent = function(){
    //console.log($("#rightColumn"));
    if (len =  $("#rightColumn button").length >0){
      $("#rightColumn button").click();
    }
    if (len =  $("#rightColumn input").length >0){
      $("#rightColumn input").click();
    }
  }

  function withinPercentMax(resource, percent){
    if (0==window.maxResource(resource)) return false;
    threshold = window.maxResource(resource) - (window.maxResource(resource) * (percent/100));
    if (window.currentResource(resource) >= threshold){
      return true;
    }
    return false;
  }
  setInterval(function(){
    if (currentResource('steel')>4*currentResource('alloy'))
      autoCraft('titanium','alloy');
  }, 200);

  setInterval(function(){
    if((currentResource('alloy')>5000 && currentResource('unobtainium')>1000) ){
      autoCraft('unobtainium','eludium');
    }
    else {
    }
  }, 1000);

  function autoCraft(resource,crafted_resource){
    //when getting number to be made, it actually works like it clicks that button that many times.  So eludium is 5, it will try to create eludium 5 times.
    if (withinPercentMax(resource,20)){
    var limit=$("#limit_"+resource).val();
    //if (currentResource(resource)>limit){
      //console.log("creating "+crafted_resource);
      max = $($(".resTable tr td:contains("+crafted_resource+":)").last().parent().find('td').get(2)).text();
      if(max.indexOf("+")>-1){
       num=(kParse(max.substr(1)))/2;
       if('catnip'==resource){
       console.log(num);
       }
      }
      else
        num=1;
  if (resource =='unobtainium')
  num=1;

      gamePage.craft(crafted_resource ,num);
    }
  }
  window.autoTrade = function (){
    if (withinPercentMax('gold',10)&&withinPercentMax('catnip',30)){
      if (withinPercentMax('catnip',10)) return;
      if (gamePage.diplomacyTab.racePanels[1].tradeBtn.hasResources()){

        //Store a reference to the button so it doesn't get GC'd.
        window.tradeButtonReference = gamePage.diplomacyTab.racePanels[1].tradeBtn.enabled;
        gamePage.diplomacyTab.racePanels[1].tradeBtn.handler()
        gamePage.diplomacyTab.racePanels[1].tradeBtn.payPrice();
        if (gamePage.diplomacyTab.racePanels[1].tradeBtn.priceRatio){
          gamePage.diplomacyTab.racePanels[1].tradeBtn.adjustPrice(gamePage.diplomacyTab.racePanels[1].tradeBtn.priceRatio);
        }
        gamePage.diplomacyTab.racePanels[1].tradeBtn.update();
      }
    }
  }
  autoTradeInterval = setInterval(autoTrade,200);
  setInterval(function(){
    if (withinPercentMax('culture',10)){
      if (currentResource('furs')>300) {
        gamePage.craft('parchment',1);
      }
      if (currentResource('parchment')>500){
        gamePage.craft('manuscript',1);
      }
    }
  }, 100);

  setInterval(function(){
    if(withinPercentMax('faith',1))
    {
      console.log("Praise");
      gamePage.religion.praise();
    }
  }, 1000);
  setInterval(function(){
    if(withinPercentMax('science',10))
    {
      if(currentResource('compendium')>18000) {
        console.log("blueprint");
        gamePage.craft('blueprint',1);
      }
      else if(currentResource('manuscript')>5000) {
        console.log("Compendium");
        gamePage.craft('compedium',1);
      }
    }
  }, 1000);
  function withinLimit(resource){
    var limit=$("#limit_"+resource).val();
    return (currentResource(resource)>=limit);

  }
  setInterval(function(){
    autoCraft('iron','plate');
  }, 1000);
  function autoCreateBeam(){
    if (withinPercentMax('wood',05)){
      autoCraft('wood','beam');
    }
  }
  function autoCreateSlab(){
    if (withinPercentMax('minerals',10)){
      //console.log("creating slab");
      autoCraft('minerals','slab');
    }
  }
  function autoCreateSteel(){
    if(withinPercentMax('iron',20)){
      autoCraft('coal','steel');
    }
  }
  function autoCreateKerosene(){
    if(withinPercentMax('oil',10)){
      autoCraft('oil','kerosene');
    }
  }
  autoBeam = setInterval(autoCreateBeam,200);
  autoSlab = setInterval(autoCreateSlab,500);
  autoSteel = setInterval(autoCreateSteel,200);
  autoKerosene= setInterval(autoCreateKerosene,200);

  autoAstro = setInterval(autoAstroEvent,500);
  /*
  * You should have a conversion function that maps resource you have into resources it produces.  */

  function autoSendHunters(){
    if (withinPercentMax('catpower',10)){
      $("#fastHuntContainer a").click();
    }
  }
  autohunters = setInterval(autoSendHunters,100);

  $("#craftContainer").append('<div id="limits"></div>');
  $(gamePage.resPool.resources).each(function(index,resource){
    if (!(resource.visible==false))
    $("#limits").append('<label style="display:inline-block;width:90%">'+resource.name+': <input style="position:relative;right:0px;display:inline-block;" id="limit_'+resource.name+'" value="'+Math.floor(resource.maxValue*.9)+'" type="text"></label><br/>');
  });


  //setInterval(function () {}, 1000);
});
}

var s = document.createElement("script");
s.type = "text/javascript";
s.src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js"
document.body.appendChild(s)
  
$.getScript("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.js", loadKitties);
