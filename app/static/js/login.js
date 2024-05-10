document.getElementById('eye').addEventListener('click', function() {
    var passwordInput = document.getElementById('password');
    var icon = document.getElementById('eye');
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.name = 'eye-off-outline';
    } else {
      passwordInput.type = 'password';
      icon.name = 'eye-outline';
    }
});