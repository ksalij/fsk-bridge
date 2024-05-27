$(document).ready(function() {

  $('#join').submit(function(){
    var id = $('#id').val();
    $(this).attr('action', "/table/" + id);
  }); 

});

socket.on('closeTable', (tableID) => {
  socket.emit('tableClosed', tableID);
  window.location.href = '/home';
});

socket.on('killTable', (tableID) => {
  window.location.href = '/killTable/' + tableID;
});