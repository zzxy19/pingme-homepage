function showSnackbar() {
  // Get the snackbar div
  var x = document.getElementById("snackbar");

  // Add the "show" class to dib
  x.className = "show";

  // After 3 seconds, remove the show class from div
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 2000);
}