import { TaxFormUserInput } from './TaxFormUserInput'
import { PostponeUserInput } from './PostponeUserInput'

export type IncomeAndExpenseUserInput = Pick<
  TaxFormUserInput,
  't1r10_prijmy' | 'priloha3_r11_socialne' | 'priloha3_r13_zdravotne' | 'r122'
>

export type EmployedUserInput = Pick<
  TaxFormUserInput,
  'employed' | 'r038' | 'r039_socialne' | 'r039_zdravotne' | 'r108' | 'r120'
>

export type ChildrenUserInput = Pick<
  TaxFormUserInput,
  'hasChildren' | 'children'
>

export type PartnerUserInput = Pick<
  TaxFormUserInput,
  | 'r031_priezvisko_a_meno'
  | 'r031_rodne_cislo'
  | 'r032_uplatnujem_na_partnera'
  | 'r032_partner_vlastne_prijmy'
  | 'r032_partner_pocet_mesiacov'
  | 'r033_partner_kupele'
  | 'r033_partner_kupele_uhrady'
  | 'partner_step'
  | 'partner_spolocna_domacnost'
  | 'partner_bonus_uplatneny'
  | 'partner_podmienky'
>

export type PersonalInformationUserInput = Pick<
  TaxFormUserInput,
  | 'r001_dic'
  | 'r003_nace'
  | 'meno_priezvisko'
  | 'r005_meno'
  | 'r004_priezvisko'
  | 'r006_titul'
  | 'r007_ulica'
  | 'r008_cislo'
  | 'r009_psc'
  | 'r010_obec'
  | 'r011_stat'
>

export type PersonalInformationPostponePage = Pick<
  PostponeUserInput,
  | 'meno_priezvisko'
  | 'titul'
  | 'meno'
  | 'priezvisko'
  | 'dic'
  | 'ulica'
  | 'cislo'
  | 'psc'
  | 'obec'
  | 'stat'
  | 'email'
  | 'newsletter'
>

export type PensionUserInput = Pick<
  TaxFormUserInput,
  'platil_prispevky_na_dochodok' | 'r075_zaplatene_prispevky_na_dochodok'
>

export type MortgageUserInput = Pick<
  TaxFormUserInput,
  'r037_uplatnuje_uroky' | 'r037_zaplatene_uroky' | 'r037_pocetMesiacov'
>

export type TwoPercentUserInput = Pick<
  TaxFormUserInput,
  | 'XIIoddiel_uplatnujem2percenta'
  | 'splnam3per'
  | 'r142_ico'
  | 'r142_pravnaForma'
  | 'r142_obchMeno'
  | 'r142_ulica'
  | 'r142_cislo'
  | 'r142_psc'
  | 'r142_obec'
  | 'XIIoddiel_suhlasZaslUdaje'
>

export type SpaUserInput = Pick<
  TaxFormUserInput,
  | 'kupele'
  | 'r036_deti_kupele'
  | 'r033_partner_kupele'
  | 'r033_partner_kupele_uhrady'
  | 'r076a_kupele_danovnik'
  | 'danovnikInSpa'
  | 'childrenInSpa'
  | 'children'
  | 'r032_uplatnujem_na_partnera'
  | 'r031_priezvisko_a_meno'
  | 'r031_rodne_cislo'
>

export type TaxBonusUserInput = Pick<
  TaxFormUserInput,
  'ziadamVyplatitDanovyBonus' | 'ziadamVratitDanovyPreplatok' | 'iban'
>

export type IncomeSourceCountryUserInput = Pick<
  PostponeUserInput,
  'prijmy_zo_zahranicia'
>

export type FormErrors<FormInput extends {}> = Record<keyof FormInput, string>
