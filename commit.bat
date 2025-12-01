@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo    🚀 COMMIT AUTOMATIQUE
echo ========================================
echo.

:: Demander le message de commit
set /p MESSAGE="📝 Message du commit (ou appuyez sur Entrée pour 'Update'): "

:: Si pas de message, utiliser "Update" par défaut
if "%MESSAGE%"=="" set MESSAGE=Update

echo.
echo 📦 Ajout des fichiers...
git add -A

echo.
echo 💾 Commit en cours...
git commit -m "%MESSAGE%"

echo.
echo ☁️ Push vers GitHub...
git push

echo.
echo ========================================
echo    ✅ TERMINÉ !
echo ========================================
echo.
pause

