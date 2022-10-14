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
    toggleMainContainer();
    document.querySelectorAll('a').forEach(elem =>
        {
            elem.addEventListener('click', ev =>
            {
                ev.preventDefault();
                const href = elem.href.split('/');
                const path = href[href.length - 1];
                toggleMainContainer('/' + path);
            })
        })
})
function toggleMainContainer(path = location.pathname)
{
    const topicDisplay = document.querySelector('.topic-container').style.display;
    console.log(path)
    switch (path)
    {
        case '/register':
            togglePage(document.querySelector('#sign-container'));
            break;
        case '/login':
            togglePage(document.querySelector('#login-container'));
            break;
        default:
            togglePage(document.querySelector('.topic-container'), 'flex');
            break;
    }
    window.history.pushState({}, '', path)
}
