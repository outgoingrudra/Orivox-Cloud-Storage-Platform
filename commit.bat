@echo off
setlocal

set /p msg="Enter commit message: "

if "%msg%"=="" (
    echo Commit message cannot be empty.
    pause
    exit /b 1
)

git add .
git commit -m "%msg%"
git push -u origin main

pause