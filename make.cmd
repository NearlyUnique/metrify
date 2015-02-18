@echo off
if exist main.exe (
echo Deleting old
	del main.exe
)
echo Building ...
go build main.go
if exist main.exe (
	echo Running ...
	main.exe
)
