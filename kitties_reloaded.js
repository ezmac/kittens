
/*
 *var s = document.createElement('script');s.src="http://localhost:8000/kitties_reloaded.js";s.type="text/javascript";document.body.appendChild(s);
 */
var s = document.createElement("script");
s.type = "text/javascript";
s.src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js"
document.body.appendChild(s)
  
//$.getScript("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.js", loadKitties);


//there's a kittens object.  it has resources, timeouts, etc,

//

function Resource(resource)
{
  var r= Object.keys(resource).forEach(function(r){
    this[r]=resource[r];
  },this);
  return this;
}

Resource.prototype = {
  max: function(name){
    max = $($(".resTable tr td:contains("+this.name+":)").parent().find('td').get(2)).text();
    max = max.replace('/','');
    return this.kParse(max);
  },
  upgrade: function(){
      console.log("checking upgrade");
      if(this.withinPercentMax(this.percentage))
      {
        console.log("upgrading " + this.name + " because percent");
        var limit=$("#limit_"+this.name).val();
        //if (currentResource(resource)>limit){
          //console.log("creating "+crafted_resource);
          max = $($(".resTable tr td:contains("+this.crafted_resource+":)").last().parent().find('td').get(2)).text();
          if(max.indexOf("+")>-1){
           num=(this.kParse(max.substr(1)))/2;
           //if('catnip'==this.name){
           //console.log("catnip " + num);
           //}
          }
          else
            num=1;
          if (this.name =='unobtainium')
            num=1;
          gamePage.craft(this.crafted_resource, num);
        }
  },
  type: function(){
    return this.name;
  },
  current: function(){
    return this.kParse($($(".resTable tr td:contains("+this.name+":)").parent().find('td').get(1)).text());
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
  withinPercentMax: function(percent){
    if (0==this.max()) return false;
    threshold = this.max() - (this.max() * (percent/100));
    if (this.current() >= threshold){
      return true;
    }
    return false;
  },
  initialize: function(){
    timeoutFunction = this.upgrade.bind(this);
    this.timeout = setInterval(timeoutFunction,this.frequency);
  }

}

function Kittens(resourcesList) {
  //this.resourcesList = resources;
  /*this.resourcesList.forEach(function(resource){
  }
  */
  this.resources = [];
  this.resources.push(new Resource({
    name: 'catnip',
    percentage: 10,
    frequency: 250,
    crafted_resource:"wood"
  }));
  this.resources.push(new Resource({
    name: 'wood',
    percentage: 10,
    frequency: 500,
    crafted_resource:"beam"
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

window.k = new Kittens();
// g is an object with own properties 'vertices' and 'edges'.
// g.[[Prototype]] is the value of Graph.prototype when new Graph() is executed.
