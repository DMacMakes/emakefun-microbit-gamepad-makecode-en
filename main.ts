enum EMF_Button {
    //% block="L"
    L_BUTTON = 2,
    //% block="R" 
    R_BUTTON = 1,
    //% block="JOYSTICK BUTTON LEFT"
    JOYSTICK_BUTTON_LEFT = 4,
    //% block="JOYSTICK BUTTON RIGHT" 
    JOYSTICK_BUTTON_RIGHT = 3,
}

enum Button_State {
    //% block="DOWN"
    JOYSTICK_PRESS_DOWN = 0,   //按下
    //% block="UP"
    JOYSTICK_PRESS_UP = 1,    //释放
    //% block="CLICK"
    SINGLE_CLICK = 3,     //单击
    //% block="DOUBLE_CLICK"
    DOUBLE_CLICK = 4,    //双击
    //% block="HOLD"
    LONG_PRESS_HOLD = 6,    //长按
    //% block="PRESS"
    NONE_PRESS = 8,      //未按
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
enum Stick_Direction{
    UP_LEFT=7, UP=8, UP_RIGHT=9,
    LEFT=4, NEUTRAL=5, RIGHT=6,
    DOWN_LEFT=1, DOWN=2, DOWN_RIGHT=3     
}


//% color="#FFA500" weight=10 icon="\uF11B" block="EMF Gamepad"
// try gamepad icon \u1F3AE
namespace EMF_Gamepad {
    const STICK_HOME = 128;
    const STICK_DEADZONE_HALF = 30;
    let poll_count = 0;
    let Stick_poll_interval = 10; //10ms aka 100 polls per second
    let stick_x_last = STICK_HOME;
    let stick_y_last = STICK_HOME;
    let stick_dir_x = Stick_Direction.NEUTRAL;
    let stick_dir_y = Stick_Direction.NEUTRAL;
    let stick_dir_x_last = Stick_Direction.NEUTRAL;
    let stick_dir_y_last = Stick_Direction.NEUTRAL;
    export let left_stick_direction:Stick_Direction = Stick_Direction.NEUTRAL;

    let i2cAddr: number
    let BK: number
    let RS: number
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

    function lcdcmd(d: number) {
        RS = 0
        set(d)
        set(d << 4)
    }

    function lcddat(d: number) {
        RS = 1
        set(d)
        set(d << 4)
    }

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cwrite1(addr: number, reg: number, value: number ,value1: string) {
        let lengths = value1.length
        let buf = pins.createBuffer(2+lengths)
        //let arr = value1.split('')
        buf[0] = reg 
        buf[1] = value
        let bytes_value = []
        bytes_value = stringToBytes(value1)
        for (let i = 0; i < bytes_value.length; i++) {
            buf[2+i] = bytes_value[i]
        }
        pins.i2cWriteBuffer(addr, buf)
    }
    
    function i2ccmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
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
    function Get_Button_Status (button : number){
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

   //% blockId=Button_status block="button %button status is %status"
   //% weight=74
   //% inlineInputMode=inline
   export function Button_status(button: EMF_Button , status: Button_State): boolean{
       if(Get_Button_Status(button) == status){
           return true;
       }
       return false;
    }
    

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

   //% blockId=Stop_vibrating block="stop vibrating" 
   //% weight=76
   //% inlineInputMode=inline
   export function Stop_vibrating (): void {
    let a = AnalogPin.P1;
    pins.analogWritePin( a , 0)
}

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

    //% blockId=Left_stick_direction block="get left stick direction"
    //% weight=80
    //% inlineInputMode=inline
    export function Get_left_stick_direction(): Stick_Direction
    {
        return (left_stick_direction);
    }

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

    //% draggableParameters="reporter"
    //% blockId=emfButton_onEvent block="on gamepad button |%button input |%event"
    //% inlineInputMode=inline
    //% weight=82
    export function onEMFButtonEvent(button: EMF_Button, event:Button_State, handler: Action) {
        control.onEvent(<number>button, <number>event, handler); // register handler
    }

    function check_stick_dir_x(): Stick_Direction
    {
        stick_dir_x = Stick_Direction.NEUTRAL;
        let stick_dir = Stick_Direction.NEUTRAL;
        let stick_x = Stick_position(Stick_Id.STICK_LEFT, Stick_Axis.STICK_X);

        // if real stick x value changed from stick x last value 
        if (stick_x != stick_x_last) {
            // Figure out if current x is left or neutral or right
            // with neutral being in the dead zone 
            if (stick_x < STICK_HOME - STICK_DEADZONE_HALF) {
                stick_dir_x = Stick_Direction.LEFT;
            } else if (stick_x > STICK_HOME + STICK_DEADZONE_HALF) {
                stick_dir_x = Stick_Direction.RIGHT;
            }
        }
        return(stick_dir_x);
    }

    function check_stick_dir_y(): Stick_Direction{
        stick_dir_y = Stick_Direction.NEUTRAL;
        //let stick_dir = Stick_Direction.NEUTRAL;
        let stick_y = Stick_position(Stick_Id.STICK_LEFT, Stick_Axis.STICK_Y);

        // if real stick x value changed from stick x last value 
        if (stick_y != stick_y_last) {
            // Figure out if current x is left or neutral or right
            // with neutral being in the dead zone 
            if (stick_y < STICK_HOME - STICK_DEADZONE_HALF) {
                stick_dir_y = Stick_Direction.DOWN;
            } else if (stick_y > STICK_HOME + STICK_DEADZONE_HALF) {
                stick_dir_y = Stick_Direction.UP;
            }
        }
        return (stick_dir_y);
    }

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

    //% blockId=Clear_leds block="clear LED display"
    //% weight=85
    //% inlineInputMode=inline
    export function clearLeds():void
    {
        //let i = 0;
        //let j = 0;
        for(let i=0; i<=4; i++)
        {
            for(let j=0; j<=4; j++)
            {
                led.unplot(i,j);
            }
        }
    }

    //% blockId=Show_stick_dir_on_leds block="show stick direction %direction on LEDs"
    //% weight=86
    //% inlineInputMode=inline
    export function showDirectionOnLeds(direction :Stick_Direction):void {
        // clear leds
        /* basic.showLeds(`
        . . . . .
        . . . . .
        . . . . .
        . . . . .
        . . . . .
        `); */
        clearLeds();
        let x = 2;
        let y = 2;
        // top row
        if (direction > 6) y = 0;
        // bottom row
        if (direction < 4 ) y = 4;
        // Left column
        if (direction == 7 || direction == 4 || direction == 1) x = 0;
        // Right column
        if (direction == 3 || direction == 6 || direction == 9) x = 4;
        led.plotBrightness(x, y, 255);
    }

    // Sample the left stick periodically, throw an event if it changes.
    control.inBackground(function(): void{
        showDirectionOnLeds(left_stick_direction);
        let last_L_status=Button_State.NONE_PRESS;
        while(true)
        {
            //if(poll_count % 50 == 0) // every 50 polls, or 500 ms
            //{
                let L_status = Get_Button_Status(EMF_Button.L_BUTTON);
                if(L_status != last_L_status && L_status != Button_State.NONE_PRESS)
                {
                    serial.writeLine("L button state:" + L_status);
                    last_L_status = L_status;
                }
            //}
            let dir_changed = false;
            //stick_dir_x = check_stick_dir_x();
            stick_dir_x = check_stick_dir_in_axis(Stick_Id.STICK_LEFT, Stick_Axis.STICK_X, stick_x_last);
            stick_dir_y = check_stick_dir_in_axis(Stick_Id.STICK_LEFT, Stick_Axis.STICK_Y, stick_y_last);
            //stick_dir_y = check_stick_dir_y();
            
            // Note any changed direction and remember the new position from
            // the next check.
            if(stick_dir_x != stick_dir_x_last)
            {
                dir_changed = true;
                stick_dir_x_last = stick_dir_x;
            }
            if (stick_dir_y != stick_dir_y_last) {
                dir_changed = true;
                stick_dir_y_last = stick_dir_y;            
            }

            // If either axis changed, combine them into a 9 position joystick direction
            // raise an event. Also show the new direction on the LEDs.
            if(dir_changed)
            {
                left_stick_direction = combine_stick_dirs(stick_dir_x, stick_dir_y);
                showDirectionOnLeds(left_stick_direction);
                control.raiseEvent(Stick_Id.STICK_LEFT, Stick_Event.CHANGED_DIR)
            }
            poll_count += 1;
            // Sleep this thread between checks of the stick and buttons, to avoid
            // overloading the CPU.
            pause(Stick_poll_interval);
        }
    })
   
}

