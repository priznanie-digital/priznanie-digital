import {
  PersonalInformationUserInput,
  PartnerUserInput,
  IncomeAndExpenseUserInput,
  EmployedUserInput,
  ChildrenUserInput,
  PensionUserInput,
  MortgageUserInput,
  TwoPercentUserInput,
  SpaUserInput,
  TaxBonusUserInput,
} from '../types/PageUserInputs'
import { ChildInput, TaxFormUserInput } from '../types/TaxFormUserInput'
import { PostponeUserInput } from '../types/PostponeUserInput'

export const incomeAndExpenseInitialValues: IncomeAndExpenseUserInput = {
  t1r10_prijmy: '',
  priloha3_r11_socialne: '',
  priloha3_r13_zdravotne: '',
  r122: '',
}

export const partnerUserInitialValues: PartnerUserInput = {
  r031_priezvisko_a_meno: '',
  r031_rodne_cislo: '',
  r032_uplatnujem_na_partnera: undefined,
  partner_step: 0,
  partner_podmienky: {},
  r032_partner_vlastne_prijmy: '',

  r032_partner_pocet_mesiacov: '',
}
export const personalInformationUserInputInitialValues: PersonalInformationUserInput = {
  r001_dic: '',
  // r002_datum_narodenia: "",
  r003_nace: '',
  meno_priezvisko: '',
  r005_meno: '',
  r004_priezvisko: '',
  r006_titul: '',
  r007_ulica: '',
  r008_cislo: '',
  r009_psc: '',
  r010_obec: '',
  r011_stat: '',
}

export const employmentUserInputInitialValues: EmployedUserInput = {
  employed: undefined,
  r038: '',
  r039_socialne: '',
  r039_zdravotne: '',
  r108: '',
  r120: '',
}

let childCounter = 0

export const makeEmptyChild = (): ChildInput => ({
  id: childCounter++,
  priezviskoMeno: '',
  rodneCislo: '',
  kupelnaStarostlivost: false,
  wholeYear: false,
  monthFrom: '0',
  monthTo: '11',
})

export const childrenUserInputInitialValues: ChildrenUserInput = {
  hasChildren: undefined,
  children: [makeEmptyChild()],
}

export const pensionInitialValues: PensionUserInput = {
  platil_prispevky_na_dochodok: undefined,
  r075_zaplatene_prispevky_na_dochodok: '',
}

export const mortgageInitialValues: MortgageUserInput = {
  r037_pocetMesiacov: '',
  r037_zaplatene_uroky: '',
  r037_uplatnuje_uroky: undefined,
}

export const twoPercentInitialValues: TwoPercentUserInput = {
  XIIoddiel_uplatnujem2percenta: undefined,
  splnam3per: false,
  r142_ico: '',
  r142_pravnaForma: '',
  r142_obchMeno: '',
  r142_ulica: '',
  r142_cislo: '',
  r142_psc: '',
  r142_obec: '',
  XIIoddiel_suhlasZaslUdaje: false,
}

export const spaInitialInput: SpaUserInput = {
  r033_partner_kupele: false,
  r033_partner_kupele_uhrady: '',
  kupele: undefined,
  r036_deti_kupele: '',
  r076a_kupele_danovnik: '',
  childrenInSpa: false,
  danovnikInSpa: false,
  children: [makeEmptyChild()],
}

export const taxBonusInitialInput: TaxBonusUserInput = {
  iban: '',
  ziadamVyplatitDanovyBonus: undefined,
}

export const initTaxFormUserInputValues: TaxFormUserInput = {
  ...incomeAndExpenseInitialValues,
  ...partnerUserInitialValues,
  ...personalInformationUserInputInitialValues,
  ...employmentUserInputInitialValues,
  ...childrenUserInputInitialValues,
  ...pensionInitialValues,
  ...mortgageInitialValues,
  ...twoPercentInitialValues,
  ...spaInitialInput,
  ...taxBonusInitialInput,
  ...{ datum: '' },
  ...{ email: '' },
}

export const initialPostponeUserInput: PostponeUserInput = {
  prijmy_zo_zahranicia: undefined,
  dic: '',
  meno_priezvisko: '',
  titul: '',
  meno: '',
  priezvisko: '',
  psc: '',
  obec: '',
  ulica: '',
  cislo: '',
  stat: '',
  datum: '',
}
