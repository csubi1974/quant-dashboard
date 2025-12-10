const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Tradier Dashboard...\n');

// Función para ejecutar comandos
function runCommand(command, args, options = {}) {
  const proc = spawn(command, args, {
    stdio: 'pipe',
    shell: true,
    ...options
  });

  proc.stdout.on('data', (data) => {
    console.log(`[${options.name || command}] ${data.toString().trim()}`);
  });

  proc.stderr.on('data', (data) => {
    console.error(`[${options.name || command}] ${data.toString().trim()}`);
  });

  proc.on('close', (code) => {
    console.log(`[${options.name || command}] Proceso finalizado con código ${code}`);
  });

  return proc;
}

// Iniciar backend
console.log('📡 Iniciando servidor backend...');
const backendProcess = runCommand('npm', ['run', 'dev:api'], {
  name: 'BACKEND',
  cwd: path.join(__dirname, 'api')
});

// Esperar un poco antes de iniciar el frontend
setTimeout(() => {
  console.log('🌐 Iniciando aplicación frontend...');
  const frontendProcess = runCommand('npm', ['run', 'dev'], {
    name: 'FRONTEND',
    cwd: __dirname
  });
}, 3000);

// Manejar cierre de la aplicación
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando aplicación...');
  if (backendProcess) backendProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Cerrando aplicación...');
  if (backendProcess) backendProcess.kill();
  process.exit(0);
});