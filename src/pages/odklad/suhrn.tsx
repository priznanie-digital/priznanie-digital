import React from 'react'
import { NextPage } from 'next'
import { getPostponeRoutes } from '../../lib/routes'
import { PostponeUserInput } from '../../types/PostponeUserInput'
import { BackLink } from '../../components/BackLink'
import { EmailUserInput } from '../../types/UserInput'
import { FormErrors } from '../../types/PageUserInputs'
import { Form } from 'formik'
import {
  CheckboxSmall,
  FormWrapper,
  Input,
} from '../../components/FormComponents'
import { useRouter } from 'next/router'

const { nextRoute, previousRoute } = getPostponeRoutes('/odklad/suhrn')

interface Props {
  postponeUserInput: PostponeUserInput
  setPostponeUserInput: (values: PostponeUserInput) => void
}
const Suhrn: NextPage<Props> = ({
  postponeUserInput,
  setPostponeUserInput,
}: Props) => {
  const router = useRouter()

  return (
    <>
      <BackLink href={previousRoute} />
      <h1 className="govuk-heading-l govuk-!-margin-top-3">
        Súhrn a kontrola vyplnených údajov
      </h1>
      <table className="govuk-table">
        <tbody className="govuk-table__body">
          <tr className="govuk-table__row">
            <td className="govuk-table__cell govuk-!-width-one-half">
              Príjmy zo zahraničia
            </td>
            <td className="govuk-table__cell govuk-!-width-one-half">
              {postponeUserInput.prijmy_zo_zahranicia ? 'Áno' : 'Nie'}
            </td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell govuk-!-width-one-half">
              Nový termín
            </td>
            <td className="govuk-table__cell govuk-!-width-one-half">
              {postponeUserInput.prijmy_zo_zahranicia
                ? '30. september 2021'
                : '30. jún 2021'}
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="govuk-heading-l">Údaje o daňovníkovi</h2>
      <table className="govuk-table">
        <tbody className="govuk-table__body">
          <tr className="govuk-table__row">
            <td className="govuk-table__cell govuk-!-width-one-half">DIČ</td>
            <td className="govuk-table__cell govuk-!-width-one-half">
              {postponeUserInput.dic}
            </td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell govuk-!-width-one-half">Meno</td>
            <td className="govuk-table__cell govuk-!-width-one-half">
              {postponeUserInput.meno}
            </td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell govuk-!-width-one-half">
              Priezvisko
            </td>
            <td className="govuk-table__cell govuk-!-width-one-half">
              {postponeUserInput.priezvisko}
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="govuk-heading-l">Adresa trvalého pobytu</h2>
      <table className="govuk-table">
        <tbody className="govuk-table__body">
          <tr className="govuk-table__row">
            <td className="govuk-table__cell govuk-!-width-one-half">
              Ulica a súpisné číslo
            </td>
            <td className="govuk-table__cell govuk-!-width-one-half">
              {postponeUserInput.ulica} {postponeUserInput.cislo}
            </td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell govuk-!-width-one-half">PSČ</td>
            <td className="govuk-table__cell govuk-!-width-one-half">
              {postponeUserInput.psc}
            </td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell govuk-!-width-one-half">Obec</td>
            <td className="govuk-table__cell govuk-!-width-one-half">
              {postponeUserInput.obec}
            </td>
          </tr>
          <tr className="govuk-table__row">
            <td className="govuk-table__cell govuk-!-width-one-half">Štát</td>
            <td className="govuk-table__cell govuk-!-width-one-half">
              {postponeUserInput.stat}
            </td>
          </tr>
        </tbody>
      </table>

      <FormWrapper<EmailUserInput>
        initialValues={postponeUserInput}
        validate={validate}
        onSubmit={(values) => {
          setPostponeUserInput({ ...postponeUserInput, ...values })
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

export default Suhrn
