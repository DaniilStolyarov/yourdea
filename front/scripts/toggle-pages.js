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
    togglePage(document.querySelector('#sign-container'))
})