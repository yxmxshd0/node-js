const http = require (`http`)
const path = require (`path`)
const config = require (`./config`)


const comments = [
    {
        id:1,
        name: `Roman`,
        Age:20
    },
    {
        id:2,
        name:`Lenya`,
        Age:15
    }

];


const requests = {};

let users = {};



const server = http.createServer((req,res)=>
{
    const userAgent = req.headers["user-agent"];
    


    console.log(`Server request`);

    let status = 400;
    if(req.url===`/`)
    {
        status = 200;
        res.setHeader(`Content-Type`, `text/html`)
        res.write(`<h1>Hi!You're on main page</h1>`);
        res.end();
    }

    if (req.url === "/comments") 
	{
        // Добавить новый комментарий
        if (req.method === "POST") {
            let body = "";
             req.on("data", chunk => {
                body += chunk;
            })
            req.on("end", () => 
            {
                const newComment = JSON.parse(body);
                newComment.dateCreated = new Date();
                comments.push(newComment);

                res.statusCode = 201;
                res.setHeader(`Content-Type`, `application/json`)
                res.end(JSON.stringify(comments));
            })
        }
        // получить все комментарии
        else if (req.method === "GET") {
            res.statusCode = 201;
            res.setHeader(`Content-Type`, `application/json`)
            res.end(JSON.stringify(comments));
        }
        // метод не поддерживается
        else {
            res.statusCode = 405;
            res.end();
        }
    }
    
    else if (req.url === "/stats")
	{
        if (req.method === "GET") 
		{
            let firstHtml =
                `<meta charset="utf-8">
                    <style>
                        table tr td:first-child 
                        {
                            max-width: 200px;
                            padding-right: 100px;
                        }
                        </style>` +
                    `<table>`+
                        '<tr>' +
                            '<td>Имя</td>' +
                                '<td>Счётчик</td>' +
                        '</tr>'
            let secondHtml = ''
            if (users[userAgent]) 
            {
                users[userAgent] += 1
            }  
            else
            {
                users[userAgent] = 1
            }
            for (const key in users) {
                secondHtml +=
                        `<tr>
                            <td>${key}</td>
                            <td>${users[key]}</td>
                        </tr>`
            }
            let resHtml = firstHtml + secondHtml + '</table>'
			res.setHeader("Content-Type", "text/html",)
			res.end(resHtml);
    	}
		else 
		{
			res.statusCode = 400;
			res.end();
		}
	}
})

server.listen(config.PORT, config.host,(error)=>
{
    error?console.log(error):console.log(`Listening to ${config.PORT} port`)

})