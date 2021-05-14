serverURL = "ws://localhost:8080/"
x, y, z = gps.locate()
heading = 0 --0, 1, 2, 3 = +x, +z, -x, -z
--ws = http.websocket(serverURL, { ["authorization"] = "simpforshiki" })

function connect()
    print("Attempting to Establish Connection to Server")
    ws, err = http.websocket(serverURL, { ["authorization"] = "simpforshiki" })
    if not ws then
        printError(err)
        repeat
            retryAttempt = retryAttempt or 3
            retryAttempt = retryAttempt - 1
            print("Trying again in 3 seconds")
            sleep(3)
            connect()
        until(retryAttempt <= 0)
    else 
        print(ws.receive())
    end
end

parseCmd = {
    ["getPos"] = ws.send(textutils.serializeJSON({ ["type"] = "position", ["x"] = x, ["y"] = y, ["z"] = z, ["dir"] = heading })),
    ["getBlocks"] = function ()
        local x, y, z = gps.locate()
        local f, fBlock = turtle.inspect()
        local u, uBlock = turtle.inspectUp()
        local d, dBlock = turtle.inspectDown()
        if(f) then ws.send(textutils.serialiseJSON({ ["type"] = "blockID", ["blockID"] = fBlock.name(), ["x"] = x + ((heading == 0) and 1 or ((heading == 2) and -1 or 0)), ["y"] = y, ["z"] = z + ((heading == 1) and 1 or ((heading == 3) and -1 or 0)) })) end
        if(u) then ws.send(textutils.serialiseJSON({ ["type"] = "blockID", ["blockID"] = uBlock.name(), ["x"] = x, ["y"] = y + 1, ["z"] = z })) end
        if(d) then ws.send(textutils.serialiseJSON({ ["type"] = "blockID", ["blockID"] = dBlock.name(), ["x"] = x, ["y"] = y - 1, ["z"] = z })) end
    end
}

connect()
while(true) do
    local _, url, response = os.pullEvent("websocket_message")
    local decodedResponse = textutils.unserializeJSON(response)
    if(url == serverURL) then
        print(decodedResponse)
        if(decodedResponse.type == "cmd") then
            local _ = parseCmd[decodedResponse]
            goto continue
        end
        if(decodedResponse.type == "close") then
            break
        end
    end
    ::continue::
end

ws.close()
