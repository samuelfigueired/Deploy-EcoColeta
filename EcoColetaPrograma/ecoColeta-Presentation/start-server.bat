@echo off
echo ===============================================
echo       🌱 EcoColeta - Iniciando Servidor
echo ===============================================
echo.

echo Verificando dependencias...
if not exist node_modules (
    echo Instalando dependencias do npm...
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependencias!
        pause
        exit /b 1
    )
)

echo.
echo ✅ Dependencias verificadas!
echo.

echo Iniciando servidor com CORS configurado...
echo.
echo 📝 Informações importantes:
echo    - Servidor rodando em: http://localhost:3000
echo    - API disponível em: http://localhost:3000/api
echo    - Arquivos estáticos em: http://localhost:3000
echo    - Página de teste: http://localhost:3000/test-api.html
echo.
echo 🔧 Para usar com Live Server:
echo    - Inicie o Live Server em qualquer porta (ex: 5500)
echo    - O CORS já está configurado para as portas comuns
echo.
echo Para parar o servidor: Ctrl+C
echo.

node server.js
