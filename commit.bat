@echo off
cd /d "C:\Users\vispera\Desktop\IA traitement audio"

REM Supprimer le fichier de verrouillage Git s'il existe
if exist ".git\index.lock" (
    echo Suppression du fichier de verrouillage Git...
    del /f /q ".git\index.lock"
)

REM Configurer Git pour ignorer les warnings de fin de ligne
git config core.autocrlf true
git config core.safecrlf false

REM Exécuter les commandes Git sans warnings
git add . 2>nul
git commit -m "updt" 2>nul
git push 2>nul

echo.
echo Commit et push termines!
pause

