import React from 'react'
import { Form } from 'formik'
import { BooleanRadio, FormWrapper, Input } from '../components/FormComponents'
import { EmployedUserInput, FormErrors } from '../types/PageUserInputs'
import { numberInputRegexp } from '../lib/utils'
import { ErrorSummary } from '../components/ErrorSummary'
import { Page } from '../components/Page'
import { employmentUserInputInitialValues } from '../lib/initialValues'
import { BackLink } from '../components/BackLink'

const Zamestnanie: Page<EmployedUserInput> = ({
  setTaxFormUserInput,
  taxFormUserInput,
  router,
  previousRoute,
  nextRoute,
}) => {
  return (
    <>
      <BackLink href={previousRoute} />
      <FormWrapper<EmployedUserInput>
        initialValues={taxFormUserInput}
        validate={validate}
        onSubmit={(values) => {
          const userInput = values.employed
            ? values
            : {
                ...employmentUserInputInitialValues,
                employed: false,
              }
          setTaxFormUserInput(userInput)
          router.push(nextRoute)
        }}
      >
        {({ values, errors }) => (
          <Form className="form" noValidate>
            <ErrorSummary<EmployedUserInput> errors={errors} />
            <BooleanRadio
              title="Mali ste v roku 2020 príjmy zo zamestnania v SR?"
              name="employed"
            />
            {values.employed && (
              <>
                <Input
                  name="r038"
                  type="number"
                  label="Úhrn príjmov od všetkých zamestnávateľov"
                  hint={`Na tlačive "Potvrdenie o zdaniteľných príjmoch fyzickej osoby zo závislej činnosti" nájdete tento údaj v riadku 01. Ak ste mali viac zamestnávateľov, tak tieto sumy spočítajte a uveďte výslednú.`}
                />
                {/* TODO: Pridat input
                  <Input
                    name="r038"
                    type="number"
                    label="Úhrn príjmov plynúcich na základe dohôd o prácach vykonávaných mimo pracovného pomeru"
                    hint={`Napríklad na základe Dohody o vykonaní práce. Na tlačive "Potvrdenie o zdaniteľných príjmoch fyzickej osoby zo závislej činnosti" nájdete tento údaj v riadku 01a. Ak ste nemali takýto príjem, vyplňte 0.`}
                  />
                */}
                <Input
                  name="r039_socialne"
                  type="number"
                  label="Úhrn sociálneho poistného"
                  hint={`Tento údaj nájdete v "Potvrdení" riadok 2a. Uveďte výslednú sumu od všetkých zamestnávateľov.`}
                />
                <Input
                  name="r039_zdravotne"
                  type="number"
                  label="Úhrn zdravotného poistného"
                  hint={`Tento údaj nájdete v "Potvrdení" riadok 2b. Uveďte výslednú sumu od všetkých zamestnávateľov.`}
                />
                <Input
                  name="r120"
                  type="number"
                  label="Úhrn preddavkov na daň"
                  hint={`Na tlačive "Potvrdenie o zdaniteľných príjmoch fyzickej osoby zo závislej činnosti" nájdete tento údaj v riadku 04. Ak ste mali viac zamestnávateľov, tak tieto sumy spočítajte a uveďte výslednú.`}
                />
                <Input
                  name="r108"
                  type="number"
                  label="Údaje o daňovom bonuse na dieťa"
                  hint={`Na tlačive "Potvrdenie o zdaniteľných príjmoch fyzickej osoby zo závislej činnosti" nájdete tento údaj v riadku 14. Ak ste mali viac zamestnávateľov, tak tieto sumy spočítajte a uveďte výslednú.`}
                />
              </>
            )}
            <button data-test="next" className="govuk-button" type="submit">
              Pokračovať
            </button>
          </Form>
        )}
      </FormWrapper>
    </>
  )
}

export const validate = (values: EmployedUserInput) => {
  const errors: Partial<FormErrors<EmployedUserInput>> = {}

  if (typeof values.employed === 'undefined') {
    errors.employed = 'Vyznačte odpoveď'
  }

  if (values.employed) {
    if (!values.r038) {
      errors.r038 = 'Zadajte úhrn príjmov od všetkých zamestnávateľov'
    } else if (!values.r038.match(numberInputRegexp)) {
      errors.r038 = 'Zadajte sumu príjmov vo formáte 123,45'
    }

    if (!values.r039_socialne) {
      errors.r039_socialne = 'Zadajte úhrn sociálneho poistného'
    } else if (!values.r039_socialne.match(numberInputRegexp)) {
      errors.r039_socialne =
        'Zadajte sumu sociálneho poistného vo formáte 123,45'
    }

    if (!values.r039_zdravotne) {
      errors.r039_zdravotne = 'Zadajte úhrn zdravotného poistného'
    } else if (!values.r039_zdravotne.match(numberInputRegexp)) {
      errors.r039_zdravotne =
        'Zadajte sumu zdravotného poistného vo formáte 123,45'
    }

    if (!values.r120) {
      errors.r120 = 'Zadajte úhrn preddavkov na daň'
    } else if (!values.r120.match(numberInputRegexp)) {
      errors.r120 = 'Zadajte sumu povinného poistného vo formáte 123,45'
    }

    if (!values.r108) {
      errors.r108 = 'Zadajte údaje o daňovom bonuse na dieťa'
    } else if (!values.r108.match(numberInputRegexp)) {
      errors.r108 = 'Zadajte sumu povinného poistného vo formáte 123,45'
    }
  }

  return errors
}

export default Zamestnanie
