$(document).ready(function() {

  $('#join').submit(function(){
    var id = $('#id').val();
    $(this).attr('action', "/table/" + id);
  }); 


  $('#rejoin').submit(function(){
    $(this).attr('action', "/rejoin")
  })

});
