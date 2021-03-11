import { TaxFormUserInput } from './TaxFormUserInput'
import { PostponeUserInput } from './PostponeUserInput'

export interface EmailUserInput {
  email?: string
  newsletter?: boolean
}

export type UserInput = TaxFormUserInput & PostponeUserInput & EmailUserInput
