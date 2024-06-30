import { UUID } from "crypto";

export interface Device{
    id: UUID
    name: string
    type: string
    status: boolean
    settings?: any
}