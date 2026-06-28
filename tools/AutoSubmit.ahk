#Persistent
#SingleInstance force
SetTitleMatchMode, 2
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%

intervalMs := 30000
testMode := true
maxSends := 20
count := 0
enabled := false
nextSendTime := 0
logFile := A_ScriptDir "\AutoSubmit.log"

Gui, Add, Text, vStatusText w300, Status: stopped
Gui, Add, Text, vModeText w300, Mode: test
Gui, Add, Text, vTimerText w300, Next send in: -- sec
Gui, Add, Progress, vProgressBar w300 h20 Range0-100 cBlue
Gui, Add, Text, vProgressText w300, Progress: 0%%
Gui, Add, Text, vCountText w300, Sent: 0/%maxSends%
Gui, +AlwaysOnTop +ToolWindow
Gui, Show, x10 y10 w320 h150, AutoSubmit Status
SetTimer, UpdateGUI, 250

F8::
enabled := !enabled
if enabled {
    if (count >= maxSends) {
        count := 0
    }
    nextSendTime := A_TickCount + intervalMs
    SetTimer, SendDot, %intervalMs%
    SetTimer, CountdownTick, 1000
    Log("Started; testMode=" testMode " maxSends=" maxSends " intervalMs=" intervalMs)
    UpdateStatus("running")
    TrayTip, AutoSubmit, Running (%count%/%maxSends%), 2000
} else {
    SetTimer, SendDot, Off
    SetTimer, CountdownTick, Off
    Log("Paused")
    UpdateStatus("paused")
    TrayTip, AutoSubmit, Paused, 2000
}
return

F9::
enabled := false
SetTimer, SendDot, Off
SetTimer, CountdownTick, Off
count := 0
nextSendTime := 0
UpdateStatus("stopped")
UpdateGUI()
Log("Stopped and reset")
TrayTip, AutoSubmit, Stopped and reset, 2000
return

SendDot:
if (!enabled)
    return

if (count >= maxSends) {
    enabled := false
    SetTimer, SendDot, Off
    SetTimer, CountdownTick, Off
    nextSendTime := 0
    UpdateStatus("completed")
    Log("Reached max sends: " count)
    return
}

if (testMode) {
    count++
    nextSendTime := A_TickCount + intervalMs
    Log("Test mode tick: " intervalMs/1000 " seconds until next send")
    UpdateStatus("running")
    return
}

if WinActive("ahk_exe Code.exe") {
    SendInput, Autohotkey says .
    Sleep, 100
    SendInput, {Enter}
    count++
    nextSendTime := A_TickCount + intervalMs
    Log("Sent dot " count "/" maxSends)
    UpdateStatus("running")
} else {
    Log("Skipped send: Code.exe is not active")
}
return

CountdownTick:
if (!enabled)
    return
remainingMs := nextSendTime - A_TickCount
if (remainingMs < 0)
    remainingMs := 0
remaining := Ceil(remainingMs / 1000)
Log(remaining " seconds to go")
return

UpdateGUI() {
    remaining := "--"
    percent := 0
    if (enabled && nextSendTime > 0) {
        remainingMs := nextSendTime - A_TickCount
        if (remainingMs < 0)
            remainingMs := 0
        remaining := Ceil(remainingMs / 1000)
        percent := 100 - (remainingMs * 100 / intervalMs)
        if (percent < 0)
            percent := 0
        if (percent > 100)
            percent := 100
    }
    GuiControl,, TimerText, % "Next send in: " remaining " sec"
    GuiControl,, StatusText, % "Status: " (enabled ? "running" : "stopped")
    GuiControl,, ProgressBar, %percent%
    GuiControl,, ProgressText, % "Progress: " percent "%%"
    GuiControl,, CountText, % "Sent: " count "/" maxSends
}

UpdateStatus(status) {
    GuiControl,, StatusText, % "Status: " status
}

Log(message) {
    FormatTime, ts, A_Now, yyyy-MM-dd HH:mm:ss
    FileAppend, %ts% - %message%`n, %logFile%
}
