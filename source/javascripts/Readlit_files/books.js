$(document).ready(function(){
  $(".color").spectrum({
      preferredFormat: "hex",
      showInput: true,
      chooseText: "Select",
      change: function(color) {
        $(".color").val(color);
      }
  });
  $(".test").markItUp(mySettings);
});
