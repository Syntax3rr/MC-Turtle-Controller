local args = {...}
local serverURL = args[4] == nil and "localhost:8080" or args[4]
local turtleMovement = require("turtlePositionTrackingAPI") 
local ws = nil
local timer = nil

if(args[3] ~= nil) then
    print(args[1] .. " " .. args[2] .. " " .. args[3])
    turtleMovement.initializePosition(args[1], args[2], args[3])
end

--ws = http.websocket(serverURL, { ["authorization"] = "simpforshiki" })
local function timeoutReset()
    if (timer ~= nil) then os.cancelTimer(timer) end
    timer = os.startTimer(15)
end

local retryAttempt = 3
local function connect()
    print("Attempting to Establish Connection to Server")
    local err = nil
    ws, err = http.websocket(serverURL, { ["authorization"] = "simpforshiki" })
    if not ws then
        printError(err)
        retryAttempt = retryAttempt - 1
        if(retryAttempt <= 0) then error("Cannot connect to server.") end
        print(retryAttempt)
        print("Trying again in 5 seconds")
        sleep(5)
        connect()
    else 
        local buff = ws.receive()
        print(buff)
        timeoutReset()
    end
end

--Turtle Command Parser
--I would usually move this to a seperate file, but right now this is dependant on ws and turtleMovement from this file.
local commandParser = {}
function commandParser.getData()
    print("getting data...")
    ws.send(textutils.serializeJSON({ ["type"] = "position", ["pos"] = turtleMovement.getPosition(), ["dir"] = turtleMovement.getHeading() })) 
    print("(x, y, z): (" .. turtleMovement.getPosition().x .. ", " .. turtleMovement.getPosition().y .. ", " .. turtleMovement.getPosition().z .. ")")

    print("getting blocks...")
    local f, fBlock = turtle.inspect()
    local u, uBlock = turtle.inspectUp()
    local d, dBlock = turtle.inspectDown()

    ws.send(textutils.serialiseJSON({ ["type"] = "block", ["blockData"] = f and fBlock or f, ["pos"] = { ["x"] = turtleMovement.getPosition().x + ((turtleMovement.getHeading() == 1) and -1 or ((turtleMovement.getHeading() == 3) and 1 or 0)), ["y"] = turtleMovement.getPosition().y, ["z"] = turtleMovement.getPosition().z + ((turtleMovement.getHeading() == 0) and -1 or ((turtleMovement.getHeading() == 2) and 1 or 0)) } }))
    ws.send(textutils.serialiseJSON({ ["type"] = "block", ["blockData"] = u and uBlock or u, ["pos"] = { ["x"] = turtleMovement.getPosition().x, ["y"] = turtleMovement.getPosition().y + 1, ["z"] = turtleMovement.getPosition().z } }))
    ws.send(textutils.serialiseJSON({ ["type"] = "block", ["blockData"] = d and dBlock or d, ["pos"] = { ["x"] = turtleMovement.getPosition().x, ["y"] = turtleMovement.getPosition().y - 1, ["z"] = turtleMovement.getPosition().z } }))
    
    ws.send(textutils.serializeJSON({ ["type"] = "readyForIncoming" }))
end

function commandParser.moveFwd()
    print("moving forward...")
    turtleMovement.forward()
    commandParser.getData()
end

function commandParser.moveBack()
    print("moving backward...")
    turtleMovement.back()
    commandParser.getData()
end

function commandParser.turnLeft()
    print("recieved command: turnLeft")
    turtleMovement.turnLeft()
    commandParser.getData()
end

function commandParser.turnRight()
    print("recieved command: turnRight")
    turtleMovement.turnRight()
    commandParser.getData()
end

function commandParser.moveUp()
    print("recieved command: moveUp")
    turtleMovement.up()
    commandParser.getData()
end

function commandParser.moveDown()
    print("recieved command: moveDown")
    turtleMovement.down()
    commandParser.getData()
end



connect();
while(true) do
    local event, arg1, arg2 = os.pullEvent()
    if(event == "websocket_message") then
        if(arg1 == serverURL) then
            if(arg2 == "ping") then --Carve out exception for ping
                ws.send(textutils.serializeJSON({ ["type"] = "pong" }))
                timeoutReset()
                ws.send(textutils.serializeJSON({ ["type"] = "readyForIncoming" }))
            else 
				print(arg2)
                commandParser[arg2]()
            end
        end
    elseif(event == "timer") then
        if(arg1 == timer) then
            print("Disconnected")
            ws.close()
            connect()
        end
    end
end

ws.close()
