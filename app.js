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


function logRequests(userAgent) {

    let userAgentFindRes = getRequestDataByUserAgent(requests, userAgent);

    //найден
    if (userAgentFindRes !== -1) {
        if (requests[userAgent]) {
            requests[userAgent].requests += 1;
        }
        else {
            requests[userAgent] = {
                "user-agent": userAgent,
                requests: 1
            };
        }
    }
    //не найден
    else {
        requests[userAgent] = {
            "user-agent": userAgent,
            requests: 1
        };
    }


}

function getRequestDataByUserAgent(requestData, userAgentName) {
    const keys = Object.keys(requestData);

    return keys.indexOf(userAgentName);
}


const server = http.createServer((req,res)=>
{
    const userAgent = req.headers["user-agent"];
    logRequests(userAgent);
    


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
			let HTMLTable = `
					<meta charset="utf-8">
					<style>
						table tr td:first-child {
							max-width: 400px;
						}
					</style>
					<table>
						<thead>
							<tr>
								<th>User-agent</th>
								<th>Количество запросов</th>
							</tr>
						</thead>
					
						<tbody>`;

			for (const userAgent in requests) {
				const requestObject = requests[userAgent];

				HTMLTable += `
				<tr>
					<td>${requestObject["user-agent"]}</td>
					<td>${requestObject.requests}</td>
				</tr>
				`
			}

			HTMLTable+= `
					</tbody>
				</table>
				`;

			res.setHeader("Content-Type", "text/html",)
			res.end(HTMLTable);
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