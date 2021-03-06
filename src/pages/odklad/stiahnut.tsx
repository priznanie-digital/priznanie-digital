import React, { useState } from 'react'
import fileDownload from 'js-file-download'

import { NextPage } from 'next'
import { getPostponeRoutes } from '../../lib/routes'
import { PostponeUserInput } from '../../types/PostponeUserInput'
import { convertPostponeToXML } from '../../lib/postpone/postponeConverter'
import { setDate } from '../../lib/utils'
import { BackLink } from '../../components/BackLink'

const { previousRoute } = getPostponeRoutes('/odklad/stiahnut')

interface Props {
  postponeUserInput: PostponeUserInput
}

const Stiahnut: NextPage<Props> = ({ postponeUserInput }: Props) => {
  const [didDownload, setDidDownload] = useState<boolean>(false)

  return (
    <>
      <BackLink href={previousRoute} />
      <div className="box">
        <h1 className="govuk-heading-l govuk-!-margin-top-3">
          Žiadosť o odklad daňového priznania je pripravená
        </h1>
        <p>
          Stiahnite si súbor do počítača. Použijete ho neskôr na portáli
          Finančnej správy.
        </p>
        <button
          type="submit"
          className="btn-secondary govuk-button govuk-button--large"
          onClick={() => {
            const xml = convertPostponeToXML(setDate(postponeUserInput))
            fileDownload(xml, 'odklad_danoveho_priznania.xml')
            setDidDownload(true)
          }}
          data-test="download-xml"
        >
          Stiahnuť žiadosť (XML)
        </button>
      </div>

      {!didDownload && (
        <div className="govuk-grid-column-full govuk-warning-text govuk-!-margin-top-9">
          <span className="govuk-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govuk-warning-text__text">
            Pred pokračovaním si stiahnite XML súbor
          </strong>
        </div>
      )}

      <button
        className="govuk-button govuk-!-margin-top-9"
        disabled={!didDownload}
        type="button"
        onClick={() => {
          window.location.href =
            'https://navody.digital/zivotne-situacie/odklad-danoveho-priznania'
        }}
      >
        Pokračovať na navody.digital
      </button>
    </>
  )
}

export default Stiahnut
