const { spawn } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const apiPort = Number(process.env.PORT) || 3001;
const clientPort = Number(process.env.CLIENT_PORT) || 5173;
const preview = process.argv.includes('--preview');
const children = [];
let stopping = false;
const running = port => new Promise(resolve => { const s = net.connect(port, '127.0.0.1'); s.once('connect', () => { s.destroy(); resolve(true); }); s.once('error', () => resolve(false)); s.setTimeout(500, () => { s.destroy(); resolve(false); }); });
function launch(command, args, cwd = root, env = {}) {
  const child = spawn(command, args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit', windowsHide: true });
  children.push(child);
  child.once('error', error => { console.error(error.message); stop(1); });
  child.once('exit', code => { if (!stopping) stop(code || 0); });
  return child;
}
function stop(code = 0) { if (stopping) return; stopping = true; for (const child of children) child.kill(); process.exitCode = code; }
process.once('SIGINT', () => stop()); process.once('SIGTERM', () => stop());
async function main() {
  if (!await running(27018) && !process.env.MONGO_URI) {
    const binary = process.env.MONGOD_PATH || (process.platform === 'win32' ? 'C:/Program Files/MongoDB/Server/6.0/bin/mongod.exe' : 'mongod');
    const db = path.join(root, '.local/mongo'); fs.mkdirSync(db, { recursive: true });
    launch(binary, ['--dbpath', db, '--bind_ip', '127.0.0.1', '--port', '27018', '--logpath', path.join(root, '.local/mongo.log')]);
    let ready = false;
    for (let i = 0; i < 50 && !stopping; i++) { if (await running(27018)) { ready = true; break; } await new Promise(resolve => setTimeout(resolve, 200)); }
    if (!ready) throw new Error('MongoDB did not start. Install MongoDB, set MONGOD_PATH, or supply MONGO_URI.');
  }
  if (stopping) return;
  if (await running(apiPort) || await running(clientPort)) throw new Error(`Ports ${apiPort} or ${clientPort} are occupied. Choose PORT/CLIENT_PORT or stop the previous TripBuddy processes first.`);
  if (preview) {
    const code = await new Promise((resolve, reject) => {
      const build = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--configLoader', 'native'], { cwd: path.join(root, 'client'), env: process.env, stdio: 'inherit', windowsHide: true });
      build.once('error', reject); build.once('exit', resolve);
    });
    if (code !== 0) throw new Error('Frontend build failed; services were not started.');
  }
  launch(process.execPath, ['index.js'], path.join(root, 'server'), { PORT: String(apiPort), CLIENT_ORIGIN: `http://localhost:${clientPort}` });
  launch(process.execPath, ['node_modules/vite/bin/vite.js', ...(preview ? ['preview'] : []), '--configLoader', 'native', '--host', '127.0.0.1', '--port', String(clientPort), '--strictPort'], path.join(root, 'client'), { API_PROXY_TARGET: `http://127.0.0.1:${apiPort}` });
  console.log(`\nTripBuddy frontend: http://localhost:${clientPort}\nTripBuddy backend: http://localhost:${apiPort}/healthcheck\nPress Ctrl+C to stop services started by this launcher.\n`);
}
main().catch(error => { console.error(error.message); stop(1); });
