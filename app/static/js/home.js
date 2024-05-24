$(document).ready(function() {

  $('#join').submit(function(){
    var id = $('#id').val();
    $(this).attr('action', "/table/" + id);
  }); 

});

socket.on('closeTable', (response) => {
  socket.emit('tableClosed');
});
