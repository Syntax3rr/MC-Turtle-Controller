--The Position Tracking API is 
--Made by Syntax3rr

local initialized = false
local position = nil
local heading = 0 --0 (North, -z), 1 (West, -x), 2 (South +z), 3 (East, +x)
local autoRefuel = true

TurtleMovement = {}

function TurtleMovement.initializePosition(x, y, z)
    position = vector.new(x, y, z)
    initialized = true
end

function TurtleMovement.setHeading(dir)
    heading = dir
end

function TurtleMovement.getPosition()
    return position
end

function TurtleMovement.getHeading()
    return heading
end

function TurtleMovement.isInitialized()
    return initialized
end

function TurtleMovement.turnLeft()
    turtle.turnLeft()
    heading = ((heading + 1) + 4) % 4
end

function TurtleMovement.turnRight()
    turtle.turnRight()
    heading = ((heading - 1) % 4)
end

function TurtleMovement.forward()
    local didMove, reason = turtle.forward()
    if(initialized) then
        if(didMove) then
            if(heading == 0) then
                position.z = position.z - 1
            elseif(heading == 1) then
                position.x = position.x - 1
            elseif(heading == 2) then
                position.z = position.z + 1
            elseif(heading == 3) then
                position.x = position.x + 1
            end
        else
            print("turtlePositionTrackingAPI.forward(): " .. reason)
            if(reason == "Out of fuel" and autoRefuel) then
                turtle.refuel()
                TurtleMovement.forward()
            end
        end
    else 
        print("turtlePositionTrackingAPI.forward(): Error, Uninitialized")
    end
end

function TurtleMovement.back()
    local didMove, reason = turtle.back()
    if(initialized) then
        if(didMove) then
            if(heading == 0) then
                position.z = position.z + 1
            elseif(heading == 1) then
                position.x = position.x + 1
            elseif(heading == 2) then
                position.z = position.z - 1
            elseif(heading == 3) then
                position.x = position.x - 1
            end
        else
            print("turtlePositionTrackingAPI.forward(): " .. reason)
            if(reason == "Out of fuel" and autoRefuel) then
                turtle.refuel()
                TurtleMovement.back()
            end
        end
    else 
        print("turtlePositionTrackingAPI.back(): Error, Uninitialized")
    end
end

function TurtleMovement.up()
    local didMove, reason = turtle.up()
    if(initialized) then
        if(didMove) then
            position.y = position.y + 1
        else
            print("turtlePositionTrackingAPI.forward(): " .. reason)
            if(reason == "Out of fuel" and autoRefuel) then
                turtle.refuel()
                TurtleMovement.up()
            end
        end
    else 
        print("turtlePositionTrackingAPI.up(): Error, Uninitialized")
    end
end
    
function TurtleMovement.down()
    local didMove, reason = turtle.down()
    if(initialized) then
        if(didMove) then
            position.y = position.y + 1
        else
            print("turtlePositionTrackingAPI.forward(): " .. reason)
        end
    else
        print("turtlePositionTrackingAPI.down(): Error, Uninitialized")
        if(reason == "Out of fuel" and autoRefuel) then
            turtle.refuel()
            TurtleMovement.down()
        end
    end
end

return TurtleMovement
