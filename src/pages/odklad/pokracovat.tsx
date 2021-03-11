import React from 'react'
import { Page } from '../../components/Page'
import { toBase64 } from 'next/dist/next-server/lib/to-base-64'
import { PostponeUserInput } from '../../types/PostponeUserInput'
import { convertPostponeToXML } from '../../lib/postpone/postponeConverter'

const buildFields = (userInput: PostponeUserInput): Record<string, string> => {
  const fullName = `${userInput.meno} ${userInput.priezvisko}`
  const xmlFile = toBase64(convertPostponeToXML(userInput))
  const deadline = userInput.prijmy_zo_zahranicia
    ? '30. september 2021'
    : '30. jún 2021'
  const newsletter = userInput.newsletter ? 'true' : 'false'

  return {
    'submission[type]': 'POSTPONE_EmailMeSubscription',
    'submission[user_email]': userInput.email,
    'submission[recipient_name]': fullName,
    'submission[attachments][][filename]': 'odklad-danoveho-priznania.xml',
    'submission[attachments][][uploaded_file]': xmlFile,
    'submission[email_template][id]': '166',
    'submission[email_template][params][recipient_name]': fullName,
    'submission[email_template][params][deadline]': deadline,
    'submission[email_template][params][newsletter]': newsletter,
    'notification_subscription_types[]': 'TaxReturnSubscription',
  }
}

const ContinuePage: Page<{}> = ({ postponeUserInput }) => {
  const fields = buildFields(postponeUserInput)

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
