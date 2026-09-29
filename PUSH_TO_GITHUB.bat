@echo off
title UIKEY LABS - GitHub One-Click Uploader (uikeylabs@gmail.com)
color 0B
cd /d "%~dp0"

echo =====================================================================
echo   UIKEY LABS - UPLOADING TO https://github.com/uikeylabs/uikeylabs-main
echo   Account Email: uikeylabs@gmail.com
echo =====================================================================
echo.

git config user.name "uikeylabs"
git config user.email "uikeylabs@gmail.com"
git config credential.helper manager
cmdkey /delete:git:https://github.com >nul 2>&1
cmdkey /delete:LegacyGeneric:target=git:https://github.com >nul 2>&1

git remote set-url origin https://github.com/uikeylabs/uikeylabs-main.git
git add .
git commit -m "Launch UIKEY LABS Website + Free Shop QR Portal + Supabase DB" >nul 2>&1
git branch -M main

echo [1/1] Opening GitHub Sign-In Window & Pushing 37 Files...
echo (Kripya khulne wale GitHub popup me 'Sign in with your browser' dabayein!)
echo.
git push -u origin main --force

echo.
echo =====================================================================
echo   DONE! Check: https://github.com/uikeylabs/uikeylabs-main
echo =====================================================================
pause
