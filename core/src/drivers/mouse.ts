import I2C from 'pins/i2c'

type RegistoryKey =
  | 'POWER_ON'
  | 'POWER_OFF'
  | 'READ_ENCODER_L'
  | 'READ_ENCODER_R'
  | 'READ_SENSOR_L'
  | 'READ_SENSOR_FL'
  | 'READ_SENSOR_FR'
  | 'READ_SENSOR_R'
  | 'WRITE_MOTOR_V_L'
  | 'WRITE_MOTOR_V_R'
  | 'WHO_AM_I'
type EncoderPosition = 'LEFT' | 'RIGHT'
type SensorPosition = 'LEFT' | 'FRONT_LEFT' | 'FRONT_RIGHT' | 'RIGHT'
const DEFAULT_ADDRESS = 0x64 // June 4th is the Mouse Day
let flag = false

const REGISTORY: { [key in RegistoryKey]: number } = {
  POWER_ON: 0x00,
  POWER_OFF: 0x01,
  READ_ENCODER_L: 0x10,
  READ_ENCODER_R: 0x11,
  READ_SENSOR_L: 0x20,
  READ_SENSOR_FL: 0x21,
  READ_SENSOR_FR: 0x22,
  READ_SENSOR_R: 0x23,
  WRITE_MOTOR_V_L: 0x30,
  WRITE_MOTOR_V_R: 0x31,
  WHO_AM_I: 0x68
}

interface ConstructorParam extends I2C.ConstructorParam {
  /* TODO */
}

export default class Mouse {
  private i2c: I2C
  private u8a: Uint8Array
  constructor(param: ConstructorParam = { address: DEFAULT_ADDRESS }) {
    this.i2c = new I2C(param)
    this.u8a = new Uint8Array(40)
    this.initialize()
  }
  private readByte(register: number): number {
    const buf = this.u8a.buffer
    this.i2c.write(register)
    this.i2c.read(1, buf)
    return this.u8a[0]
  }
  private readWord(register: number, endian: boolean = true): number {
    const u8a = this.u8a
    this.i2c.write(register)
    this.i2c.read(2, u8a.buffer)
    return endian ? u8a[1] | (u8a[0] << 8) : u8a[0] | (u8a[1] << 8)
  }
  private readBlock(register: number, count: number) {
    this.i2c.write(register)
    this.i2c.read(count, this.u8a.buffer)
  }
  private writeByte(register: number, value: any): void {
    return this.i2c.write(register, value & 255)
  }
  private writeWord(register: number, value: any, endian: boolean = true): void {
    if (endian) {
      return this.i2c.write(register, (value >> 8) & 0xff, value & 0xff)
    } else {
      return this.i2c.write(register, value & 0xff, (value >> 8) & 0xff)
    }
  }
  private writeBlock(register: number, ...value: number[]): void {
    this.i2c.write(register, ...value)
  }
  public initialize(): void {
    /* TODO */
  }
  /**
   * reads encoder value (0-65535)
   * @param position encoder position (LEFT | RIGHT)
   */
  public readEncoder(position: EncoderPosition): number {
    switch (position) {
      case 'LEFT':
        return this.readWord(REGISTORY.READ_ENCODER_L)
      case 'RIGHT':
        return this.readWord(REGISTORY.READ_ENCODER_R)
      default:
        const _: never = position
        return -1
    }
  }
  /**
   * reads sensor value (0-65535)
   * @param position sensor position (LEFT | RIGHT | FRONT_LEFT | FRONT_RIGHT)
   */
  public readSensor(position: SensorPosition): number {
    switch (position) {
      case 'LEFT':
        return this.readWord(REGISTORY.READ_SENSOR_L)
      case 'FRONT_LEFT':
        return this.readWord(REGISTORY.READ_SENSOR_FL)
      case 'FRONT_RIGHT':
        return this.readWord(REGISTORY.READ_SENSOR_FR)
      case 'RIGHT':
        return this.readWord(REGISTORY.READ_SENSOR_R)
      default:
        const _: never = position
        return -1
    }
  }

  public whoami(flag: boolean): number {
    return this.readByte(REGISTORY.WHO_AM_I)
  }
}
