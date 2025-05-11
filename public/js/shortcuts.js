/* Add keyboard shortcuts for common actions */
document.addEventListener('keydown', function(event) {
  // Shortcut for opening the cart (Ctrl + Alt + C)
  if (event.ctrlKey && event.altKey && event.key === 'c') {
    window.location.href = '/cart';
  }

  // Shortcut for opening the profile (Ctrl + Alt + P)
  if (event.ctrlKey && event.altKey && event.key === 'p') {
    window.location.href = '/profile';
  }

  // Shortcut for going to the homepage (Ctrl + Alt + H)
  if (event.ctrlKey && event.altKey && event.key === 'h') {
    window.location.href = '/';
  }

  // Shortcut for opening the wishlist (Ctrl + Alt + W)
  if (event.ctrlKey && event.altKey && event.key === 'w') {
    window.location.href = '/wishlist';
  }

  // Shortcut for opening the contact page (Ctrl + Alt + O)
  if (event.ctrlKey && event.altKey && event.key === 'o') {
    window.location.href = '/contact';
  }

  // Shortcut for opening the about page (Ctrl + Alt + A)
  if (event.ctrlKey && event.altKey && event.key === 'a') {
    window.location.href = '/about';
  }

  // Shortcut for logging out (Ctrl + Alt + L)
  if (event.ctrlKey && event.altKey && event.key === 'l') {
    window.location.href = '/logout';
  }

  // Shortcut for opening the categories page (Ctrl + Alt + G)
  if (event.ctrlKey && event.altKey && event.key === 'g') {
    window.location.href = '/categories';
  }
});