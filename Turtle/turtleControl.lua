args = {...}
serverURL = args[1] == nil and "localhost:8080" or args[1]
position = vector.new(gps.locate())
heading = 0 --0, 1, 2, 3 = -z, +x, +z, -x
--ws = http.websocket(serverURL, { ["authorization"] = "simpforshiki" })
function timeoutReset()
    if not (timer == nil) then os.cancelTimer(timer) end
    timer = os.startTimer(15)
end

function connect()
    print("Attempting to Establish Connection to Server")
    ws, err = http.websocket(serverURL, { ["authorization"] = "simpforshiki" })
    if not ws then
        printError(err)
        retryAttempt = retryAttempt or 3 
        retryAttempt = retryAttempt - 1
        if(retryAttempt == 0) then error("Cannot connect to server.") end    
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
connect();

parseCmd = {
    ["ping"] = function () print("recieved ping"); ws.send(textutils.serializeJSON({ ["type"] = "pong" })); timeoutReset(); ws.send(textutils.serializeJSON({ ["type"] = "readyForIncoming" }))  end,
    ["getPos"] = function ()
        print("recieved command: getPos")
        position = vector.new(gps.locate())
        ws.send(textutils.serializeJSON({ ["type"] = "position", ["pos"] = position, ["dir"] = heading })) 
        print(position)
        parseCmd["getBlocks"]()
    end,
    ["getBlocks"] = function ()
        print("recieved command: getBlocks")
        local f, fBlock = turtle.inspect()
        local u, uBlock = turtle.inspectUp()
        local d, dBlock = turtle.inspectDown()
        --Can we talk about lua ternary operators?
        ws.send(textutils.serialiseJSON({ ["type"] = "block", ["blockData"] = f and fblock or f, ["pos"] = { ["x"] = position.x + ((heading == 1) and 1 or ((heading == 3) and -1 or 0)), ["y"] = position.y, ["z"] = position.z + ((heading == 0) and -1 or ((heading == 2) and 1 or 0)) } }))
        ws.send(textutils.serialiseJSON({ ["type"] = "block", ["blockData"] = u and uBlock or u, ["pos"] = { ["x"] = position.x, ["y"] = position.y + 1, ["z"] = position.z } }))
        ws.send(textutils.serialiseJSON({ ["type"] = "block", ["blockData"] = d and dBlock or d, ["pos"] = { ["x"] = position.x, ["y"] = position.y - 1, ["z"] = position.z } }))
        
        ws.send(textutils.serializeJSON({ ["type"] = "readyForIncoming" }))
    end,
    ["moveFwd"] = function () print("recieved command: moveForward"); turtle.forward(); parseCmd["getPos"]() end,
    ["turnLeft"] = function () print("recieved command: turnLeft"); turtle.turnLeft(); heading = ((heading - 1) % 4 + 4) % 4; parseCmd["getPos"]() end,
    ["turnRight"] = function () print("recieved command: turnRight"); turtle.turnRight(); heading = ((heading + 1) % 4 + 4) % 4; parseCmd["getPos"]() end
}

while(true) do
    local event, arg1, arg2 = os.pullEvent()
    if(event == "websocket_message") then
        if(arg1 == serverURL) then
            print(arg2)
            local buff1 = parseCmd[arg2]
            if(buff1 == nil) then 
                local buff2 = loadstring(arg2)
                loadstring(arg2)()
                print(buff2)
            else 
                buff1()
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
