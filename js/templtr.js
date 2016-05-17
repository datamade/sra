//templtr provides functionality for precompiling and 
//storing underscore templates
//call load templates and any html tag marked with the class
// _template will be loaded into templatr with the ID of the tag 
// as the name of the template 
var templtr={
  canUse:function(){
    if(!$||!_)
    {
      return false;
    }
    return true;
  },

  loadTemplates:function()
  {
    if(!this.canUse()){
      console.log("Underscore and/or Jquery not found")
      return;
    }
    $("._template").each(function(){
      if(!$(this).attr("id"))
      {
        return;
      }
      templtr.templates[$(this).attr("id")] = _.template($(this).html());
    })
  },
  getTemplate:function(sName)
  {
    if(!this.templates[sName])
    {
      console.log("No template found with name "+sName);
    }
    return this.templates[sName];
  },
  templates:{}
}