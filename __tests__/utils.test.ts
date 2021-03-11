import {
  floorDecimal,
  ceilDecimal,
  parseStreetAndNumber,
} from '../src/lib/utils'
import {
  sortObjectKeys,
  formatCurrency,
  setDate,
  formatDate,
  numberInputRegexp,
  formatPsc,
  formatIco,
  translit,
  formatRodneCislo,
  validateRodneCislo,
  formatIban,
  validateIbanFormat,
  validateIbanCountry,
  getRodneCisloAgeAtYearAndMonth,
  parseFullName,
  boolToString,
  decimalToString,
  roundDecimal,
} from '../src/lib/utils'
import * as methods from '../src/lib/utils'
import Decimal from 'decimal.js'

describe('utils', () => {
  describe('#sortObjectKeys', () => {
    it('should sort object by key', () => {
      expect(sortObjectKeys({ c: 1, '2': 2, b: 3, a: 4, '1': 5 })).toEqual({
        '1': 5,
        '2': 2,
        a: 4,
        b: 3,
        c: 1,
      })
    })
  })

  describe('#setDate', () => {
    it('should set date property to object', () => {
      const date = new Date(2018, 1, 3)
      expect(setDate({ children: true }, date)).toEqual({
        children: true,
        datum: '03.02.2018',
      })
    })
  })
  describe('#formatDate', () => {
    it('should format date case 1', () => {
      const date = new Date(2018, 1, 3)
      expect(formatDate(date)).toBe('03.02.2018')
    })
    it('should format date case 2', () => {
      const date = new Date(2020, 10, 22)
      expect(formatDate(date)).toBe('22.11.2020')
    })
  })

  describe('#formatCurrency', () => {
    const scenarios = [
      { input: 1234.564, output: '1 234,56 EUR' },
      { input: 123.455, output: '123,46 EUR' },
      { input: 1000000, output: '1 000 000,00 EUR' },
    ]

    scenarios.forEach(({ input, output }) => {
      it(`should format ${input} to ${output}`, () => {
        expect(formatCurrency(input)).toBe(output)
      })
    })
  })

  describe('numberInputRegexp', () => {
    describe('for valid values', () => {
      const validInputs = ['0', '10', '120,3', '120,34', '120.3', '120.34']

      validInputs.forEach((value) => {
        it(`should return true for ${value}`, () => {
          expect(new RegExp(numberInputRegexp).test(value)).toBe(true)
        })
      })
    })

    describe('for invalid values', () => {
      const invalidInputs = [
        '120,345',
        ',2',
        ',',
        '120.345',
        '.2',
        '.',
        '1,',
        '1.',
        'abc',
        '-5',
        '-15.20',
      ]

      invalidInputs.forEach((value) => {
        it(`should return false for ${value}`, () => {
          expect(new RegExp(numberInputRegexp).test(value)).toBe(false)
        })
      })
    })
  })

  describe('#formatPsc', () => {
    it('should add space after first 3 digits', () => {
      expect(formatPsc('84104', '')).toBe('841 04')
    })

    it('should remove last number and space when using backspace', () => {
      expect(formatPsc('841', '841 ')).toBe('84')
    })
  })

  describe('#formatIco', () => {
    it('should add space after first 2 digits', () => {
      expect(formatIco('12', '')).toBe('12 ')
    })

    it('should add space after next 3 digits', () => {
      expect(formatIco('12345678', '')).toBe('12 345 678')
    })

    it('should remove last number and space when using backspace after first space', () => {
      expect(formatIco('12', '12 ')).toBe('1')
    })

    it('should remove last number and space when using backspace after second space', () => {
      expect(formatIco('12 345', '12 345 ')).toBe('12 34')
    })
  })

  describe('#translit', () => {
    it('should replace accented characters', () => {
      expect(translit('ľščťžýáíéúäôň-qwe123')).toBe('lsctzyaieuaon-qwe123')
    })
  })

  describe('#formatRodneCislo', () => {
    it('should add slash (with spaces) after first 6 digits', () => {
      expect(formatRodneCislo('801010', '')).toBe('801010 / ')
    })

    it('should remove last number and slash (with spaces) when using backspace after slash (with spaces)', () => {
      expect(formatRodneCislo('801010 /', '801010 / ')).toBe('80101')
    })
  })

  describe('#validateRodneCislo', () => {
    describe('for valid values', () => {
      const validInputs = [
        '111111 / 111',
        '110124 / 041',
        '110124 / 0415',
        '110124 / 0426',
      ]

      validInputs.forEach((value) => {
        it(`should return true for value "${value}"`, () => {
          expect(validateRodneCislo(value)).toBe(true)
        })
      })
    })

    describe('for invalid values', () => {
      const validInputs = [
        '950215453',
        '9502154530',
        '950215/4530',
        '950215 4530',
        '950215 / 453',
        '110124 / 0422',
        '521111 / 1114',
        '950215 / 45301',
      ]

      validInputs.forEach((value) => {
        it(`should return false for value "${value}"`, () => {
          expect(validateRodneCislo(value)).toBe(false)
        })
      })
    })
  })

  describe('#getRodneCisloAgeAtYearAndMonth', () => {
    const year = 2020
    const month = 5
    const inputs = [
      { rc: '8007011234', age: 39, year, month },
      { rc: '8006181234', age: 39, year, month },
      { rc: '8005311234', age: 40, year, month },
      { rc: '8057011234', age: 39, year, month },
      { rc: '8056191234', age: 39, year, month },
      { rc: '8055311234', age: 40, year, month },
      { rc: '0527171234', age: 14, year, month },
      { rc: '0526181234', age: 14, year, month },
      { rc: '0522171234', age: 15, year, month },
    ]

    inputs.forEach(({ rc, age, year, month }) => {
      it(`should return age "${age}" for value "${rc}"`, () => {
        expect(getRodneCisloAgeAtYearAndMonth(rc, year, month)).toBe(age)
      })
    })
  })

  describe('#formatIban', () => {
    describe('should add space after every 4 characters', () => {
      expect(formatIban('SK6807200002891987426353')).toBe(
        'SK68 0720 0002 8919 8742 6353',
      )
    })

    describe('should allow non-numberic characters only in prefix', () => {
      expect(formatIban('XX11YY33ZZ44ABCD1234-2-2-2-2 Q_W/E.R 12345678')).toBe(
        'XX11 3344 1234 2222 1234 5678',
      )
    })

    describe('should remove last number and space when using backspace', () => {
      expect(formatIban('SK68 ', 'SK68 7')).toBe('SK68')
    })
  })

  describe('#validateIbanFormat', () => {
    describe('for valid values', () => {
      const validInputs = [
        'SK6807200002891987426353',
        ' SK68 0720 0002   8919 8742 6353 ',
        'CZ65 0800 0000 1920 0014 5399',
        'DE89 3704 0044 0532 0130 00',
      ]

      validInputs.forEach((value) => {
        it(`should return true for value "${value}"`, () => {
          expect(validateIbanFormat(value)).toBe(true)
        })
      })
    })

    describe('for invalid values', () => {
      const validInputs = [
        'SK680720000289198742635',
        '6807200002891987426353',
        'SK6807200002891987426350',
        '1987426353/0720',
        '19874263530720',
      ]

      validInputs.forEach((value) => {
        it(`should return false for value "${value}"`, () => {
          expect(validateIbanFormat(value)).toBe(false)
        })
      })
    })
  })

  describe('#validateIbanCountry', () => {
    describe('for valid values', () => {
      const validInputs = [
        'SK6807200002891987426353',
        ' SK68 0720 0002   8919 8742 6353 ',
      ]

      validInputs.forEach((value) => {
        it(`should return true for value "${value}"`, () => {
          expect(validateIbanCountry(value)).toBe(true)
        })
      })
    })

    describe('for invalid values', () => {
      const validInputs = [
        'CZ65 0800 0000 1920 0014 5399',
        'DE89370400440532013000',
      ]

      validInputs.forEach((value) => {
        it(`should return false for value "${value}"`, () => {
          expect(validateIbanCountry(value)).toBe(false)
        })
      })
    })
  })

  describe('#parseFullName', () => {
    const inputs = [
      { input: 'Ján Novák', first: 'Ján', last: 'Novák', title: '' },
      { input: 'Ing. Ján Novák', first: 'Ján', last: 'Novák', title: 'Ing.' },
      {
        input: 'Ing. Mgr. Ján Novák',
        first: 'Ján',
        last: 'Novák',
        title: 'Ing. Mgr.',
      },
      {
        input: 'Ing. Ján Novák PhD.',
        first: 'Ján',
        last: 'Novák',
        title: 'Ing. / PhD.',
      },
      {
        input: 'Ing. Ján Novák PhD., Phd.',
        first: 'Ján',
        last: 'Novák',
        title: 'Ing. / PhD., Phd.',
      },
      {
        input: 'PhDR. Jana Nováková Zelená PhD.',
        first: 'Jana',
        last: 'Nováková Zelená',
        title: 'PhDR. / PhD.',
      },
      {
        input: 'Ing. Ján Novák - FOOBAR',
        first: 'Ján',
        last: 'Novák - FOOBAR',
        title: 'Ing.',
      },
      {
        input: 'Ing. Ján Novák PhD. - FOOBAR',
        first: 'Ján',
        last: 'Novák - FOOBAR',
        title: 'Ing. / PhD.',
      },
    ]

    inputs.forEach(({ input, first, last, title }) => {
      it(`should correctly parse "${input}"`, () => {
        expect(parseFullName(input)).toStrictEqual({ first, last, title })
      })
    })
  })
  describe('#floorDecimal', () => {
    describe('for valid values', () => {
      const validInputs = [
        {
          input: new Decimal(916.487),
          output: new Decimal(916.48),
        },
        {
          input: new Decimal(99.654),
          output: new Decimal(99.65),
        },
      ]

      validInputs.forEach(({ input, output }) => {
        it(`should floor "${input}" to "${output}"`, () => {
          expect(floorDecimal(input).equals(output)).toBeTruthy()
        })
      })
    })
  })
  describe('#ceilDecimal', () => {
    describe('for valid values', () => {
      const validInputs = [
        {
          input: new Decimal(2864.094),
          output: new Decimal(2864.1),
        },
        {
          input: new Decimal(2864.444),
          output: new Decimal(2864.45),
        },
        {
          input: new Decimal(2864.099),
          output: new Decimal(2864.1),
        },
      ]

      validInputs.forEach(({ input, output }) => {
        it(`should floor "${input}" to "${output}"`, () => {
          expect(ceilDecimal(input).toNumber()).toEqual(output.toNumber())
        })
      })
    })
  })
  describe('#parseStreetAndNumber', () => {
    const scenarios = [
      { input: '  A. Bernoláka 6 ', output: ['A. Bernoláka', '6'] },
      { input: 'Hrušková 10009/44A', output: ['Hrušková', '10009/44A'] },
      { input: 'Ševčenkova 902/25', output: ['Ševčenkova', '902/25'] },
      { input: 'Bošániho 7', output: ['Bošániho', '7'] },
      { input: 'Ulica bez čísla ', output: ['Ulica bez čísla', ''] },
    ]

    scenarios.forEach(({ input, output }) => {
      it(`should return "${output}" for "${input}"`, () => {
        expect(parseStreetAndNumber(input)).toEqual(output)
      })
    })
  })
  describe('#boolToString', () => {
    it('should return 1', () => {
      expect(boolToString(true)).toBe('1')
    })

    it('should return 0', () => {
      expect(boolToString(false)).toBe('0')
    })
  })

  describe('#decimalToString', () => {
    it('should return empty string for zero', () => {
      expect(decimalToString(new Decimal(0))).toBe('')
    })

    it('should return rounded number to 2 decimals', () => {
      const roundSpy = jest.spyOn(methods, 'roundDecimal')
      const input = new Decimal(3)
      decimalToString(input)
      expect(roundSpy).toHaveBeenCalledWith(input)
    })
  })

  describe('#roundDecimal', () => {
    const scenarios = [
      { input: new Decimal(123.45), output: '123.45' },
      { input: new Decimal(123.4509), output: '123.45' },
      { input: new Decimal(123.451), output: '123.45' },
      { input: new Decimal(123.454), output: '123.45' },
      { input: new Decimal(123.455), output: '123.46' },
      { input: new Decimal(123.454449), output: '123.46' },
      { input: new Decimal(123.459), output: '123.46' },
      { input: new Decimal(123.46), output: '123.46' },
      { input: new Decimal(123.461), output: '123.46' },
      { input: new Decimal(123.464), output: '123.46' },
      { input: new Decimal(123.465), output: '123.47' },
      { input: new Decimal(123.466), output: '123.47' },
      { input: new Decimal(123.469), output: '123.47' },
    ]

    scenarios.forEach(({ input, output }) => {
      it(`should round ${input} to ${output}`, () => {
        expect(roundDecimal(new Decimal(123.455))).toBe('123.46')
      })
    })

    it('should roundDecimal to 2 decimal places by default', () => {
      expect(roundDecimal(new Decimal(10))).toBe('10.00')
    })

    it('should roundDecimal to 0 decimal places', () => {
      expect(roundDecimal(new Decimal(10.9), 0)).toBe('11')
    })
  })
})
