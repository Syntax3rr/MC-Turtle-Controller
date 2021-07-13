local args = {...}
local serverURL = args[1] == nil and "localhost:8080" or args[1]
local turtleMovement = require("turtlePositionTrackingAPI.lua") 
local ws = nil

if(args[4] ~= nil) then
    print(args[2] .. " " .. args[3] .. " " .. args[4])
    turtleMovement.initializePosition(args[2], args[3], args[4])
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
--I would usually move this to a seperate file, but right now this is interdependant with this file.
local function getData()
    print("getting data...")
    ws.send(textutils.serializeJSON({ ["type"] = "position", ["pos"] = turtleMovement.position, ["dir"] = turtleMovement.heading })) 
    print("(x, y, z): (" .. turtleMovement.position.x .. ", " .. turtleMovement.position.y .. ", " .. turtleMovement.position.z .. ")")

    print("getting blocks...")
    local f, fBlock = turtle.inspect()
    local u, uBlock = turtle.inspectUp()
    local d, dBlock = turtle.inspectDown()

    ws.send(textutils.serialiseJSON({ ["type"] = "block", ["blockData"] = f and fBlock or f, ["pos"] = { ["x"] = turtleMovement.position.x + ((turtleMovement.heading == 1) and -1 or ((turtleMovement.heading == 3) and 1 or 0)), ["y"] = turtleMovement.position.y, ["z"] = turtleMovement.position.z + ((turtleMovement.heading == 0) and -1 or ((turtleMovement.heading == 2) and 1 or 0)) } }))
    ws.send(textutils.serialiseJSON({ ["type"] = "block", ["blockData"] = u and uBlock or u, ["pos"] = { ["x"] = turtleMovement.position.x, ["y"] = turtleMovement.position.y + 1, ["z"] = turtleMovement.position.z } }))
    ws.send(textutils.serialiseJSON({ ["type"] = "block", ["blockData"] = d and dBlock or d, ["pos"] = { ["x"] = turtleMovement.position.x, ["y"] = turtleMovement.position.y - 1, ["z"] = turtleMovement.position.z } }))
    
    ws.send(textutils.serializeJSON({ ["type"] = "readyForIncoming" }))
end

local function moveFwd()
    print("moving forward...")
    turtleMovement.forward()
    getData()
end

local function moveBack()
    print("moving backward...")
    turtleMovement.back()
    getData()
end

local function turnLeft()
    print("recieved command: turnLeft")
    turtleMovement.turnLeft()
    getData()
end

local function turnRight()
    print("recieved command: turnRight")
    turtleMovement.turnRight()
    getData()
end

local function moveUp()
    print("recieved command: moveUp")
    turtleMovement.up()
    getData()
end

local function moveDown()
    print("recieved command: moveDown")
    turtleMovement.down()
    getData()
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
                goto continue
            else 
                load(arg2)()
            end
        end
    elseif(event == "timer") then
        if(arg1 == timer) then
            print("Disconnected")
            ws.close()
            connect()
        end
    end
    ::continue::
end

ws.close()
