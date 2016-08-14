
/*
 *var s = document.createElement('script');s.src="http://localhost:8000/kitties_reloaded.js";s.type="text/javascript";document.body.appendChild(s);
 */
var s = document.createElement("script");
s.type = "text/javascript";
s.src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js"
document.body.appendChild(s);

var l = document.createElement("script");
l.type = "text/javascript";
l.src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.js"
document.body.appendChild(l);
console.log("kittehs ai v2.0 haz loads");

//$.getScript("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.js", loadKitties);


//there's a kittens object.  it has resources, timeouts, etc,

//

// a resource is a standard unit that accumulates with time.
function Resource(resource)
{
  var r= Object.keys(resource).forEach(function(r){
    this[r]=resource[r];
  },this);
  return this;
}

Resource.prototype = {
  max: function(name){
    if (typeof name == 'undefined') 
      name=this.name;
    max = $($(".resTable tr td:contains("+name+":)").parent().find('td').get(2)).text();
    max = max.replace('/','');
    return this.kParse(max);
  },
  upgrade: function(){
    console.error("this should be overridden");
  },
  type: function(){
    return this.name;
  },
  current: function(name){
    if (typeof name == 'undefined') 
      name=this.name;
    return this.kParse($($(".resTable tr td:contains("+name+":)").parent().find('td').get(1)).text());
  },
  kParse: function(input){
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
  },
  canUpgrade(){
    return this.withinPercentMax(this.name, this.percentage);
  },
  withinPercentMax: function(name,percent){
    if (typeof name == 'undefined') 
      name=this.name;
    if (typeof percent == 'undefined') 
      percent=this.percentage;

    if (0==this.max(name)) return false;
    threshold = this.max(name) - (this.max(name) * (percent/100));
    if (this.current(name) >= threshold){
      return true;
    }
    return false;
  },
  initialize: function(){
    timeoutFunction = this.upgrade.bind(this);
    this.timeout = setInterval(timeoutFunction,this.frequency);
  },
  percentage: 10,
  frequency: 2000,
  autoCraft: function (resource, crafted_resource){
      max = $($(".resTable tr td:contains("+crafted_resource+":)").last().parent().find('td').get(2)).text();
      //debugger;
      if(max.indexOf("+")>-1){
        num=(this.kParse(max.substr(1)))/2;
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

function StandardResource(){
  return Resource.apply(this,arguments);
};

StandardResource.prototype = Object.create(Resource.prototype);
StandardResource.prototype.upgrade = function(){
  console.log("checking upgrade");
  if(this.canUpgrade())
  {
    this.autoCraft(this.name, this.crafted_resource);
  }
}
function ConditionalResource(){
  return Resource.apply(this,arguments);
};

ConditionalResource.prototype = Object.create(Resource.prototype);
ConditionalResource.prototype.upgrade = function(){
  console.log("checking upgrade");
  if(this.canUpgrade())
  {
    this.autoCraft(this.name, this.crafted_resource);
  }
}
ConditionalResource.prototype.canUpgrade = function(){
  console.log("checking conditions for upgrade");
  if(this.conditions.length == 0){
    console.error('No conditions given');
    return false;
  }
  var boundConditions = this.conditions.map(function(condition){
    return condition.bind(this);
  },this);
  return boundConditions.reduce(function(previous,condition){
    return condition() && previous;
  },true);
}

function Hunting(){
  return Resource.apply(this,arguments);
}
Hunting.prototype = Object.create(Resource.prototype);
Hunting.prototype.upgrade = function(){
  if(this.canUpgrade()){
    $("#fastHuntContainer a").click();
  }
}



function MinimumResource(){
  return StandardResource.apply(this,arguments);
}
MinimumResource.prototype = Object.create(StandardResource.prototype);
MinimumResource.prototype.canUpgrade = function(){
  if (this.current(this.name)>this.minimum){
    return true;
  }
}
  function Kittens(resourcesList) {
    //this.resourcesList = resources;
    /*this.resourcesList.forEach(function(resource){
      }
      */
    this.resources = [];
    this.resources.push(new ConditionalResource({
      name: 'catnip',
      crafted_resource:"wood",
      frequency: 250,
      conditions:[
        function(){return this.withinPercentMax('catnip',10);},
        function(){return true;}
      ]
    }));
    this.resources.push(new StandardResource({
      name: 'wood',
      crafted_resource:"beam"
    }));
    this.resources.push(new StandardResource({
      name: 'minerals',
      crafted_resource:"slab"
    }));
    this.resources.push(new ConditionalResource({
      name: 'coal',
      crafted_resource:"steel",
      frequency: 2500,
      conditions:[
        function(){return this.withinPercentMax('iron',10);},
        function(){return this.withinPercentMax('coal',20);}
      ]
    }));
    this.resources.push(new ConditionalResource({
      name: 'iron',
      crafted_resource:"plate",
      frequency: 2500,
      conditions:[
        function(){return this.withinPercentMax('iron',10);},
      ]
    }));
    this.resources.push(new Hunting({
      name: 'catpower',
      crafted_resource:"furs"
    }));
    this.resources.push(new MinimumResource({
      name: 'furs',
      crafted_resource:"parchment",
      minimum:3000
    }));
    this.resources.push(new ConditionalResource({
      name: 'parchment',
      crafted_resource:"manuscript",
      frequency: 2500,
      conditions:[
        function(){return this.current('parchment')>300;},
        function(){return this.withinPercentMax('culture',10);}
      ]
    }));

    this.resources.forEach(function(r){
      return r.initialize();
    });
    //this.edges = [];
  }

    Kittens.prototype = {
      addResources: function(v){
        this.resources.push(v);
      }
    };

  setInterval(function () { $('span:contains(Gather catnip)').click() }, 1);
  window.autoTrade = function (){
    if (Resource.prototype.withinPercentMax('gold',10)){
      if (Resource.prototype.withinPercentMax('catnip',90)) {
        console.log("crafting wood");
        gamePage.craft('wood',100);
      }
      else if(gamePage.diplomacyTab.racePanels[1].tradeBtn.hasResources()){

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

  var autoAstroEvent = function(){
    //console.log($("#rightColumn"));
    if (len =  $("#observeBtn").length >0){
      $("#observeBtn").click()
    }
  }
  autoAstro = setInterval(autoAstroEvent,2000);
    window.k = new Kittens();
    // g is an object with own properties 'vertices' and 'edges'.
    // g.[[Prototype]] is the value of Graph.prototype when new Graph() is executed.
