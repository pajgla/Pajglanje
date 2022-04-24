document.addEventListener("DOMContentLoaded", () => {

    let openSideMenuButton = document.getElementById("openSideMenuButton");
    openSideMenuButton.addEventListener('click', event => {
        openSideMenu();
    });

    let closeSideMenuButton = document.getElementById("closeSideMenuButton");
    closeSideMenuButton.addEventListener('click', event => {
        closeSideMenu();
    });

    function openSideMenu() {
        document.getElementById("sideMenu").style.width = "250px";
    }
    

    function closeSideMenu() {
        document.getElementById("sideMenu").style.width = "0";
    } 
});