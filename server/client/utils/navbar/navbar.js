const profile = document.getElementById("profile-btn");
const profileList = document.getElementById("profile");
const menu = document.getElementById("menu-icon");
const menuList = document.getElementById("list");

console.log(menu, menuList);

let showProfile = true;
let showMenu = true;
document.addEventListener("click", (event) => {
  const target = event.target;
  if (
    !profile.contains(target) &&
    !profileList.contains(target) &&
    !showProfile
  ) {
    profileList.style.display = "none";
    showProfile = true;
  } else if (profile.contains(target)) {
    if (showProfile) {
      profileList.style.display = "flex";
      showProfile = false;
    } else {
      profileList.style.display = "none";
      showProfile = true;
    }
  }
  if (!menu.contains(target) && !menuList.contains(target) && !showMenu) {
    menuList.style.display = "none";
    showMenu = true;
  } else if (menu.contains(target)) {
    if (showMenu) {
      menuList.style.display = "flex";
      showMenu = false;
    } else {
      menuList.style.display = "none";
      showMenu = true;
    }
  }
});
