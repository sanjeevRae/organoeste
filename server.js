/* Entry point for hosts that need a startup file instead of a command
   (cPanel "Setup Node.js App" / Phusion Passenger, Plesk, some panels).

   Passenger loads this file and expects the app to listen on process.env.PORT,
   so this is a thin wrapper around the same production build `next start` uses:

     node server.js          # or: npm run serve
     PORT=8080 node server.js

   Prefer `npm start` (next start) when your host lets you run a real command:
   Next.js can serve its static assets more efficiently without a custom server. */
const { createServer } = require("http");
const next = require("next");

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOSTNAME || "0.0.0.0";
const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, hostname, () => {
      console.log(`> Organoeste pronto em http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error("Falha ao iniciar o servidor:", err);
    process.exit(1);
  });
