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
    let stick_x_last = STICK_HOME;
    let stick_y_last = STICK_HOME;
    let stick_dir_x = Stick_Direction.NEUTRAL;
    let stick_dir_y = Stick_Direction.NEUTRAL;
    let stick_dir_x_prev = Stick_Direction.NEUTRAL;
    let stick_dir_y_prev = Stick_Direction.NEUTRAL;
    //% block="left stick direction"
    //% blockId=Left_stick_direction block="left stick direction"
   //% weight=78
   //% inlineInputMode=inline
    let left_stick_direction:Stick_Direction = Stick_Direction.NEUTRAL;
    let Stick_poll_interval = 10; //10ms aka 100 polls per second

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
    let STICK_DEADZONE_HALF=10;
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

   /**
    * Dual Stick Controller
    */
   //% blockId=Button_status block="button %button status is %status"
   //% weight=74
   //% inlineInputMode=inline
   export function Button_status(button: EMF_Button , status: Button_State): boolean{
       if(Get_Button_Status(button) == status){
           return true;
       }
       return false;
    }

    /*
    // draggableParameters="reporter"
    // blockId=OnGamedpadButtonPressed block="on gamepad button $button pressed"
    // weight=80
    // inlineInputMode=inline
    export function onGamepadButtonPress(button:EMF_Button, handler: () => void): void {

      // button was pressed
      if(handler) 
      {
        handler()
      }
    }
    */

    /**
    * Dual Stick Controller
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
    * Dual Stick Controller
    */
   //% blockId=Stop_vibrating block="stop vibrating" 
   //% weight=76
   //% inlineInputMode=inline
   export function Stop_vibrating (): void {
    let a = AnalogPin.P1;
    pins.analogWritePin( a , 0)
}

    /**
    * Dual Stick Controller
    */
   //% blockId=Stick_position block="Position of %stick stick in %axis axis"
   //% weight=77
   //% inlineInputMode=inline
   export function Stick_position(stick: Stick_Id , axis: Stick_Axis){
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

   // TODO: Add a stick_direction function that returns a Stick_Direction


    /**
     * Registers code to run when a DFRobot gamer:bit event is detected.
     */
    //% weight=80
    //% blockGap=50
    //% blockId=stick_onEvent block="on |%stick stick |%event"
    //% button.fieldEditor="gridpicker" stick.fieldOptions.columns=2
    //% event.fieldEditor="gridpicker" event.fieldOptions.columns=1
    export function onEvent(stick: Stick_Id, event: Stick_Event, handler: Action) {
        control.onEvent(<number>stick, <number>event, handler); // register handler
    }

    //basic.forever(function(){
    control.inBackground(function(){
        while(true)
        {
            stick_dir_x = Stick_Direction.NEUTRAL;
            let stick_dir = Stick_Direction.NEUTRAL;
            let stick_x = Stick_position(Stick_Id.STICK_LEFT, Stick_Axis.STICK_X);

            // if real stick x value changed from stick x last value 
            if(stick_x != stick_x_last){
                // Figure out if current x is left or neutral or right
                // with neutral being in the dead zone 
                if (stick_x < STICK_HOME - STICK_DEADZONE_HALF)
                {
                    stick_dir_x = Stick_Direction.LEFT;
                } else if(stick_x > STICK_HOME + STICK_DEADZONE_HALF)
                {
                    stick_dir_x = Stick_Direction.RIGHT;
                }
            }
            // New direction for stick (in x)
            if(stick_dir_x != stick_dir_x_prev)
            {
                // Aaayye it's time to let the world know
                serial.writeLine("New stick_dir_x: " + stick_dir_x)
                left_stick_direction = stick_dir_x;
                control.raiseEvent(Stick_Id.STICK_LEFT, Stick_Event.CHANGED_DIR)
                stick_dir_x_prev = stick_dir_x; // remember the direction
            }

            pause(Stick_poll_interval);
        }
    })
   
}

