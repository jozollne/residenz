export interface Feature {
  id: number
  label_de: string
  label_en: string
  icon: string
}

export interface Room {
  id: number
  name: string
  description: string | null
  description_en: string | null
  price: string | number
  isActive: boolean
  isUnderConstruction: boolean
  minStay: number
  images: string[]
  features: Feature[]
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Booking {
  id: number
  roomId: number
  room?: Room
  startDate: string
  endDate: string
  firstName: string
  lastName: string
  email: string
  company: string | null
  vatId: string | null
  billingAddress: string
  status: BookingStatus
  acceptedAgbs: boolean
  message: string | null
  createdAt: string
}

export interface OccupiedRange {
  startDate: string
  endDate: string
}
