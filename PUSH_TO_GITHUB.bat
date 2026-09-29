@echo off
title UIKEY LABS - Sign Out Old GitHub Account & Push to uikeylabs
color 0E
cd /d "%~dp0"

echo =====================================================================
echo   STEP 1: SIGNING OUT OLD GITHUB ACCOUNT (uikeymahesh2025)
echo =====================================================================
git credential-manager github logout uikeymahesh2025 >nul 2>&1
cmdkey /delete:git:https://github.com >nul 2>&1
cmdkey /delete:LegacyGeneric:target=git:https://github.com >nul 2>&1

git config --global user.name "uikeylabs"
git config --global user.email "uikeylabs@gmail.com"
git config user.name "uikeylabs"
git config user.email "uikeylabs@gmail.com"
git config credential.https://github.com.useHttpPath true
git config credential.https://github.com.username uikeylabs
git remote set-url origin https://uikeylabs@github.com/uikeylabs/uikeylabs-main.git

echo.
echo =====================================================================
echo   STEP 2: COMMITTING NEW 'SIGN OUT' FEATURE IN index.html
echo =====================================================================
git add .
git commit -m "Add Merchant Sign Out (Logout) option + Supabase Cloud & Shop QR POS"

echo.
echo =====================================================================
echo   STEP 3: SIGN IN WITH 'uikeylabs@gmail.com' IN BROWSER & PUSH
echo =====================================================================
git credential-manager github login --web
git push -u origin main --force

echo.
echo =====================================================================
echo   DONE! Check https://github.com/uikeylabs/uikeylabs-main
echo =====================================================================
pause
