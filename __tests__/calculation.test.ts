import { calculate } from '../src/lib/calculation'
import { parseInputNumber } from '../src/lib/utils'
import { TaxFormUserInput } from '../src/types/TaxFormUserInput'
import { initTaxFormUserInputValues } from '../src/lib/initialValues'
import { sum } from '../src/lib/utils'

describe('#parse', () => {
  const inputs = [
    { input: null, output: 0 },
    { input: undefined, output: 0 },
    { input: '', output: 0 },
    { input: '0', output: 0 },
    { input: '10.521', output: 10.521 },
    { input: '5,3', output: 5.3 },
    { input: '2', output: 2 },
    { input: 'foo', output: Number.NaN },
  ]

  inputs.forEach(({ input, output }) => {
    it(`for "${input}" should return "${output}"`, () => {
      expect(parseInputNumber(input)).toBe(output)
    })
  })
})

describe('Basic use cases', () => {
  test('Case 1', () => {
    const input: TaxFormUserInput = {
      ...initTaxFormUserInputValues,
      t1r10_prijmy: '20000',
      meno_priezvisko: 'This is used only for autoform',
      r005_meno: 'Johnny',
      r004_priezvisko: 'Mike Bravo',
      r006_titul: 'Ing. / PhD.',
    }
    const result = calculate(input as TaxFormUserInput)
    expect(result.r080_zaklad_dane_celkovo.toNumber()).toBe(0)
    expect(result.r005_meno).toBe('Johnny')
    expect(result.r004_priezvisko).toBe('Mike Bravo')
    expect(result.r006_titul).toBe('Ing.')
    expect(result.r006_titul_za).toBe('PhD.')
  })
})

const child = {
  id: 0,
  priezviskoMeno: 'Johnny Bravo',
  rodneCislo: '150701 / 1234',
  kupelnaStarostlivost: true,
  wholeYear: false,
  monthFrom: '1',
  monthTo: '9',
}

const childUnder6 = { ...child, rodneCislo: '150701 / 1234' }
const childTurning6InFeb = { ...child, rodneCislo: '140201 / 1234' }
const childTurning6InJul = { ...child, rodneCislo: '140731 / 1234' }
const childOver6 = { ...child, rodneCislo: '100101 / 1234' }

describe('With child (for tax year 2020)', () => {
  test('should map child', () => {
    const result = calculate({
      ...initTaxFormUserInputValues,
      hasChildren: true,
      children: [child],
      t1r10_prijmy: '3480',
    })
    expect(result.r034[0].priezviskoMeno).toBe('Johnny Bravo')
    expect(result.r034[0].rodneCislo).toBe('1507011234')
    expect(result.r034[0].kupelnaStarostlivost).toBe(true)
    expect(result.r034[0].m00).toBe(false)
    expect(result.r034[0].m01).toBe(false)
    expect(result.r034[0].m02).toBe(true)
    expect(result.r034[0].m03).toBe(true)
    expect(result.r034[0].m04).toBe(true)
    expect(result.r034[0].m05).toBe(true)
    expect(result.r034[0].m06).toBe(true)
    expect(result.r034[0].m07).toBe(true)
    expect(result.r034[0].m08).toBe(true)
    expect(result.r034[0].m09).toBe(true)
    expect(result.r034[0].m10).toBe(true)
    expect(result.r034[0].m11).toBe(false)
    expect(result.r034[0].m12).toBe(false)
  })

  test('should map child with wholeYear', () => {
    const result = calculate({
      ...initTaxFormUserInputValues,
      hasChildren: true,
      children: [{ ...child, wholeYear: true, kupelnaStarostlivost: false }],
      t1r10_prijmy: '3480',
    })
    expect(result.r034[0].priezviskoMeno).toBe('Johnny Bravo')
    expect(result.r034[0].rodneCislo).toBe('1507011234')
    expect(result.r034[0].kupelnaStarostlivost).toBe(false)
    expect(result.r034[0].m00).toBe(true)
    expect(result.r034[0].m01).toBe(false)
    expect(result.r034[0].m02).toBe(false)
    expect(result.r034[0].m03).toBe(false)
    expect(result.r034[0].m04).toBe(false)
    expect(result.r034[0].m05).toBe(false)
    expect(result.r034[0].m06).toBe(false)
    expect(result.r034[0].m07).toBe(false)
    expect(result.r034[0].m08).toBe(false)
    expect(result.r034[0].m09).toBe(false)
    expect(result.r034[0].m10).toBe(false)
    expect(result.r034[0].m11).toBe(false)
    expect(result.r034[0].m12).toBe(false)
  })

  describe('children tax bonus (r117)', () => {
    test('Child under 6', () => {
      const result = calculate({
        ...initTaxFormUserInputValues,
        hasChildren: true,
        children: [childUnder6],
        t1r10_prijmy: '3480',
      })
      const monthSums = sum(
        45.44,
        45.44,
        45.44,
        45.44,
        45.44,
        45.44,
        45.44,
        45.44,
        45.44,
      ) // kazdy mesiac ked vek < 6 rokov

      expect(result.r117.eq(sum(monthSums))).toBeTruthy()
    })

    test('Child turning 6 in 2020 (february)', () => {
      const result = calculate({
        ...initTaxFormUserInputValues,
        hasChildren: true,
        children: [childTurning6InFeb],
        t1r10_prijmy: '3480',
      })

      const monthSums = sum(
        45.44,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
      )
      expect(result.r117.eq(sum(monthSums))).toBeTruthy()
    })

    test('Child turning 6 in 2020 (july)', () => {
      const result = calculate({
        ...initTaxFormUserInputValues,
        hasChildren: true,
        children: [childTurning6InJul],
        t1r10_prijmy: '3480',
      })

      const part1 = sum(45.44, 45.44, 45.44, 45.44, 45.44, 45.44) // februar - jul (vek do 6 rokov vratane mesiaca dovrsenia)
      const part2 = sum(22.72, 22.72, 22.72) // august - oktober (ved nad 6 rokov)
      expect(result.r117.eq(sum(part1, part2))).toBeTruthy()
    })

    test('Child over 6', () => {
      const result = calculate({
        ...initTaxFormUserInputValues,
        hasChildren: true,
        children: [childOver6],
        t1r10_prijmy: '3480',
      })

      const monthSums = sum(
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
      ) // vek nad 6 rokov vratane mesiaca dovrsenia
      expect(result.r117.eq(sum(monthSums))).toBeTruthy()
    })

    test('More children', () => {
      const result = calculate({
        ...initTaxFormUserInputValues,
        hasChildren: true,
        children: [
          { ...childOver6 },
          { ...childTurning6InFeb },
          { ...childTurning6InJul },
          { ...childUnder6 },
        ],
        t1r10_prijmy: '3480',
      })

      // childOver6
      const childOver6Sum = sum(
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
      )

      // childTurning6InFeb
      const childTurning6InFebSum = sum(
        45.44,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
        22.72,
      )

      // childTurning6InJul
      const childTurning6InJulSum = sum(
        45.44,
        45.44,
        45.44,
        45.44,
        45.44,
        45.44,
        22.72,
        22.72,
        22.72,
      ) // januar - jul (vek do 6 rokov vratane mesiaca dovrsenia)

      // childUnder6
      const childUnder6Sum = sum(
        45.44,
        45.44,
        45.44,
        45.44,
        45.44,
        45.44,
        45.44,
        45.44,
        45.44,
      )
      expect(
        result.r117.eq(
          sum(
            childOver6Sum,
            childTurning6InFebSum,
            childTurning6InJulSum,
            childUnder6Sum,
          ),
        ),
      ).toBeTruthy()
    })
  })
})
