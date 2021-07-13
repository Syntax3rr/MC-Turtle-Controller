--The Position Tracking API is 
--Made by Syntax3rr

initialized = false
position = nil
heading = 0 --0 (North, -z), 1 (West, -x), 2 (South +z), 3 (East, +x)

function initializePosition(x, y, z)
    position = vector.new(x, y, z)
    initialized = true
end

function setHeading(dir)
    heading = dir
end

function turnLeft()
    turtle.turnLeft()
    heading = ((heading - 1) + 4) % 4
end

function turnRight()
    turtle.turnRight()
    heading = ((heading + 1) % 4)
end

function forward()
    local didMove = turtle.forward()
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
            if(turtle.detect()) then
                print("turtlePositionTrackingAPI.forward(): Movement failed due to obstructed path")
            else
                print("turtlePositionTrackingAPI.forward(): Movement failed for unknown reason")
            end
        end
    else 
        print("turtlePositionTrackingAPI.forward(): Error, Uninitialized")
    end
end

function back()
    local didMove = turtle.back()
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
            turtle.turnLeft()
            turtle.turnLeft()
            if(turtle.detect()) then
                print("turtlePositionTrackingAPI.back(): Movement failed due to obstructed path")
            else
                print("turtlePositionTrackingAPI.back(): Movement failed for unknown reason")
            end
            turtle.turnLeft()
            turtle.turnLeft()
        end
    else 
        print("turtlePositionTrackingAPI.back(): Error, Uninitialized")
    end
end

function up()
    local didMove = turtle.up()
    if(initialized) then
        if(didMove) then
            position.y = position.y + 1
        else
            if(turtle.detectUp()) then
                print("turtlePositionTrackingAPI.up(): Movement failed due to obstructed path")
            else
                print("turtlePositionTrackingAPI.up(): Movement failed for unknown reason")
            end
        end
    else 
        print("turtlePositionTrackingAPI.up(): Error, Uninitialized")
    end
end
    
function down()
    local didMove = turtle.down()
    if(initialized) then
        if(didMove) then
            position.y = position.y + 1
        else
            if(turtle.detectDown()) then
                print("turtlePositionTrackingAPI.down(): Movement failed due to obstructed path")
            else
                print("turtlePositionTrackingAPI.down(): Movement failed for unknown reason")
            end
        end
    else
        print("turtlePositionTrackingAPI.down(): Error, Uninitialized")
    end
end