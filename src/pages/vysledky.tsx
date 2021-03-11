import React from 'react'
import { formatCurrency } from '../lib/utils'
import { TaxFormUserInput } from '../types/TaxFormUserInput'
import { Page } from '../components/Page'
import Decimal from 'decimal.js'
import { BackLink } from '../components/BackLink'
import { CheckboxSmall, FormWrapper, Input } from '../components/FormComponents'
import { FormErrors } from '../types/PageUserInputs'
import { Form } from 'formik'
import { EmailUserInput } from '../types/UserInput'

interface SummaryRow {
  key: string
  title: string
  description?: string
  value: Decimal
  fontSize?: number
}
interface SummaryProps {
  rows: SummaryRow[]
}
const Summary = ({ rows }: SummaryProps) => (
  <div id="summary">
    <table className="govuk-table">
      <tbody className="govuk-table__body">
        {rows.map(({ key, title, description, value, fontSize }) => (
          <tr
            className="govuk-table__row"
            style={fontSize ? { fontSize } : undefined}
            key={key}
          >
            <td className="govuk-table__cell">
              {title}
              {description && (
                <div className="govuk-!-margin-top-1">
                  <small>{description}</small>
                </div>
              )}
            </td>
            <td className="govuk-table__cell govuk-table__cell--numeric">
              {value.gt(0) ? (
                <strong>{formatCurrency(value.toNumber())}</strong>
              ) : (
                <span>0,00 EUR</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const Vysledky: Page<Partial<TaxFormUserInput>> = ({
  taxForm,
  taxFormUserInput,
  setTaxFormUserInput,
  router,
  previousRoute,
  nextRoute,
}) => {
  const summaryRows = [
    {
      title: 'Príjmy',
      value: taxForm.t1r10_prijmy.plus(taxForm.r038),
      key: 'prijmy',
    },
    {
      title: 'Zdravotné poistné',
      value: taxForm.priloha3_r13_zdravotne,
      key: 'priloha3_r13_zdravotne',
    },
    {
      title: 'Sociálne poistné',
      value: taxForm.priloha3_r11_socialne,
      key: 'priloha3_r11_socialne',
    },
    {
      title: 'Zaplatené poistné spolu',
      value: taxForm.priloha3_r08_poistne_spolu,
      key: 'priloha3_r08_poistne',
    },
    {
      title: 'Zvýhodnenie na manželku / manžela',
      value: taxForm.r074_znizenie_partner,
      key: 'r074_znizenie_partner',
    },
    {
      title:
        'Daňový bonus na dieťa do 16 rokov alebo študenta do 25 rokov s ktorým žijete v spoločnej domácnosti',
      value: taxForm.r117,
      key: 'r106',
    },
    {
      title: 'Príspevok na dôchodkové poistenie (III. pilier)',
      value: taxForm.r075_zaplatene_prispevky_na_dochodok,
      key: 'r075_zaplatene_prispevky_na_dochodok',
    },
    {
      title: 'Úhrady za kúpele spolu',
      value: taxForm.r076_kupele_spolu,
      key: 'r076_kupele_spolu',
    },
    {
      title: 'Základ dane',
      value: taxForm.r080_zaklad_dane_celkovo,
      key: 'r080_zaklad_dane_celkovo',
    },
    {
      title: 'Daňový preplatok / daňový bonus na vyplatenie',
      value: taxForm.r121.plus(taxForm.r136_danovy_preplatok),
      key: 'na_vyplatenie',
    },
    {
      title: 'Daň na úhradu',
      value: taxForm.r135_dan_na_uhradu,
      key: 'r125_dan_na_uhradu',
      fontSize: 30,
    },
  ]

  return (
    <>
      <BackLink href={previousRoute} />
      <h1 className="govuk-heading-l govuk-!-margin-top-3">
        Výpočet dane za rok 2020
      </h1>
      <h2 className="govuk-heading-m govuk-!-margin-top-3">Stručný prehľad</h2>
      <Summary rows={summaryRows} />
      <FormWrapper<EmailUserInput>
        initialValues={taxFormUserInput}
        validate={validate}
        onSubmit={(values) => {
          setTaxFormUserInput(values)
          router.push(nextRoute)
        }}
      >
        {() => (
          <Form className="form" noValidate>
            <div className="box">
              <Input
                name="email"
                type="email"
                label="Pošleme vám tento výpočet dane na email?"
                hint="Bude sa vám hodiť pri úhrade daní"
                placeholder="váš email"
              />
              <CheckboxSmall
                name="newsletter"
                label="Mám záujem o zasielanie informačného newslettera s praktickými radami pre živnostníkov"
              />
            </div>
            <button
              data-test="next"
              className="govuk-button govuk-!-margin-top-3"
              type="submit"
            >
              Pokračovať
            </button>
          </Form>
        )}
      </FormWrapper>
    </>
  )
}

export const validate = (values: EmailUserInput) => {
  const errors: Partial<FormErrors<EmailUserInput>> = {}

  if (values.email && !values.email.match(/^.+@.+\.[a-z]+$/i)) {
    errors.email = 'Nesprávny formát emailovej adresy'
  } else if (values.newsletter && !values.email) {
    errors.email = 'Zadajte emailovú adresu'
  }

  return errors
}

export default Vysledky
