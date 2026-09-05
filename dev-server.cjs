// Servidor estático de desenvolvimento, sem dependências. GitHub Pages continua usando index.html.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const portIndex=process.argv.indexOf('--port');
const port=Number(portIndex>=0?process.argv[portIndex+1]:process.env.PORT||4173);
http.createServer((req,res)=>{
 const raw=decodeURIComponent(new URL(req.url,'http://local').pathname);const file=path.resolve(__dirname,'.'+raw+(raw.endsWith('/')?'index.html':''));
 if(!file.startsWith(__dirname+path.sep)||raw.split('/').some(x=>x.startsWith('.'))){res.writeHead(403);res.end();return;}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(data);});
}).listen(port,'0.0.0.0',()=>console.log('Arena pronta na porta '+port));
