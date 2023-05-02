const http = require (`http`)
const path = require (`path`)
const config = require (`./config`)

const fs = require (`fs`)

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


function logRequests(userAgent) {
    let requestsJSON = {};

    const requestsDataBuffer = fs.readFileSync( path.join(__dirname, "data/requests.json") );

    if (requestsDataBuffer.length) {
        // throw new Error("Не удалось прочитать файл")
        let requestsData = Buffer.from(requestsDataBuffer).toString();

        if (requestsData) {
            requestsJSON = JSON.parse(requestsData);
        }
    }

    let userAgentFindRes = getRequestDataByUserAgent(requestsJSON, userAgent);

    //найден
    if (userAgentFindRes !== -1) {
        if (requestsJSON[userAgent]) {
            requestsJSON[userAgent].requests += 1;
        }
        else {
            requestsJSON[userAgent] = {
                "user-agent": userAgent,
                requests: 1
            };
        }
    }
    //не найден
    else {
        if (typeof requestsJSON !== "object") {
            requestsJSON = {};
        }
        requestsJSON[userAgent] = {
            "user-agent": userAgent,
            requests: 1
        };
    }

    fs.writeFileSync(path.join(__dirname, "data/requests.json"), JSON.stringify(requestsJSON))
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

    if (req.url === "/comments") {
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
                // fs.readFile(path.resolve(__dirname, `data`,`com.json`), (error, content) => 
                // {
                //     if (error) 
                //     {
                //         throw error;
                //     }

                //     const data = Buffer.from(content).toString();
                //     let comments = "";
                //     if (data.length){
                //         comments = JSON.parse(data);
                //     }
                //     newComment.dateCreated = new Date();

                //     comments = push(newComment)

                //     const commentsToWrite = JSON.stringify(comments);

                //     fs.writeFile( path.resolve(__dirname, `data`,`com.json`), commentsToWrite, err => 
                //     {
                //         if (err) 
                //         {
                //             throw err;
                //         }

                //         console.log("Файл записан");
                //     })
                // })

                status = 201;
                res.setHeader(`Content-Type`, `application/json`)
                res.end(comments);
            })
        }
        // получить все комментарии
        else if (req.method === "GET") {
            fs.readFile(path.resolve(__dirname, "data", `com.json`), (error, content) => {
                if (error) {
                    throw error;
                }

                const data = Buffer.from(content).toString();
                const comments = JSON.parse(data);
                const commentsToSend = JSON.stringify(comments);

                res.setHeader(`Content-Type`, `application/json`)

                response.end(commentsToSend);
            })
        }

        // метод не поддерживается
        else {
            status = 405;
        }
    }
    
    else if (req.url === "/stats") {
        if (req.method === "GET") {
            fs.readFile( path.resolve(__dirname, `data`, `requests.json`), (err, requestsData) => {
                if (err) {
                    throw err;
                }

                requestsData = Buffer.from(requestsData).toString();

                if (requestsData) {
                    requestsData = JSON.parse(requestsData);
                }
                else {
                    throw new Error("Ошибка при чтении из файла");
                }

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

                for (const userAgent in requestsData) {
                    const requestObject = requestsData[userAgent];

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
            })
        }
    }
    else {
        res.statusCode = 400;
        res.end();
    }
});

server.listen(config.PORT, config.host,(error)=>
{
    error?console.log(error):console.log(`Listening to ${config.PORT} port`)

})