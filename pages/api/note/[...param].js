import { getNoteByID } from "../../../prisma/Note";
import { getSession } from "next-auth/react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import { TipTapCustomImage } from "@/node/Image";
import { Drawing } from "@/node/Drawing";
import {CodeBlockNode} from '../../../node/ExportCode'
import TurndownService from 'turndown';
import MarkdownPDF from "markdown-pdf";

const CSS = `<style>
/* general css */
html,
body {
padding: 0;
margin: 5%;
font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
color: inherit;
text-decoration: none;
}

* {
box-sizing: border-box;
}

/* image resizer styling */
.image-small, .drawing-small {
max-width: 200px;
}
.image-medium, .drawing-medium {
max-width: 500px;
}
.image-large, .drawing-large {
max-width: 100%;
}
.image-float-none, .drawing-float-none {
float: none;
}
.image-float-left, .drawing-float-left {
float: left;
}
.image-float-right, .drawing-float-right {
float: right;
}

.container {
min-height: 100vh;
padding: 0 0.5rem;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
}

.main {
padding: 5rem 0;
flex: 1;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
}

.code {
background: #fafafa;
border-radius: 5px;
padding: 0.75rem;
font-size: 1rem;
font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono,
    Bitstream Vera Sans Mono, Courier New, monospace;
}

.output {
	white-space: pre-line;
	line-height:1.1em;
}
}
  
</style>`

const htmlTemplate = (title, body, name, css) => {
    if (css){
        return(`<html><head><title>${title}</title><meta charset="utf-8">${CSS}</head><body><h1>${title}<h1/><h4>${name}</h4><br><hr>${body}</body></html>`)
    }
    return(
        `<html><head><meta charset="utf-8"></head><body><h1>${title}<h1/><h4>${name}</h4><br><hr>${body}</body></html>`
)} 

const extensions = [StarterKit, Drawing(), TipTapCustomImage()]


export default async function handle(req, res) {
    const { param } = req.query
    const session = await getSession({ req });
    if (param.length === 3){
        if (param[1] === "export"){
            const noteId = param[0]
            const note = await getNoteByID(noteId)
            const title = note.title
            const body = generateHTML(note.body, [StarterKit, Drawing(), TipTapCustomImage(),BulletList,Underline,Superscript,Subscript,Youtube,Link,CodeBlockNode])
            if (param[2] === "md"){
                const html = htmlTemplate(title, body, note.user.name, false)
                const turndownService = new TurndownService()
                const markdown = turndownService.turndown(html)
                res.status(200).json({text: markdown})

            } else if (param[2] === "html"){
                let html = htmlTemplate(title, body, note.user.name, true)
                html = "<!doctype html>" + html
                res.status(200).json({text: html})
                
            } else if (param[2] === "pdf") {
                const html = htmlTemplate(title, body, note.user.name, false)
                const turndownService = new TurndownService()
                const markdown = turndownService.turndown(html)
                MarkdownPDF().from.string(markdown).to.buffer(function (er, string){
                    res.status(200).json({
                        text: string
                    })
                })
            }else {
                return res.status(501).json({ message: `` });
            }
        } else{
            return res.status(501).json({ message: `/api/note/${param.join('/')} is not implemented` });
        }
    }
    else{
        return res.status(501).json({ message: `/api/note/${param.join('/')} is not implemented` });
    }
}