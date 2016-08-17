/*
 *var s = document.createElement('script');s.src="http://localhost:8000/kitties_reloaded.js";s.type="text/javascript";document.body.appendChild(s);
 */
var s = document.createElement("script");
s.type = "text/javascript";
s.src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js"
document.body.appendChild(s);

console.log("kittehs ai v2.0 haz loads");

// a resource is a standard unit that is listed on the left side.  
function Resource(resource)
{
  var r= Object.keys(resource).forEach(function(r){
    this[r]=resource[r];
  },this);
  return this;
}

// a resource is a standard interface for a thing on the left side of the game.  They upgrade, have a name, and can tell if they can upgrade.  Used as a base "class" or as the architype in prototypical inheritance.  I guess architype is the correct work.  Check out how it's used following...
Resource.prototype = {
  enabled:true,
  toggleEnabled: function(){
      this.enabled=!this.enabled;
  },
  max: function(name){
    name=(typeof name == 'undefined') ? this.name: name;
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
    name=(typeof name == 'undefined') ? this.name: name;
    return this.kParse($($(".resTable tr td:contains("+name+":)").parent().find('td').get(1)).text());
  },
  // the dumbest way of finding limit/current/anything from the left table.
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
    return this.withinPercentMax(this.name, this.percent) && this.enabled;
  },
  // Read name as within10PercentOfMaximumResource if percent is 10
  withinPercentMax: function(name,percent){
    name=(typeof name == 'undefined') ? this.name: name;
    percent=(typeof percent == 'undefined') ? this.percent: percent;

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
  percent: 10,
  frequency: 2000,
  // find a reasonable guess for how many to craft by reading the workshop table directly
  // lol jquery
  autoCraft: function (resource, crafted_resource){
      max = $($(".resTable tr td:contains("+crafted_resource+":)").last().parent().find('td').get(2)).text();
      //debugger;
      if(max.indexOf("+")>-1){
        num=(this.kParse(max.substr(1)))/2;
      }
      else
        num=1;
      if (resource =='unobtainium')
        num=1;
      gamePage.craft(crafted_resource ,num);
    },
  getControls(){
    // danger function..  needs to be overridden
    var controls = $("<div class='resource-control'><input value='"+this.percent+"'> %</div>");
    boundFunction = function(t){
        this.percent = t.target.value;

      }.bind(this);
      controls.find('input').on('change',boundFunction);
      return controls;
  }
}

// http://stackoverflow.com/questions/4908378/javascript-array-of-functions
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain
//
// no lulz, real documentation. ^^
// it's good stuff.
//
//a standard resource is one where you only need name and created_resource.  it'll trigger every 2 seconds and convert when within 10% of max;  you can override any property when you instanciate it.
function StandardResource(){
  return Resource.apply(this,arguments);
};

StandardResource.prototype = Object.create(Resource.prototype);
StandardResource.prototype.upgrade = function(){

  if(this.enabled && this.canUpgrade())
  {
    this.autoCraft(this.name, this.crafted_resource);
  }
}

//  checks conditions given instead of being % based
function ConditionalResource(){
  return StandardResource.apply(this,arguments);
};

ConditionalResource.prototype = Object.create(StandardResource.prototype);
ConditionalResource.prototype.canUpgrade = function(){
  if (!this.enabled) return false;

  if((!this.conditions) || this.conditions.length == 0 ){
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
function CustomActionStandardResource(){
  return StandardResource.apply(this,arguments);

}
CustomActionStandardResource.prototype = Object.create(StandardResource.prototype);
CustomActionStandardResource.prototype.upgrade = function(){
  if(this.enabled && this.canUpgrade()){
    return this.action();
  }
}


// like ConditionalResource but with a custom convert action.
function CustomActionConditionalResource(){
  return ConditionalResource.apply(this,arguments);
}
CustomActionConditionalResource.prototype = Object.create(ConditionalResource.prototype);
CustomActionConditionalResource.prototype.upgrade = function(){
  if(this.enabled && this.canUpgrade()){
    return this.action();
  }
}


// maintains a minimum while converting any aboce the minimum
function MinimumResource(){
  return StandardResource.apply(this,arguments);
}
MinimumResource.prototype = Object.create(StandardResource.prototype);
MinimumResource.prototype.canUpgrade = function(){
  if (this.current(this.name)>this.minimum && this.enabled){
    return true;
  }
}


// the kittens object itself.  This is where you'd adjust parameters if you don't want to customize functions.
  function Kittens(resourcesList) {
    this.resources = [];
    this.resources.push(new StandardResource({
      name: 'catnip',
      crafted_resource:"wood",
      frequency: 250,
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
    this.resources.push(new StandardResource({
      name: 'iron',
      crafted_resource:"plate",
      frequency: 2500,
    }));
    this.resources.push(new CustomActionStandardResource({
      name: 'catpower',
      action:function(){
        $("#fastHuntContainer a").click();
      }
    }));
    this.resources.push(new CustomActionStandardResource({
      name: 'faith',
      action: function(){
        gamePage.religion.praise();
      }
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

    this.resources.push(new ConditionalResource({
      name: 'manuscript',
      crafted_resource:"compedium",
      frequency: 2500,
      conditions:[
        function(){return this.current('manuscript')>100;},
        function(){return this.withinPercentMax('science',1);}
      ]
    }));
    this.resources.forEach(function(r){
      return r.initialize();
    });
  }
    window.k = new Kittens();

//this was never used.
/*
    Kittens.prototype = {
      addResources: function(v){
        this.resources.push(v);
      }
    };

    */
//this was copy pasta'd from a previous version
//  it was hard to convert and I got lazy.
  setInterval(function () { $('span:contains(Gather catnip)').click() }, 1);
  window.autoTrade = function (){
    if (Resource.prototype.withinPercentMax('gold',1)){
      if (Resource.prototype.withinPercentMax('catnip',90)) {
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


  // Teh interface  this is not clean right now.
$('body').append("<div id=\"kittehAI\" style=\"width:100%;position:fixed;bottom:0px;height:150px; \">")

window.k.resources.forEach(function(r){
  var resource = $("<div class='resource'><label>" + r.name + "<input checked data-property='enabled' type='checkbox'/></label></div>");
  boundFunction = r.toggleEnabled.bind(r);
  resource.find('[data-property=\'enabled\']').on('click', boundFunction);
  resource.append(r.getControls());
  $("#kittehAI").append(resource);
});
$('body').append("<style> " +
    ".resource {width:22%;display:inline-block;background-color:#ddd;padding-right:15px;}" +
    ".resource label { clear:none;width:30%;float:left}"+
    ".resource .resource-control {float:right; width:20%}" + 
    "#game {margin-bottom:150px;}"
    );






//
//
//
//
//
    // g is an object with own properties 'vertices' and 'edges'.
    // g.[[Prototype]] is the value of Graph.prototype when new Graph() is executed.
