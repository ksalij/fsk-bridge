$(document).ready(function() {

  $('#join').submit(function(){
    var id = $('#id').val();
    $(this).attr('action', "/joinTable/" + id);
  }); 

});

socket.on('killTable', (tableID) => {
  window.location.href = '/killTable/' + tableID;
});

socket.on('redirectHome', (error) => {
  window.location.href = '/home/' + error;
});

socket.on('testoutput', (response) => {
  console.log("test: " + response);
});