window.addEventListener("DOMContentLoaded", main)
async function main()
{
    const body = document.querySelector('body');
    const initHeight = body.clientHeight;
    body.style.minHeight = initHeight + "px";
    document.querySelector('#input-file').addEventListener('change', async (event) =>
    {
        const image = event.target.files[0];
        const imageUrl = URL.createObjectURL(image)
        document.querySelector('label[for = input-file]').style["background-image"] = `url(${imageUrl})`;
        [...document.querySelectorAll('.avatar-preview')].forEach(elem =>
            {
                elem.style["background-image"] = `url(${imageUrl})`;
            })
    })
    document.querySelectorAll('input').forEach(elem =>
        {
            elem.addEventListener('keydown', (ev) =>
            {
                if (ev.key == 'Enter') ev.preventDefault();
            })
        })
    putEditorOnApplyPage();
}
async function putEditorOnApplyPage()
{
    const editor = new EditorJS
    ({
        holder: "apply-form",
        placeholder : "Опишите свою идею",
        tools :
        {
            header : {
                class : Header,
                inlineToolbar : ['link', 'bold']
            },
            list : 
            {
                class : List,
                inlineToolbar : true
            },
            embed :
            {
                class : Embed,
                inlineToolbar : false,
                config : 
                {
                    services : 
                    {
                        youtube : true,
                        coub : true
                    }
                }
            }
        },
        toolbar : ['link, bold, italic']
    })
    await editor.isReady; 
    window.editor = editor
}   