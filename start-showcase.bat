@echo off
setlocal EnableDelayedExpansion
rem Arranca el showcase de CaribeNG (documentacion de la libreria).
rem Verifica que el puerto este libre; si esta ocupado ofrece liberarlo o usar otro.
rem IMPORTANTE: este archivo debe guardarse con saltos de linea CRLF (Windows).

cd /d "%~dp0"
set "PORT=4200"
set "NODE_OPTIONS=--dns-result-order=ipv4first"

rem Con doble clic el PATH puede no incluir Node (Volta, nvm, instalador oficial).
set "_VOLTA_TOOL_RECURSION="
where node >nul 2>&1
if errorlevel 1 (
  for %%D in ("%ProgramFiles%\Volta" "%LOCALAPPDATA%\Volta\bin" "%ProgramFiles%\nodejs" "%NVM_SYMLINK%") do (
    if exist "%%~D\node.exe" set "PATH=%%~D;!PATH!"
  )
)
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] No se encontro Node.js. Instalalo o agregalo al PATH y vuelve a intentar.
  pause
  exit /b 1
)

if not exist "node_modules\.bin\nx.cmd" (
  echo [ERROR] No se encontro node_modules. Ejecuta primero: pnpm install
  pause
  exit /b 1
)

:check_port
set "PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do set "PID=%%P"

if not defined PID goto port_free

set "PNAME=desconocido"
for /f "tokens=1 delims=," %%N in ('tasklist /fi "PID eq %PID%" /fo csv /nh 2^>nul') do set "PNAME=%%~N"
echo.
echo [AVISO] El puerto %PORT% esta ocupado por !PNAME! (PID %PID%).
echo   [K] Cerrar ese proceso y usar el puerto %PORT%
echo   [O] Usar el siguiente puerto libre
echo   [C] Cancelar
choice /c KOC /n /m "Elige una opcion [K/O/C]: "
if errorlevel 3 exit /b 1
if errorlevel 2 (
  set /a PORT+=1
  goto check_port
)
taskkill /pid %PID% /t /f >nul 2>&1
if errorlevel 1 (
  echo [ERROR] No se pudo cerrar el proceso %PID%. Prueba ejecutando como administrador.
  pause
  exit /b 1
)
timeout /t 1 /nobreak >nul
goto check_port

:port_free
echo [OK] Puerto %PORT% libre.

echo.
echo Generando el codigo TypeScript de los ejemplos...
call node apps\showcase\scripts\gen-doc-code.mjs
if errorlevel 1 echo [AVISO] No se pudo regenerar doc-code.json; se usara el existente.
call node apps\showcase\scripts\gen-changelog.mjs
if errorlevel 1 echo [AVISO] No se pudo regenerar el changelog; se usara el existente.

echo.
echo Iniciando showcase en http://localhost:%PORT% ...
call node_modules\.bin\nx.cmd serve showcase --port=%PORT% --open

echo.
echo El servidor se detuvo. Si hubo un error, revisa los mensajes de arriba.
pause
endlocal
