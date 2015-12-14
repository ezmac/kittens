# Kitties
http://bloodrizer.ru/games/kittens/#
## about
Kittens game was written by someone, no idea who.  It's single player so doesn't matter that I cheat.  To me, it's more fun to automate the game than actually play it.
There's a git repo that goes with this.
https://github.com/ezmac/kittens

At current point, I've got a messy but working script.  Here's the demo.

Problem being it got hard to manage and every time you wanted to reset or change limits of a resource, you had to reload the page and be able to access the source.  not good if you're sharing it with someone.

### How to

  ```
  //there's a bug with trade. before loading the script, activate the trade tab.

  // paste something like this in console.  Sorry github.
  $('body').append("<script src='https://raw.githubusercontent.com/ezmac/kittens/master/kitties.js'>");
  ```
