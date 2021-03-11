import { rodnecislo } from 'rodnecislo'
import IBAN from 'iban'
import Decimal from 'decimal.js'

export const sortObjectKeys = (object: object) => {
  const ordered = {}
  Object.keys(object)
    .sort()
    .forEach((key) => {
      ordered[key] = object[key]
    })
  return ordered
}

export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

/** TODO HACK IMPORTANT to workaround old eform we need to set date before
original deadline. When the new eform is released and before going public we
need to set the current date
*/
export const setDate = <T>(input: T, date: Date = new Date()) => {
  return {
    ...input,
    datum: formatDate(date),
  }
}

export const formatCurrency = (value: number): string => {
  const findPlaceForThousandsDivider = /\B(?=(\d{3})+(?!\d))/g
  const roundNumber = roundDecimal(new Decimal(value || 0))
  const formattedNumber = roundNumber
    .replace(findPlaceForThousandsDivider, ' ')
    .replace('.', ',')
  return `${formattedNumber} EUR`
}

export const numberInputRegexp = '^[0-9]+([,\\.][0-9]{1,2})?$'

export const formatPsc = (newValue: string, previousValue = '') => {
  const formattedNewValue = newValue.replace(/\D/g, '')
  // when deleting space using backspace, delete both space and the number before it
  if (`${newValue} ` === previousValue) {
    return formattedNewValue.slice(0, -1)
  }

  // add space after first 3 digits
  return formattedNewValue.replace(/^(\d{3})/, '$1 ')
}

export const formatIco = (newValue: string, previousValue = '') => {
  const formattedNewValue = newValue.replace(/\D/g, '')
  // when deleting space using backspace, delete both space and the number before it
  if (`${newValue} ` === previousValue) {
    return newValue.slice(0, -1)
  } else if (formattedNewValue.length < 5) {
    // add one space after first 2 digits
    return formattedNewValue.replace(/^(\d{2})/, '$1 ')
  } else {
    // add one space after next 3
    return formattedNewValue.replace(/^(\d{2})\s*(\d{3})/, '$1 $2 ')
  }
}

export const translit = (value: string) => {
  return value.normalize('NFD').replace(/[\u0300-\u036F]/g, '')
}

export const formatRodneCislo = (newValue: string, previousValue = '') => {
  const formattedNewValue = newValue.replace(/\D/g, '')
  if (`${newValue} ` === previousValue) {
    return newValue.slice(0, -3)
  } else {
    return formattedNewValue.replace(/^(\d{6})/, '$1 / ')
  }
}

export const validateRodneCislo = (value: string): boolean => {
  return (
    /^\d{6} \/ \d{3,4}$/.test(value) &&
    rodnecislo(value.replace(' / ', '')).isValid()
  )
}
// logic from https://github.com/kub1x/rodnecislo
export const getRodneCisloAgeAtYearAndMonth = (
  rodneCislo: string,
  year: number,
  month: number,
): number => {
  const rc = rodnecislo(rodneCislo)

  const date = new Date(year, month, 1)
  const dateYear = date.getFullYear()
  const dateMonth = date.getMonth()
  // const dateDay = date.getDate()

  var age = dateYear - rc.year()

  if (dateMonth > rc.month()) {
    return age
  }

  if (dateMonth <= rc.month()) {
    return age - 1 // if birthday is on this month, return age - 1
  }

  return age
}

export const formatIban = (newValue: string, previousValue = '') => {
  const prefix = newValue.trim().slice(0, 2)
  const number = newValue.trim().slice(2).replace(/\D/g, '')
  const formattedNewValue = `${prefix}${number}`
  if (`${newValue} ` === previousValue) {
    return newValue.slice(0, -2)
  } else {
    return IBAN.printFormat(formattedNewValue)
  }
}

export const validateIbanFormat = (value: string): boolean => {
  return IBAN.isValid(value.replace(/\s/g, ''))
}

export const validateIbanCountry = (value: string): boolean => {
  return /^sk/i.test(value.trim())
}

export interface ParsedName {
  first: string
  last: string
  title: string
}

export const parseFullName = (value: string): ParsedName => {
  const parts = value.split(' ').map((v) => v.trim())

  let firstName
  const lastNames = []
  const titles = []
  parts.forEach((value) => {
    const isTitle = /\.,?$/.test(value)
    if (isTitle) {
      if (firstName && titles.length > 0 && !titles.includes('/')) {
        titles.push('/')
      }
      titles.push(value)
    } else if (!firstName) {
      firstName = value
    } else {
      lastNames.push(value)
    }
  })

  return {
    first: firstName,
    last: lastNames.join(' '),
    title: titles.join(' '),
  }
}

/**  https://podpora.financnasprava.sk/840887-Zaokr%C3%BAh%C4%BEovanie-platieb-zo-a-do-%C5%A1t%C3%A1tneho-rozpo%C4%8Dtu
 */
export const floorDecimal = (decimal: Decimal) => {
  return decimal.toDecimalPlaces(2, Decimal.ROUND_FLOOR)
}
export const ceilDecimal = (decimal: Decimal) => {
  return decimal.toDecimalPlaces(2, Decimal.ROUND_CEIL)
}

export const sum = (...numbers): Decimal =>
  numbers.reduce((sum, current) => sum.add(current), new Decimal(0))

export function parseInputNumber(input: string): number {
  const cleanedInput = !input || input === '' ? '0' : input.replace(',', '.')
  return Number(cleanedInput)
}

export const parseStreetAndNumber = (streetAndNumber) => {
  const parsedStreet = streetAndNumber
    .trim()
    .match(/^(.*)\s([\d+/]+[A-Za-z]?)$/)

  const street = parsedStreet ? parsedStreet[1] : streetAndNumber.trim()
  const number = parsedStreet ? parsedStreet[2] : ''

  return [street, number]
}

export const percentage = (base, percent) => {
  return floorDecimal(base.div(100).times(percent))
}

export const boolToString = (bool: boolean) => {
  return bool ? '1' : '0'
}

export const decimalToString = (decimal: Decimal) => {
  return decimal.equals(0) ? '' : roundDecimal(decimal)
}

export const roundDecimal = (input: Decimal, decimals = 2): string => {
  return input.toFixed(decimals)
}
