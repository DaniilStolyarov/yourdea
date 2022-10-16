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
function getId(input)
{
    console.log(input)
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
                        coub : true,
                        imgur : 
                        {
                            regex: /https?:\/\/(?:i\.)?imgur\.com.*\/([a-zA-Z0-9]+)(?:\.gifv)?/,
                            embedUrl: 'https://imgur.com/<%= remote_id %>/embed',
                            html: '<iframe allowfullscreen="true" scrolling="no" id="imgur-embed-iframe-pub-<%= remote_id %>" class="imgur-embed-iframe-pub" style="height: 500px; width: 100%; border: 1px solid #000"></iframe>'
                        }
                    }
                }
            },
            image :
            {
                class : ImageTool,
                config : 
                {
                    endpoints : 
                    {
                        byUrl : `${location.origin}/upload-image-url`,
                        byFile : `${location.origin}/upload-image-file`
                    }
                }
            }
        },
        toolbar : ['link, bold, italic']
    })
    await editor.isReady; 
    window.editor = editor
}   