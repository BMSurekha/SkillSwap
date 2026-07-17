# PowerShell Auto-Git Watcher Script for SkillSwap
# This script monitors your folder and automatically commits & pushes changes to GitHub whenever files are modified.
#
# To run this script:
# 1. Make sure you have added your GitHub remote repository (git remote add origin ...)
# 2. Run: .\git-autopush.ps1

Write-Host "Starting Git Auto-Push Watcher..." -ForegroundColor Green
Write-Host "Monitoring folder: $PSScriptRoot" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the watcher." -ForegroundColor Yellow

# Initialize file system watcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $PSScriptRoot
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Define what events to watch (ignores git metadata and builds automatically via .gitignore)
$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    
    # Ignore git internals and build target folders
    if ($path -match '\\.git\\' -or $path -match '\\target\\' -or $path -match '\\node_modules\\') {
        return
    }

    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Change detected: $changeType on $path" -ForegroundColor Green
    Write-Host "Staging changes..." -ForegroundColor DarkGray
    git add .
    
    # Commit changes
    $commitMsg = "Auto-update: Modify file on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host "Committing with message: '$commitMsg'" -ForegroundColor Gray
    git commit -m $commitMsg
    
    # Push to remote branch
    Write-Host "Pushing changes to GitHub..." -ForegroundColor Cyan
    git push origin main
    
    Write-Host "Done! Watching for next change..." -ForegroundColor Green
}

# Bind events
Register-ObjectEvent $watcher "Changed" -Action $action
Register-ObjectEvent $watcher "Created" -Action $action
Register-ObjectEvent $watcher "Deleted" -Action $action
Register-ObjectEvent $watcher "Renamed" -Action $action

# Loop infinitely to keep script running
while ($true) {
    Start-Sleep -Seconds 1
}
