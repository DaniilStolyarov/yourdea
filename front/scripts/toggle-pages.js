function togglePage(pageContainer)
{
    const mainContainer = document.querySelector("#main-container");
    const pages = mainContainer.children;
    [...pages].forEach(page => 
    {
        page.style.display = "none";
    })
    pageContainer.style.display = "block";
}
window.onload = () =>
{

    togglePage(document.querySelector('#sign-container'));
}