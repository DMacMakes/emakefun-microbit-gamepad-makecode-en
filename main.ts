enum EMF_Button {
    //% block="L"
    L_BUTTON = 2,
    //% block="R" 
    R_BUTTON = 1,
    //% block="JOYSTICK BUTTON LEFT"
    JOYSTICK_BUTTON_LEFT = 4,
    //% block="JOYSTICK BUTTON RIGHT" 
    JOYSTICK_BUTTON_RIGHT = 3
    //,
    /// % block="A",
    // A_BUTTON = 5,
    /// % block="B"
    // B_BUTTON = 6
}

enum Button_State {
    //% block="DOWN"
    DOWN = 0,   //按下
    //% block="UP"
    UP = 1,    //释放
    //% block="CLICK"
    SINGLE_CLICK = 3,     //单击
    //% block="DOUBLE_CLICK"
    DOUBLE_CLICK = 4,    //双击
    //% block="HOLD"
    LONG_PRESS_HOLD = 6,    //长按
    //% block="PRESS"
    NONE_PRESS = 8,      //未按
}

enum EMFButton_Event
{
  //% block="down"
  BUTTON_DOWN = 46,
  //% block="up"
  BUTTON_UP = 47
}

/**
 * Trigger Events Proposed by DFRobot gamer:bit Players.
 */
//%
enum Stick_Event {
    //% block="changed direction"
    CHANGED_DIR = 45,
}

enum Stick_Axis{
    //% block="X"
    STICK_X = 0,
    //% block="Y"
    STICK_Y = 1,
}

enum Stick_Id{
    //% block="LEFT"
    STICK_LEFT = 0,
    //% block="RIGHT"
    STICK_RIGHT = 1,
}

// Numeric annotation for 9 stick positions
// https://wiki.supercombo.gg/w/Help:Notation
// 7 8 9  (up left, up, up right)
// 4 5 6  (left, neutral, right)
// 1 2 3
enum Stick_Direction {
    UP_LEFT=7, UP=8, UP_RIGHT=9,
    LEFT=4, NEUTRAL=5, RIGHT=6,
    DOWN_LEFT=1, DOWN=2, DOWN_RIGHT=3     
}


//% color="#FFA500" weight=10 icon="\uF11B" block="EMF Gamepad"
// try gamepad icon \u1F3AE
namespace EMF_Gamepad {
    const STICK_HOME = 128; // Centre position of analogue stick as reported by
    const STICK_DEADZONE_HALF = 30; // Distance from center of analogue stick that is considered neutral
    const LEDS_MIDDLE = 2;  // position of middle LED on Micro:bits' 5x5 LED matrix
    let poll_count = 0;
    let controls_poll_interval = 10; //10ms aka 100 polls per second
    let stick_x_last = STICK_HOME;
    let stick_y_last = STICK_HOME;
    let stick_dir_x = Stick_Direction.NEUTRAL;
    let stick_dir_y = Stick_Direction.NEUTRAL;
    let stick_dir_x_last = Stick_Direction.NEUTRAL;
    let stick_dir_y_last = Stick_Direction.NEUTRAL;
    let left_stick_dir:Stick_Direction = Stick_Direction.NEUTRAL;

    let i2cAddr: number
    let BK: number
    let RS: number

    /**
     * Set register to value?
     */
    function setreg(d: number) {
        pins.i2cWriteNumber(i2cAddr, d, NumberFormat.Int8LE)
        basic.pause(1)
    }

    function set(d: number) {
        d = d & 0xF0
        d = d + BK + RS
        setreg(d)
        setreg(d + 4)
        setreg(d)
    }
    
    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }


    function stringToBytes (str : string) {      
        let ch = 0;
        let st = 0;
        let gm:number[]; 
        gm = [];
        for (let i = 0; i < str.length; i++ ) { 
            ch = str.charCodeAt(i);  
            st = 0 ;                 

           do {  
                st = ( ch & 0xFF );  
                ch = ch >> 8;   
                gm.push(st);        
            }    

            while ( ch );  
            
        }  
        return gm;  
    } 

    let JOYSTICK_I2C_ADDR = 0x5A;
    let JOYSTICK_LEFT_X_REG = 0x10;
    let JOYSTICK_LEFT_Y_REG = 0x11;
    let JOYSTICK_RIGHT_X_REG = 0x12;
    let JOYSTICK_RIGHT_Y_REG = 0x13;
  

    let L_BUTTON_REG = 0x22;
    let R_BUTTON_REG = 0x23;
    let JOYSTICK_BUTTON_RIGHT = 0x21;
    let JOYSTICK_BUTTON_LEFT = 0x20;
    let NONE_PRESS = 8;
    function ReadButtonState (button : number){
        switch(button) {
            case 1: 
                return i2cread(JOYSTICK_I2C_ADDR,R_BUTTON_REG);
            case 2: 
                return i2cread(JOYSTICK_I2C_ADDR, L_BUTTON_REG);
            case 3: 
                return i2cread(JOYSTICK_I2C_ADDR,JOYSTICK_BUTTON_RIGHT);
			case 4: 
				return i2cread(JOYSTICK_I2C_ADDR,JOYSTICK_BUTTON_LEFT);
            default:
                return 0xff;
        }
    }

   //% blockId=Button_status block="button %button state is %status"
   //% weight=74
   //% inlineInputMode=inline
   export function ButtonStateIs(button: EMF_Button , status: Button_State): boolean{
       if(ReadButtonState(button) == status){
           return true;
       }
       return false;
    }
    
   /**
    * Start the tactile feedback motor virating at the given intensity
    * @param intensity the intensity of the vibration between 0 and 255. eg: 128
    */
   //% blockId=Vibrate block="vibrate at intensity %intensity" 
   //% intensity.min=0 intensity.max=255
   //% weight=75
   //% inlineInputMode=inline
    export function Vibrate ( intensity: number): void {
        let a = AnalogPin.P1;
        pins.analogWritePin( a , pins.map(
			intensity,
			0,
			255,
			0,
			1023
			))
    }

    /**
     * Stop the tactile feedback motor vibrating. Helper/sugar function
     * that just calls Vibrate with an intensity of 0.
     */
   //% blockId=Stop_vibrating block="stop vibrating" 
   //% weight=76
   //% inlineInputMode=inline
   export function Stop_vibrating (): void {
    let a = AnalogPin.P1;
    pins.analogWritePin( a , 0)
}
    /**
     *  Read the position of the chosen analog stick in the chosen axis.
     * @param stick the Stick_Id (enum) to read the position of
     * @param axis the axis (horizontal/x or vertical/y) to read
     */
   //% blockId=Stick_position block="Position of %stick stick in %axis axis"
   //% weight=77
   //% inlineInputMode=inline
   export function Stick_position(stick: Stick_Id , axis: Stick_Axis): number{
       let val = 0;
       if(stick == 0){
           if(axis == 0){
               val = i2cread(JOYSTICK_I2C_ADDR,JOYSTICK_LEFT_X_REG);
           }else{
               val = i2cread(JOYSTICK_I2C_ADDR,JOYSTICK_LEFT_Y_REG);
           }
       }else{
           if(axis == 0){
               val = i2cread(JOYSTICK_I2C_ADDR,JOYSTICK_RIGHT_X_REG);
           }else{
               val = i2cread(JOYSTICK_I2C_ADDR,JOYSTICK_RIGHT_Y_REG);
           }
       }
       return val;
   }

    /**
     * Get the direction of a given analog stick in 9 position joystick format.
     */
    //% blockId=Left_stick_direction block="current direction of %stick stick"
    //% weight=80
    //% inlineInputMode=inline
    export function Stick_direction(stick:Stick_Id): Stick_Direction
    {
      // Currently only returns left stick dir
        return (left_stick_dir);
    }

    /**
     * Define a block that allows the user to listen for a stick's change
     * of direction and run some code.
     * @param stick the stick to listen to (left or right)
     * @param event the direction change event to listen for (up, down, left, right, neutral, defined in Stick_Direction)
     * @param handler code to run when the event is raised.
     */
    //% blockId=stick_onEvent block="on |%stick stick |%event"
    //% button.fieldEditor="gridpicker" stick.fieldOptions.columns=2
    //% event.fieldEditor="gridpicker" event.fieldOptions.columns=1
    //% weight=81
    export function onStickEvent(stick: Stick_Id, event: Stick_Event, handler: Action) {
        control.onEvent(<number>stick, <number>event, handler); // register handler
    }

    /**
     * Check a stick's digital direction in a given axis and return a value confirming to 
     * 9 direction joystic notation
     **/
    function check_stick_dir_in_axis(stick: Stick_Id, axis: Stick_Axis, last_pos:Number): Stick_Direction
    {
        let stick_dir = Stick_Direction.NEUTRAL;
        let stick_pos = Stick_position(stick, axis);

        // if real stick x value changed from stick x last value 
        if (stick_pos != last_pos) {
            // Figure out if current x is left or neutral or right
            // with neutral being in the dead zone 
            if (stick_pos < STICK_HOME - STICK_DEADZONE_HALF) {
                if(axis == Stick_Axis.STICK_X)
                {
                  stick_dir = Stick_Direction.LEFT;
                } else if (axis == Stick_Axis.STICK_Y)
                {
                  stick_dir = Stick_Direction.DOWN;
                }
            } else if (stick_pos > STICK_HOME + STICK_DEADZONE_HALF) {
                if(axis == Stick_Axis.STICK_X)
                {
                  stick_dir = Stick_Direction.RIGHT;
                } else if (axis == Stick_Axis.STICK_Y)
                {
                  stick_dir = Stick_Direction.UP;
                }
            }
        }
        return(stick_dir);
    }

    /**
     * Define a block that allows the user to specify a button and change of button state they want
     * to react to, then listen for that event to occur, e.g., button A is pressed, button B is released, etc.
     * @param button the button to be monitored
     * @param event the change in state of the button to be monitored
     * @param handler body code to run when the event is raised
     */
    //% draggableParameters="reporter"
    //% blockId=emfButton_onEvent block="on button |%button is |%event"
    //% inlineInputMode=inline
    //% weight=82
    export function onEMFButtonEvent(button: EMF_Button, event:EMFButton_Event, handler: Action) {
        control.onEvent(<number>button, <number>event, handler); // register handler
    }
    
    /**
     * Combine x and y axis directions into a single 9 position joystick direction. Get axis
     * directions with check_stick_dir_in_axis() function.
     * parameters:
     * stick_dir_x: x axis direction
     * stick_dir_y: y axis direction 
     */
    function combine_stick_dirs(stick_dir_x: Stick_Direction, stick_dir_y:Stick_Direction): Stick_Direction
    {
        let stick_dir = Stick_Direction.NEUTRAL;
        if(stick_dir_x == Stick_Direction.NEUTRAL)
        {
            return(stick_dir_y);
        } else if (stick_dir_y == Stick_Direction.NEUTRAL)
        {
            return(stick_dir_x);
        } else 
        {
            // It has to be a combo direction..
            // if x is left it has to be left up or left down
            if(stick_dir_x == Stick_Direction.LEFT)
            {
                if (stick_dir_y == Stick_Direction.UP)
                {
                    return(Stick_Direction.UP_LEFT);
                } else
                {
                    return(Stick_Direction.DOWN_LEFT);
                }
            } else
            {  // must be right
                if (stick_dir_y == Stick_Direction.UP) {
                    return (Stick_Direction.UP_RIGHT);
                } else {
                    return (Stick_Direction.DOWN_RIGHT);
                }
            }
        }
        return(stick_dir);
    }

    /**
     * Blank the LED display, prior to writing a new pattern.
     */
    //% blockId=Clear_leds block="clear LED display"
    //% weight=85
    //% inlineInputMode=inline
    export function clearLeds():void
    {
        for(let i=0; i<=4; i++)
        {
            for(let j=0; j<=4; j++)
            {
                led.unplot(i,j);
            }
        }
    }

    /**
     * Illuminate a single LED on the Micro:bit display corresponding to the direction
     * provided (usually from an analog stick).
     * @param direction the direction to illuminate the LED (UP, DOWN, LEFT, RIGHT, etc 
     * defined in Stick_Direction enum)
     */
    //% blockId=Show_stick_dir_on_leds block="show stick direction %direction on LEDs"
    //% weight=86
    //% inlineInputMode=inline
    export function showDirectionOnLeds(direction :Stick_Direction):void {
        clearLeds();
        let x = LEDS_MIDDLE;
        let y = LEDS_MIDDLE;
        // top row
        if (direction >= Stick_Direction.UP_LEFT) y = 0;                // top row
        if (direction <= Stick_Direction.DOWN_RIGHT ) y = 4;           // bottom row
        if (direction == 7 || direction == 4 || direction == 1) x = 0; // Left column
        if (direction == 3 || direction == 6 || direction == 9) x = 4; // Right column
        led.plotBrightness(x, y, 255);                                 // Set the led to full brightness
    }

    // Sample the left stick periodically, throw an event if it changes.
    control.inBackground(function(): void{
        showDirectionOnLeds(left_stick_dir);
        // last_button_states is an array of 6 Button_States, one for the last state of each button,
        let last_button_states:Button_State[] = [Button_State.NONE_PRESS, Button_State.NONE_PRESS, Button_State.NONE_PRESS, Button_State.NONE_PRESS, Button_State.NONE_PRESS, Button_State.NONE_PRESS];

        while(true)
        {
            let L_state = ReadButtonState(EMF_Button.L_BUTTON);
            if(L_state != last_button_states[EMF_Button.L_BUTTON] && L_state != Button_State.NONE_PRESS)
            {
                serial.writeLine("(extension) L button state:" + L_state);
                if(L_state == Button_State.DOWN)
                {
                    serial.writeLine("(extension) raising left button down event")
                    control.raiseEvent(EMF_Button.L_BUTTON, EMFButton_Event.BUTTON_DOWN);
                } else if (L_state == Button_State.UP)
                {
                    serial.writeLine("(extension) raising left button up event")
                    control.raiseEvent(EMF_Button.L_BUTTON, EMFButton_Event.BUTTON_UP);
                }
                last_button_states[EMF_Button.L_BUTTON] = L_state;
            }
            let dir_changed = false;
            //stick_dir_x = check_stick_dir_x();
            stick_dir_x = check_stick_dir_in_axis(Stick_Id.STICK_LEFT, Stick_Axis.STICK_X, stick_x_last);
            stick_dir_y = check_stick_dir_in_axis(Stick_Id.STICK_LEFT, Stick_Axis.STICK_Y, stick_y_last);
            
            // Note any changed direction and remember the new position from the next check.
            if(stick_dir_x != stick_dir_x_last || stick_dir_y != stick_dir_y_last)
            {
                dir_changed = true;
            }
              
            // If either axis changed, combine them into a 9 position joystick direction
            // raise an event. Also show the new direction on the LEDs.
            if(dir_changed)
            {
              left_stick_dir = combine_stick_dirs(stick_dir_x, stick_dir_y);
              showDirectionOnLeds(left_stick_dir);
              control.raiseEvent(Stick_Id.STICK_LEFT, Stick_Event.CHANGED_DIR)
              stick_dir_x_last = stick_dir_x;
              stick_dir_y_last = stick_dir_y;
            }
            //poll_count += 1;
            // Sleep this thread between checks of the stick and buttons, to avoid
            // overloading the CPU.
            pause(controls_poll_interval);
        }
    })
   
}

