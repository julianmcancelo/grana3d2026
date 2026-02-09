$ErrorActionPreference = "Stop"
$HOST_IP = "179.43.120.168"
$USER = "root"
$PORT = "5169"

Write-Host "Verificando reglas de Firewall (UFW / IPTABLES)..." -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "ufw status verbose || echo 'UFW no instalado'"

Write-Host "`nIntentando abrir puerto 3000..." -ForegroundColor Cyan
ssh -p $PORT $USER@$HOST_IP "ufw allow 3000/tcp && ufw reload"

Write-Host "`nVerificando si IPTABLES está bloqueando..."
ssh -p $PORT $USER@$HOST_IP "iptables -L Input -n -v | grep 3000 || echo 'No hay reglas explícitas para 3000 en IPTABLES'"
