import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { CreateDeviceDto } from './dto/create-device.dto'
import { UpdateDeviceDto } from './dto/update-device.dto'
import { existsSync, promises as fsPromises } from 'fs'
import { join } from 'path'
import { Device } from './entities/device.entity'
import { FileWriteException } from '../exceptions/file-write.exception'
import { ReadFileException } from '../exceptions/read-file.exception'
import { DeviceFactory } from './device.factory'

@Injectable()
export class DevicesService {
  private readonly filePath: string = join(
    process.cwd(),
    'data',
    'devices',
    'devices.json',
  )
  constructor(private readonly deviceFactory: DeviceFactory) {}

  async loadDevicesFromFile(): Promise<Device[]> {
    try {
      if (!existsSync(this.filePath)) {
        await this.saveToFile([])
        return []
      }
      const data = await fsPromises.readFile(this.filePath, {
        encoding: 'utf-8',
      })
      const devices = JSON.parse(data) as Device[]
      return devices
    } catch (error) {
      console.error('Error reading devices data')
      throw new ReadFileException('Error loading devices data.')
    }
  }

  async saveToFile(device: Device | Device[]): Promise<void> {
    try {
      await fsPromises.writeFile(this.filePath, JSON.stringify(device, null, 2))
    } catch (error) {
      console.error('Error saving devices file')
      throw new FileWriteException('Error saving devices data')
    }
  }

  async createDevice(deviceDTO: CreateDeviceDto): Promise<Device> {
    const devices: Device[] = await this.loadDevicesFromFile()
    try {
      const device = this.deviceFactory.createDevice(deviceDTO.type, deviceDTO)
      devices.push(device)
      this.saveToFile(devices)
      return device
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create device: ${error.message}`,
      )
    }
  }

  async findAll({
    name,
    type,
  }: {
    name?: string
    type?: string
  }): Promise<Device[] | { message: string }> {
    const devices: Device[] = await this.loadDevicesFromFile()
    if (name) {
      return devices.filter((d) =>
        d.name.toLowerCase().includes(name.toLowerCase()),
      )
    }
    if (type) {
      return devices.filter((d) => d.type.toLowerCase() === type.toLowerCase())
    }
    if (devices.length) return devices
    else return { message: 'There are no devices added yet.' }
  }

  async findOne(id: string): Promise<Device> {
    const devices = await this.loadDevicesFromFile()
    const device: Device = devices.find((d: Device) => d.id === id)
    if (device) {
      return device
    } else {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Device with ID ${id} not found.`,
      })
    }
  }

  async updateDevice(
    id: string,
    updateDeviceDto: UpdateDeviceDto,
  ): Promise<Device> {
    const devices = await this.loadDevicesFromFile()
    const deviceIndex = devices.findIndex((d: Device) => d.id === id)
    if (deviceIndex === -1) {
      throw new NotFoundException(`Device with ID ${id} not found`)
    }
    const updatedDevice = {
      ...devices[deviceIndex],
      ...updateDeviceDto,
    } as Device
    devices[deviceIndex] = updatedDevice
    await this.saveToFile(devices)
    return updatedDevice
  }

  async removeDevice(id: string): Promise<{ message: string }> {
    const devices = await this.loadDevicesFromFile()
    const deviceIndex = devices.findIndex((d: Device) => d.id === id)
    if (deviceIndex === -1) {
      throw new NotFoundException(`Device with ID ${id} not found.`)
    }
    devices.splice(deviceIndex, 1)
    await this.saveToFile(devices)
    return { message: `Device with ID ${id} was deleted successfully.` }
  }
}
