// Optional local preview. Requires Node.js; the published app has no Node dependency.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname,mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end('Not found');return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.end(data);});
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'Port 4173 sedang digunakan. Cuba buka http://127.0.0.1:4173/':'Pelayan tidak dapat dimulakan: '+error.message);process.exitCode=1;});
server.listen(4173,'127.0.0.1',()=>console.log('EYES UP! v1.0 — http://127.0.0.1:4173/\nBiarkan tetingkap ini terbuka semasa menggunakan pratonton tempatan. Ctrl+C untuk berhenti.'));
