//Start out by loading lodash.
$.getScript("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.js", function(){
  //once lodash is loaded, init the kittehs ai object.
  window.kittiesAI = KittiesAi();
  window.kittiesAI.init()
})

function KittiesAi(){
  /** 
  * currentResource returns the integer limit of the current resource requested.
  */
  //  kittiesAI always refers to the kitties ai object.
  //  this code brought to you by pbr and jazzy jeff.
  kittiesAI=this;
  //currentResource  returns the parsed/scraped amount of resources.
  this.currentResource= function(resource_name){
    return kParse($($(".resTable tr td:contains("+resource_name+":)").parent().find('td').get(1)).text());
  }
  /**
  * kParse returns the integer version of K and M resources.  Example, 19.84K would be 19840.
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


  //ok, got some preliminaries done.

  /** getLimits will return an object with min and max properties for resources
  * */
  this.getResourceLimits = function(){
    console.log(this.name);
    return kittiesAI.getLimits(this.name);
  }
  this.getLimits = function(resource){
    //limits is a keyed object that has min and max.  it was put here with intention of replacing it with something more intelligent later.
  limits = {
      'catnip':{
        min:3000000,
        max: 8000000,
        becomes:'wood'
      },
      'wood':{
        min:3000000,
        max: 6000000,
        becomes: 'beam'

      },
      'minerals':{
        min:3000000,
        max: 6000000,
        becomes:'slab'
      },
      'coal':{
        min:100000,
        max: 200000,
        becomes:'steel'
      },
      'iron':{
        min:500000,
        max:1000000,
        becomes:'plate'
      },
      'unobtanium':{
        min:1000,
        max:2000,
        becomes:'eludium'
      },
      //titanium is different cause it requires steel to become alloy, so this and coal might go away.
      'titanium':{
        min:80000,
        max:90000,
        becomes:'alloy'
      },

    };
    return limits[resource];
  }
  //
  //within limits uses the limits above to determine if it's above the minimum.  Currently max isn't used.
  this.withinLimits = function (resource){
    limits = getLimits(resource);
    if((currentResource(resource)>limits.min)){
      // if greater than max and not less than min
      return true;
    }
    return false;
  }

// autoCraft takes a resource and a resource that it can become and does that.  It's based on the workshop table
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
  // most of this code is based on timeouts..  If you read through the previous code, I had three timeouts I actually tracked.  So when I needed, I could clearInterval (excuse the fact that I use timeout and interval interchangably) on whatever.  that's useful if you can't control the upper bound without reloading this script.  then again, you end up reloading to start the timeouts agian..  it's a mess.
  this.timeouts = [];
  //get resource is new.  it returns the game's own resource object which has some info about max, per tick, etc,
  //super useful, but not in the original version.  Left split, I tried to stay out of the game code as much as possible.  now, I just want to wreck shit.  Also, underscore/lodash is awesome.
  this.getResource = function(name){
    return _.filter(kittiesAI.resources,{name:name})[0];
  };
  


  /*
  this.registerResourceAtLimitHandler=  function(timeout, callback){
    
    timeouts[resource]=setInterval(callback,timeout);
    
  };
  */
  //
  //Init is the meat of setting all this shit up.  This is a personal project; I'll use profanity if I want.
  this.init=function(){
    // watchResource is set to get min/max for resource and craft the other resource every N ms.
    kittiesAI.resources = gamePage.resPool.resources;
    _.each(gamePage.resPool.resources, function(resource){
    });

    
//so in theory, we could do something fun like making a transitions object.
    var resourceDescriptors = {
      catnip:{from:'catnip',to:'wood'},
      wood:{from:'wood',to:'beam'},
      minerals:{from:'minerals',to:'slab'},
      coal:{from:'coal',to:'steel'},
      iron:{from:'iron',to:'plate'},
      titanium:{from:'titanium',to:'alloy'},
      unobtanium:{from:'unobtanium',to:'eludium'}
    };
    //titanium is a weird problem.  Titanium is used to make alloy, but also to make eludium. 
    
    var prices = {};
    prices = _.reduce(gamePage.workshop.crafts, function(accumulator, value, index, collection){
      accumulator[value.name]=value.prices;
      return accumulator;
    },prices);
    self.prices = prices;

    products = {};
    products = _.reduce(prices, function(accumulator, value, key, collection){

      _.each(value, function(val,index){
        if(_.isUndefined(accumulator[val.name]))
        {
          accumulator[val.name]=[{resource:key,value:val.val}];
          // and be back later.
        }
        else accumulator[val.name].push({resource:key,value:val.val});

        return accumulator;
      });
      accumulator[key] = value;

      return accumulator;

    },products);
        debugger;

    //
    //so now, resourceDescriptors will be keyed. we can use _.each to loop over them.
    _.each(resourceDescriptors, function(value, key){
      this.timeouts[key]=setInterval(_.bind(function(){ autoCraft(this.from,this.to)},value),100);
    });
// now the thing I want to look at is the more complicated resources.  Like, iron/coal to steel/plate.  iron becomes plate.  Iron+coal becomes steel.  so iron has two conversion possiblities.  I've been managing it in game by keeping my coal production below my iron production since coal:iron->steel 1:1->??



    // we should also watch for star events...
    var autoAstroEvent = function(){
      //console.log($("#rightColumn"));
      if (len =  $("#rightColumn button").length >0){
        $("#rightColumn button").click();
      }
      if (len =  $("#rightColumn input").length >0){
        $("#rightColumn input").click();
      }
    }
    // autoAstroEvent actually handles both astro and really anything that happens in the notification pannel.  I don't remember why it looks for button and input but i think it has something to do with unicorns.  Yes, unicorns.
    timeouts['astro']=setInterval(autoAstroEvent,500);
  // right now, I have 171k oil and need to get rid of it.  I have 44k gold and the same there.
  // I also have a couple PBRs to get rid of.  BRB
  
  }
  //we return this becuase ? ????
  return this;
};


