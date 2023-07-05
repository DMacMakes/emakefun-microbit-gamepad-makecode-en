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


//% color="#FFA500" weight=10 icon="\uf2c9" block="Joystick:bit"
// try gamepad icon \u1F3AE
namespace EMF_Gamepad {
    
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
        let betys = []
        betys = stringToBytes(value1)
        for (let i = 0; i < betys.length; i++) {
            buf[2+i] = betys[i]
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

   /**
    * Dual Stick Controller
    */
   //% blockId=Button_status block="button state: button %button status %status" group="Dual Stick Controller"
   //% weight=74
   //% subcategory="Dual Stick Controller"
   //% inlineInputMode=inline
   export function Button_status(button: EMF_Button , status: Button_State): boolean{
       if(Get_Button_Status(button) == status){
           return true;
       }
       return false;
    }


    /**
    * Dual Stick Controller
    */
   //% blockId=Gamepad_shock block="gamepad shock: vibration %shock"  group="Dual Stick Controller"
   //% shock.min=0 shock.max=255
   //% weight=75
   //% subcategory="Dual Stick Controller"
   //% inlineInputMode=inline
    export function Gamepad_shock( shock: number): void {
        let a = AnalogPin.P1;
        pins.analogWritePin( a , pins.map(
			shock,
			0,
			255,
			0,
			1023
			))
    }

    /**
    * Dual Stick Controller
    */
   //% blockId=Stick_position block="stick position: stick %stick axis %axial" group="Dual Stick Controller"
   //% weight=76
   //% subcategory="Dual Stick Controller"
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
}

