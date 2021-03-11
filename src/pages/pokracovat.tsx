import React from 'react'
import { Page } from '../components/Page'
import { TaxForm } from '../types/TaxForm'
import { TaxFormUserInput } from '../types/TaxFormUserInput'
import { toBase64 } from 'next/dist/next-server/lib/to-base-64'
import { convertToXML } from '../lib/xml/xmlConverter'

const buildFields = (
  taxForm: TaxForm,
  userInput: TaxFormUserInput,
): Record<string, string> => {
  const fullName = `${taxForm.r005_meno} ${taxForm.r004_priezvisko}`
  const xmlFile = toBase64(convertToXML(taxForm))
  const newsletter = userInput.newsletter ? 'true' : 'false'

  return {
    'submission[type]': 'EmailMeSubscription',
    'submission[user_email]': userInput.email,
    'submission[recipient_name]': fullName,
    'submission[attachments][][filename]': 'danove-priznanie.xml',
    'submission[attachments][][uploaded_file]': xmlFile,
    'submission[email_template][id]': '166',
    'submission[email_template][params][recipient_name]': fullName,
    // 'submission[email_template][params][deadline]': 'n/a', // TODO: only for postpone
    'submission[email_template][params][newsletter]': newsletter,
    'notification_subscription_types[]': 'TaxReturnSubscription',
  }
}

const ContinuePage: Page<{}> = ({ taxForm, taxFormUserInput }) => {
  const fields = buildFields(taxForm, taxFormUserInput)

  return (
    <>
      <form action="" method="post">
        {Object.entries(fields).map(([name, value]) => (
          <div key={name}>
            <label>{name}</label>
            <br />
            <input type="text" name={name} defaultValue={value} size={100} />
            <br />
            <br />
          </div>
        ))}
        <button>submit</button>
      </form>
    </>
  )
}

export default ContinuePage
