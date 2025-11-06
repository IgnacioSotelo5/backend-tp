import { Test } from '@nestjs/testing';
import { DeviceFactory } from './device.factory';
import { Lamp } from './entities/lamp.entity';
import { Camera } from './entities/camera.entity';
import { Thermostat } from './entities/thermostat.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { CameraSettings } from './interfaces/camera-settings.interface';
import { ThermostatSettings } from './interfaces/thermostat-settings.interface';

describe('DeviceFactory', () => {
    let deviceFactory: DeviceFactory

    beforeEach(async () => {
    const module = await Test.createTestingModule({
        providers: [DeviceFactory],

    }).compile()

    deviceFactory = module.get<DeviceFactory>(DeviceFactory)
});

  it('should create a Lamp device', () => {
    const createDeviceDto: CreateDeviceDto = {
        id: null,
        name: 'Lamp 1',
        status: true,
        type: 'lamp',
        settings: {brightness: 50}
    }

    const lamp: Lamp = deviceFactory.createDevice(createDeviceDto.type, createDeviceDto)
    
    expect(lamp).toBeInstanceOf(Lamp)
    expect(lamp.name).toBe(createDeviceDto.name)
    expect(lamp.status).toBe(createDeviceDto.status)
    expect(lamp.type).toBe('lamp')
    
    expect(lamp.settings['brightness']).toBeDefined()
    
    expect(lamp).toEqual({
        ...createDeviceDto,
        id: expect.stringMatching(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/)
    })
});

  it('should create a Camera device', () => {
   const createDeviceDto: CreateDeviceDto = {
    id: null,
    name: 'Camera 1',
    status: true,
    type: 'camera',
    settings: {
        resolution: '1080p'
    } as CameraSettings
   }

    const camera = deviceFactory.createDevice(createDeviceDto.type, createDeviceDto)

    expect(camera).toBeInstanceOf(Camera)
    expect(camera.name).toBe(createDeviceDto.name)
    expect(camera.status).toBe(createDeviceDto.status)
    expect(camera.type).toBe(createDeviceDto.type)

    expect((camera as Camera).settings['resolution']).toBeDefined()

    expect(camera).toEqual({
        ...createDeviceDto,
        id: expect.stringMatching(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/)
    })
  });

  it('should create a Thermostat device', () => {
    const createDeviceDto: CreateDeviceDto ={
        id: null,
        name: 'Thermostat 1',
        type: 'thermostat',
        status: true,
        settings: {
            temperature: 22
        } as ThermostatSettings
    }

    const thermostat = deviceFactory.createDevice(createDeviceDto.type, createDeviceDto)

    expect(thermostat).toBeInstanceOf(Thermostat)
    expect(thermostat.name).toBe(createDeviceDto.name)
    expect(thermostat.type).toBe(createDeviceDto.type)
    expect(thermostat.status).toBe(createDeviceDto.status)

    expect((thermostat as Thermostat).settings['temperature']).toBeDefined()

    expect(thermostat).toEqual({
        ...createDeviceDto,
        id: expect.stringMatching(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/)
    })
  });

  it('should throw an error for unsupported device type', () => {
    const createDeviceDto: CreateDeviceDto ={
        id: null,
        name: 'Unsupported type',
        type: 'unsupported',
        status: true,
        settings: {}
    }

    expect(() => deviceFactory.createDevice(createDeviceDto.type, createDeviceDto)).toThrow(Error('Unsupported device type: unsupported'))
  });

});
