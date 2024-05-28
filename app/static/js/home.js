$(document).ready(function() {

  $('#join').submit(function(){
    var id = $('#id').val();
    $(this).attr('action', "/table/" + id);
  }); 

});

// socket.on('closeTable', (tableID) => {
//   console.log('close table!!');
//   socket.emit('tableClosed', tableID);
//   window.location.href = '/home';
// });

socket.on('killTable', (tableID) => {
  console.log('kill table!!');
  window.location.href = '/killTable/' + tableID;
});

socket.on('testoutput', (response) => {
  console.log("test: " + response);
})