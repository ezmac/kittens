// new yavascript file.  Yes, I like to pronounce it Yavascript.
//

// so I like what I know of functional programming (lodash) and I abuse jQuery.




//Start out by loading lodash.
$.getScript("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.js", function(){
  window.kittiesAI = KittiesAi();
  window.kittiesAI.init()
})
// so apparently peple can't read my retina display.
// is that better?!?!?!?!

function KittiesAi(){
  /** 
  * currentResource returns the integer limit of the current resource requested.
  */
  this.currentResource= function(resource_name){
    return kParse($($(".resTable tr td:contains("+resource_name+":)").parent().find('td').get(1)).text());
  }
  /**
  * kParse returns current resourses by screen scraping the resources panel ..  not elegant.
  * */
  this.kParse = function(input){
    kParser = /([\d]*)\.?([\d]*)(K|M)/i;
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
    return parseInt(parseInt(matches[1]*multiplier)+(hundreds*(multiplier/100)));
  }
  this.currentResource = function(name){
    return kParse($($(".resTable tr td:contains("+name+":)").parent().find('td').get(1)).text());
  }

  //ok, got some preliminaries done.
  //  I don't know how to do tdd hax, so I'm going to be manually testing.
  //  next thing is to make auto-refine catnip work.
  //  If you don't know this game, you build up resources to some limit then refine them to some other resource

  /** getLimits will return an object with min and max properties for resources
  * */
  this.getLimits = function(resource){
    return {min:3000000, max: 6000000};

  }
  this.withinLimits = function (resource){
    limits = getLimits(resource);
    if((currentResource(resource)>limits.min)){
      // if greater than max and not less than min
      return true;
    }
    return false;

  }
  this.autoCraft = function(resource, crafted_resource){
    if (!withinLimits(resource)) return;
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
    console.log('crafted '+crafted_resource);
  }
  this.timeouts = [];
  this.watchResource=function (resource,createdResource,ms){
    timeouts[resource]=setInterval(function(){autoCraft(resource,createdResource)},ms);
  };
  this.init=function(){
    //autocraft is set to craft if there are almost too many resources.

    watchResource('catnip','wood',100);
  }
  return this;
};
//isn't it funny...  All these videos I play in the background always have half naked women in them..  nsfw, but https://www.youtube.com/watch?v=jK73UoH_aVo
//and tmux doesn't adjust well to the resolution change.  The things I put up with...
