$ErrorActionPreference = "Stop"

$HOST_IP = "179.43.120.168"
$USER = "root"
$PORT = "5169"

Write-Host "Conectando al VPS $HOST_IP para liberar espacio..." -ForegroundColor Cyan

# Check if ssh is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Error "El comando 'ssh' no está disponible."
    exit 1
}

# Run docker system prune -af to remove all unused images and build cache
Write-Host "Ejecutando limpieza de Docker..."
ssh -p $PORT $USER@$HOST_IP "docker system prune -af --volumes"

if ($LASTEXITCODE -eq 0) {
    Write-Host "¡Limpieza completada exitosamente!" -ForegroundColor Green
    Write-Host "Ahora puedes intentar desplegar nuevamente."
} else {
    Write-Error "Hubo un error al ejecutar la limpieza en el servidor."
}
