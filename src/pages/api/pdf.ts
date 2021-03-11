import { NextApiRequest, NextApiResponse } from 'next'
import hummus from 'hummus'
import streams from 'memory-streams'
import { TaxForm } from '../../types/TaxForm'
import { TaxFormUserInput } from '../../types/TaxFormUserInput'
import { roundDecimal, setDate } from '../../lib/utils'
import { calculate } from '../../lib/calculation'
import Decimal from 'decimal.js'

const FIRST_COLUMN = 31.5
const BOX_WIDTH = 14.4
const PDF_ASSETS_PATH = `${process.cwd()}/src/pdf-assets`

const mapStateToShortcut = (state: string): string => {
  switch (state) {
    case 'Slovensko':
    case 'Slovenská republika':
      return 'SR'
    case 'Česko':
    case 'Česká republika':
      return 'ČR'
    default:
      return state
  }
}

class PdfTemplate {
  pdfWriter: any
  pageModifier: any
  fontOptions = {
    font: null,
    size: 12,
    colorspace: 'gray',
    color: 0x00,
  }
  currentPage: number
  dic: string
  writer = new streams.WritableStream()

  constructor(res?: NextApiResponse) {
    this.pdfWriter = hummus.createWriterToModify(
      new hummus.PDFRStreamForFile(`${PDF_ASSETS_PATH}/template2019.pdf`),
      res
        ? new hummus.PDFStreamForResponse(res)
        : new hummus.PDFStreamForResponse(this.writer),
    )
    this.fontOptions.font = this.pdfWriter.getFontForFile(
      `${PDF_ASSETS_PATH}/Work_Sans/WorkSans-Light.ttf`,
    )
  }

  openPage(pageNumber) {
    this.currentPage = pageNumber
    this.pageModifier = new hummus.PDFPageModifier(this.pdfWriter, pageNumber)
  }

  writeToBoxes(
    x: number,
    y: number,
    text: string = '',
    maxLength: number = 999,
  ) {
    const context = this.pageModifier.startContext().getContext()

    for (let i = 0; i < Math.min(maxLength, text.length); i += 1) {
      const letter = text[i]

      const { width } = this.fontOptions.font.calculateTextDimensions(
        letter,
        this.fontOptions.size,
      )

      const offset = x + i * BOX_WIDTH + (12 - width) / 2
      context.writeText(letter, offset, y, this.fontOptions)
    }
  }

  writeNumberToBoxes(x: number, y: number, number: number, smallGap = false) {
    const [whole, decimal] = number
      ? `${roundDecimal(new Decimal(number))}`.split('.')
      : ['', '']
    const gap = smallGap ? 9 : 15
    this.writeToBoxes(x - whole.length * BOX_WIDTH, y, whole)
    this.writeToBoxes(x + gap, y, decimal)
  }

  write(x: number, y: number, text: string = '', size?: number) {
    this.pageModifier
      .startContext()
      .getContext()
      .writeText(
        text,
        x,
        y,
        size ? { ...this.fontOptions, size } : this.fontOptions,
      )
  }

  writeDate(x: number, y: number, date = new Date()) {
    const day = `0${date.getDate()}`.slice(-2)
    const month = `0${date.getMonth() + 1}`.slice(-2)
    const year = `0${date.getFullYear()}`.slice(-2)
    this.writeToBoxes(x, y, day)
    this.writeToBoxes(x + 36, y, month)
    this.writeToBoxes(x + 99, y, year)
  }

  nextPage() {
    this.currentPage += 1
    if (this.currentPage > 0) {
      this.commitPage()
    }
    this.openPage(this.currentPage)

    if (this.dic) {
      this.writeToBoxes(FIRST_COLUMN + 216, 800, this.dic)
    }
  }

  commitPage() {
    this.pageModifier.endContext().writePage()
  }

  end() {
    this.pdfWriter.end()
  }
}

export const buildPdf = (form: TaxForm, res?: NextApiResponse) => {
  const tpl = new PdfTemplate(res)
  tpl.dic = form.r001_dic ? `${form.r001_dic}` : ''

  // ***** PAGE 1
  tpl.openPage(0)

  // r001_dic
  tpl.writeToBoxes(FIRST_COLUMN, 682, tpl.dic)

  // Druh daňového priznania - daňové priznanie
  tpl.write(FIRST_COLUMN + 248, 685, 'x')

  // rok
  tpl.writeToBoxes(FIRST_COLUMN + 487, 690, '19')

  // r003_nace
  const nace = `${form.r003_nace}`.match(/^(\d+) - (.*)$/)
  const naceOne = nace ? nace[1].slice(0, 2) : ''
  const naceTwo = nace ? nace[1].slice(2, 4) : ''
  const naceThree = nace ? nace[1].slice(4) : ''

  tpl.writeToBoxes(FIRST_COLUMN, 608, naceOne)
  tpl.writeToBoxes(FIRST_COLUMN + 37, 608, naceTwo)
  tpl.writeToBoxes(FIRST_COLUMN + 72, 608, naceThree)

  tpl.write(FIRST_COLUMN + 146, 612, nace ? nace[2] : '')

  // r004_priezvisko
  tpl.writeToBoxes(FIRST_COLUMN, 548, form.r004_priezvisko, 16)

  // r005_meno
  tpl.writeToBoxes(FIRST_COLUMN + 237, 548, form.r005_meno, 11)

  // r006_titul
  tpl.write(FIRST_COLUMN + 410, 548, form.r006_titul, 11)

  // r006_titul_za
  tpl.write(FIRST_COLUMN + 490, 548, form.r006_titul_za, 11)

  // r007_ulica
  tpl.writeToBoxes(FIRST_COLUMN, 502, form.r007_ulica, 28)

  // r008_cislo
  tpl.writeToBoxes(FIRST_COLUMN + 418, 502, form.r008_cislo, 8)

  // r009_psc
  tpl.writeToBoxes(FIRST_COLUMN, 466, form.r009_psc)

  // r010_obec
  tpl.writeToBoxes(FIRST_COLUMN + 79, 466, form.r010_obec, 20)

  // r011_stat
  tpl.writeToBoxes(
    FIRST_COLUMN + 375,
    466,
    mapStateToShortcut(form.r011_stat),
    11,
  )

  // ***** PAGE 2
  tpl.nextPage()

  if (form.r032_uplatnujem_na_partnera || form.r033_partner_kupele) {
    // r031_priezvisko_a_meno
    tpl.write(FIRST_COLUMN + 10, 563, form.r031_priezvisko_a_meno)

    // r031_rodne_cislo
    const rodneCislo = `${form.r031_rodne_cislo}`.match(/(\d{6})\/?(\d{4})/)
    tpl.writeToBoxes(FIRST_COLUMN + 374, 563, rodneCislo ? rodneCislo[1] : '')
    tpl.writeToBoxes(FIRST_COLUMN + 473, 563, rodneCislo ? rodneCislo[2] : '')
  }

  if (form.r032_uplatnujem_na_partnera) {
    // r032_uplatnujem_na_partnera
    tpl.write(FIRST_COLUMN + 25, 540, 'x')

    // r032_partner_vlastne_prijmy
    tpl.writeNumberToBoxes(
      FIRST_COLUMN + 404,
      538,
      form.r032_partner_vlastne_prijmy.toNumber(),
    )

    // r032_partner_pocet_mesiacov
    tpl.writeToBoxes(
      FIRST_COLUMN + 502,
      538,
      `${form.r032_partner_pocet_mesiacov}`.padStart(2, ' '),
    )
  }

  if (form.r033_partner_kupele) {
    // r033_partner_kupele
    tpl.write(FIRST_COLUMN + 25, 515, 'x')

    // r033_partner_kupele_uhrady
    tpl.writeNumberToBoxes(
      FIRST_COLUMN + 487,
      513,
      form.r033_partner_kupele_uhrady.toNumber(),
    )
  }

  // r034 - deti
  if (form.r034) {
    form.r034.slice(0, 4).forEach((child, index) => {
      const rowSize = index * 29

      // priezviskoMeno
      tpl.write(FIRST_COLUMN + 4, 432 - rowSize, child.priezviskoMeno, 10)

      // rodneCislo
      const rodneCislo = `${child.rodneCislo}`.match(/(\d{6})\/?(\d{4})/)
      tpl.writeToBoxes(
        FIRST_COLUMN + 134,
        432 - rowSize,
        rodneCislo ? rodneCislo[1] : '',
      )
      tpl.writeToBoxes(
        FIRST_COLUMN + 234,
        432 - rowSize,
        rodneCislo ? rodneCislo[2] : '',
      )

      if (child.kupelnaStarostlivost) {
        // kupelnaStarostlivost
        tpl.write(FIRST_COLUMN + 302, 429 - rowSize, 'x')
      }

      // m00
      if (child.m00) {
        tpl.write(FIRST_COLUMN + 324, 429 - rowSize, 'x')
      } else {
        // m01
        if (child.m01) {
          tpl.write(FIRST_COLUMN + 347, 429 - rowSize, 'x')
        }

        // m02
        if (child.m02) {
          tpl.write(FIRST_COLUMN + 362, 429 - rowSize, 'x')
        }

        // m03
        if (child.m03) {
          tpl.write(FIRST_COLUMN + 378, 429 - rowSize, 'x')
        }

        // m04
        if (child.m04) {
          tpl.write(FIRST_COLUMN + 394, 429 - rowSize, 'x')
        }

        // m05
        if (child.m05) {
          tpl.write(FIRST_COLUMN + 410, 429 - rowSize, 'x')
        }

        // m06
        if (child.m06) {
          tpl.write(FIRST_COLUMN + 426, 429 - rowSize, 'x')
        }

        // m07
        if (child.m07) {
          tpl.write(FIRST_COLUMN + 442, 429 - rowSize, 'x')
        }

        // m08
        if (child.m08) {
          tpl.write(FIRST_COLUMN + 458, 429 - rowSize, 'x')
        }

        // m09
        if (child.m09) {
          tpl.write(FIRST_COLUMN + 473, 429 - rowSize, 'x')
        }

        // m10
        if (child.m10) {
          tpl.write(FIRST_COLUMN + 490, 429 - rowSize, 'x')
        }

        // m11
        if (child.m11) {
          tpl.write(FIRST_COLUMN + 505, 429 - rowSize, 'x')
        }

        // m12
        if (child.m12) {
          tpl.write(FIRST_COLUMN + 521, 429 - rowSize, 'x')
        }
      }
    })
  }

  // r034 - viac ako 4 deti?
  if (form.r034 && form.r034.length > 4) {
    tpl.write(FIRST_COLUMN + 25, 324, 'x')
  }

  if (form.r034 && form.r034.some((child) => child.kupelnaStarostlivost)) {
    // r036_deti_kupele
    tpl.writeNumberToBoxes(
      FIRST_COLUMN + 396,
      303,
      form.r036_deti_kupele.toNumber(),
    )
  }

  if (form.r037_uplatnuje_uroky) {
    // r037_uplatnuje_uroky
    tpl.write(FIRST_COLUMN + 21, 110, 'x')

    // r037_zaplatene_uroky
    tpl.writeNumberToBoxes(
      FIRST_COLUMN + 409,
      108,
      form.r037_zaplatene_uroky.toNumber(),
    )

    // r032_partner_pocet_mesiacov
    tpl.writeToBoxes(
      FIRST_COLUMN + 504,
      108,
      `${form.r032_partner_pocet_mesiacov}`.padStart(2, ' '),
    )
  }

  // ***** PAGE 3
  tpl.nextPage()

  // r038 - Úhrn príjmov od všetkých zamestnávateľov
  tpl.writeNumberToBoxes(FIRST_COLUMN + 397, 737, form.r038.toNumber())

  // r039 - Úhrn povinného poistného
  tpl.writeNumberToBoxes(FIRST_COLUMN + 397, 686, form.r039.toNumber())

  // r040 - Základ dane (čiastkový základ dane)
  tpl.writeNumberToBoxes(FIRST_COLUMN + 397, 660, form.r040.toNumber())

  // t1r2_prijmy - r. 2
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 340,
    483,
    form.t1r2_prijmy.toNumber(),
    true,
  )

  // t1r2_prijmy - spolu r. 1 až 9
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 340,
    222,
    form.t1r10_prijmy.toNumber(),
    true,
  )

  // t1r10_vydavky - spolu r. 1 až 9
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 496,
    222,
    form.t1r10_vydavky.toNumber(),
    true,
  )

  // ***** PAGE 4
  tpl.nextPage()

  // Uplatňujem výdavky percentom z príjmov podľa § 6 ods. 10 zákona
  tpl.write(FIRST_COLUMN + 12, 734, 'x')

  // priloha3_r08_poistne_spolu
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 397,
    708,
    form.priloha3_r08_poistne_spolu.toNumber(),
  )

  // r041
  tpl.writeNumberToBoxes(FIRST_COLUMN + 395, 110, form.r041.toNumber())

  // r042
  tpl.writeNumberToBoxes(FIRST_COLUMN + 395, 86, form.r042.toNumber())

  // ***** PAGE 5
  tpl.nextPage()

  // r043
  tpl.writeNumberToBoxes(FIRST_COLUMN + 400, 770, form.r043.toNumber())

  // r047
  tpl.writeNumberToBoxes(FIRST_COLUMN + 400, 656, form.r047.toNumber())

  // r055
  tpl.writeNumberToBoxes(FIRST_COLUMN + 400, 400, form.r055.toNumber())

  // r057
  tpl.writeNumberToBoxes(FIRST_COLUMN + 400, 322, form.r057.toNumber())

  // ***** PAGE 6
  tpl.nextPage()

  // ***** PAGE 7
  tpl.nextPage()

  // ***** PAGE 8
  tpl.nextPage()

  // r072_pred_znizenim
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 390,
    501,
    form.r072_pred_znizenim.toNumber(),
  )

  // r073
  tpl.writeNumberToBoxes(FIRST_COLUMN + 390, 473, form.r073.toNumber())

  // r074_znizenie_partner
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 390,
    448,
    form.r074_znizenie_partner.toNumber(),
  )

  // 75 - ods. 10 - na preukázateľne zaplatené príspevky na doplnkové dôchodkové sporenie maximálne vo výške 180 eur
  if (form.platil_prispevky_na_dochodok) {
    tpl.writeNumberToBoxes(
      FIRST_COLUMN + 390,
      423,
      form.r075_zaplatene_prispevky_na_dochodok.toNumber(),
    )
  }

  // r076_kupele_spolu
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 390,
    386,
    form.r076_kupele_spolu.toNumber(),
  )

  // r076a_kupele_danovnik
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 390,
    358,
    form.r076a_kupele_danovnik.toNumber(),
  )

  // r076b_kupele_partner_a_deti
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 390,
    332,
    form.r076b_kupele_partner_a_deti.toNumber(),
  )

  // r077_nezdanitelna_cast
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 390,
    308,
    form.r077_nezdanitelna_cast.toNumber(),
  )

  // r078_zaklad_dane_zo_zamestnania
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 390,
    282,
    form.r078_zaklad_dane_zo_zamestnania.toNumber(),
  )

  // r080_zaklad_dane_celkovo
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 390,
    232,
    form.r080_zaklad_dane_celkovo.toNumber(),
  )

  // r081
  tpl.writeNumberToBoxes(FIRST_COLUMN + 390, 206, form.r081.toNumber())

  // ***** PAGE 9
  tpl.nextPage()

  // r090
  tpl.writeNumberToBoxes(FIRST_COLUMN + 396, 615, form.r090.toNumber())

  // r116_dan
  tpl.writeNumberToBoxes(FIRST_COLUMN + 396, 128, form.r116_dan.toNumber())

  // r117
  tpl.writeNumberToBoxes(FIRST_COLUMN + 396, 94, form.r117.toNumber())

  // r118
  tpl.writeNumberToBoxes(FIRST_COLUMN + 396, 70, form.r118.toNumber())

  // ***** PAGE 10
  tpl.nextPage()

  // r119
  tpl.writeNumberToBoxes(FIRST_COLUMN + 396, 770, form.r119.toNumber())

  // r120
  tpl.writeNumberToBoxes(FIRST_COLUMN + 396, 745, form.r120.toNumber())

  // r121
  tpl.writeNumberToBoxes(FIRST_COLUMN + 396, 719, form.r121.toNumber())

  // r123
  tpl.writeNumberToBoxes(FIRST_COLUMN + 396, 668, form.r123.toNumber())

  // r124
  tpl.writeNumberToBoxes(FIRST_COLUMN + 396, 639, form.r124.toNumber())

  // r125
  tpl.writeNumberToBoxes(FIRST_COLUMN + 396, 610, form.r125.toNumber())

  // r126
  tpl.writeNumberToBoxes(FIRST_COLUMN + 396, 584, form.r126.toNumber())

  // r131
  tpl.writeNumberToBoxes(FIRST_COLUMN + 396, 450, form.r131.toNumber())

  // r133
  tpl.writeNumberToBoxes(FIRST_COLUMN + 396, 397, form.r133.toNumber())

  // r135_dan_na_uhradu
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 396,
    313,
    form.r135_dan_na_uhradu.toNumber(),
  )

  // r136_danovy_preplatok
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 396,
    271,
    form.r136_danovy_preplatok.toNumber(),
  )

  // ***** PAGE 11
  tpl.nextPage()

  // ***** PAGE 12
  tpl.nextPage()

  if (form.XIIoddiel_uplatnujem2percenta) {
    // uplatnujem 3 percenta
    if (form.splnam3per) {
      tpl.write(FIRST_COLUMN + 157, 750, 'x')
    }

    // r151
    tpl.writeNumberToBoxes(FIRST_COLUMN + 253, 720, form.r151.toNumber())

    // r152 - ico
    const ico = form.r152 ? form.r152.ico : ''
    tpl.writeToBoxes(FIRST_COLUMN, 664, ico.padStart(12))

    // r152 - ico
    tpl.writeToBoxes(
      FIRST_COLUMN + 202,
      664,
      form.r152 ? form.r152.pravnaForma : '',
    )

    // r152 - obchMeno
    const obchMeno = form.r152 ? form.r152.obchMeno : ''
    tpl.writeToBoxes(FIRST_COLUMN, 628, obchMeno.slice(0, 37), 37)
    if (obchMeno.length > 37) {
      tpl.writeToBoxes(FIRST_COLUMN, 602, obchMeno.slice(37, 74), 37)
    }

    // r152 - ulica
    tpl.writeToBoxes(FIRST_COLUMN, 558, form.r152 ? form.r152.ulica : '', 28)

    // r152 - cislo
    tpl.writeToBoxes(
      FIRST_COLUMN + 418,
      558,
      form.r152 ? form.r152.cislo : '',
      8,
    )

    // r152 - psc
    tpl.writeToBoxes(FIRST_COLUMN, 522, form.r152 ? form.r152.psc : '')

    // r152 - obec
    tpl.writeToBoxes(
      FIRST_COLUMN + 87,
      522,
      form.r152 ? form.r152.obec : '',
      31,
    )

    // r152 - suhlasZaslUdaje
    tpl.write(
      FIRST_COLUMN + 9,
      500,
      form.r152 && form.r152.suhlasZaslUdaje ? 'x' : '',
    )
  } else {
    tpl.write(FIRST_COLUMN + 8, 750, 'x') // neuplatnujem
  }

  // ***** PAGE 13
  tpl.nextPage()

  // r034 - viac ako 4 deti?
  if (form.r034 && form.r034.length > 4) {
    form.r034.slice(4).forEach((child, index) => {
      const rowSize = index * 31

      // priezviskoMeno
      tpl.write(FIRST_COLUMN + 6, 707 - rowSize, child.priezviskoMeno, 10)

      // rodneCislo
      tpl.write(
        FIRST_COLUMN + 220,
        707 - rowSize,
        `rodné číslo: ${child.rodneCislo}`,
      )

      if (child.kupelnaStarostlivost) {
        // kupelnaStarostlivost
        tpl.write(FIRST_COLUMN + 390, 707 - rowSize, 'kúpeľná starostlivosť: x')
      }

      if (child.m00) {
        tpl.write(FIRST_COLUMN + 220, 694 - rowSize, 'daňový bonus 1 - 12')
      } else {
        const months = [
          child.m01 ? '1' : null,
          child.m02 ? '2' : null,
          child.m03 ? '3' : null,
          child.m04 ? '4' : null,
          child.m05 ? '5' : null,
          child.m06 ? '6' : null,
          child.m07 ? '7' : null,
          child.m08 ? '8' : null,
          child.m09 ? '9' : null,
          child.m10 ? '10' : null,
          child.m11 ? '11' : null,
          child.m12 ? '12' : null,
        ]
        tpl.write(
          FIRST_COLUMN + 220,
          694 - rowSize,
          `daňový bonus ${months.filter((value) => !!value).join(', ')}`,
        )
      }
    })
  }

  // r143
  tpl.write(FIRST_COLUMN + 102, 318, '3')
  tpl.writeDate(FIRST_COLUMN + 141, 271)

  const maDanovBonus =
    form.mozeZiadatVyplatitDanovyBonus && form.ziadamVyplatitDanovyBonus
  const maDanovyPreplatok =
    form.mozeZiadatVratitDanovyPreplatok && form.ziadamVratitDanovyPreplatok

  if (maDanovBonus || maDanovyPreplatok) {
    if (form.ziadamVyplatitDanovyBonus) {
      tpl.write(FIRST_COLUMN + 9, 222, 'x')
    }

    if (form.ziadamVratitDanovyPreplatok) {
      tpl.write(FIRST_COLUMN + 9, 181, 'x')
    }

    tpl.write(FIRST_COLUMN + 175, 154, 'x')
    tpl.writeToBoxes(FIRST_COLUMN + 41, 127, form.iban)
    tpl.writeDate(FIRST_COLUMN + 41, 63)
  }

  // ***** PAGE 14-17
  tpl.nextPage()
  tpl.nextPage()
  tpl.nextPage()
  tpl.nextPage()

  // priloha3_r08_poistne_spolu
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 410,
    405,
    form.priloha3_r08_poistne_spolu.toNumber(),
  )

  // priloha3_r11_socialne
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 410,
    329,
    form.priloha3_r11_socialne.toNumber(),
  )

  // priloha3_r13_zdravotne
  tpl.writeNumberToBoxes(
    FIRST_COLUMN + 410,
    277,
    form.priloha3_r13_zdravotne.toNumber(),
  )

  tpl.writeDate(FIRST_COLUMN + 40, 119)

  tpl.commitPage()

  tpl.end()

  return tpl.writer
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  const rawTaxFormUserInput = req.body.taxFormUserInput
  if (!rawTaxFormUserInput) {
    return res.status(500).json({ error: 'invalid data' })
  }

  const taxFormUserInput: TaxFormUserInput = JSON.parse(rawTaxFormUserInput)
  const taxForm: TaxForm = calculate(setDate(taxFormUserInput))

  res.setHeader(
    'content-disposition',
    'attachment; filename=danove_priznanie.pdf',
  )
  res.writeHead(200, { 'Content-Type': 'application/pdf' })

  buildPdf(taxForm, res)

  res.end()
}
