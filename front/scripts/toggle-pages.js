// смена отображаемых страниц в зависимости от введённого url
function togglePage(pageContainer, display = "block")
{
    const mainContainer = document.querySelector("#main-container");
    const pages = mainContainer.children;
    [...pages].forEach(page => 
    {
        page.style.display = "none";
    })
    pageContainer.style.display = display;
}
document.addEventListener("DOMContentLoaded", () =>
{
    const topicDisplay = document.querySelector('.topic-container').style.display;
    switch (location.pathname)
    {
        case '/register':
            togglePage(document.querySelector('#sign-container'));
            break;
        case '/login':
            togglePage(document.querySelector('#login-container'));
            break;
        default:
            togglePage(document.querySelector('.topic-container'), topicDisplay);
            break;
    }
})