const baseUrl = 'https://api.sendinblue.com/v3'
const token = process.env.sendinbluetoken
const sender = {
  name: 'priznanie.digital',
  email: 'priznanie.digital@slovensko.digital',
}

if (!token) {
  throw new Error('process.env.sendinbluetoken is not defined')
}

const headers = {
  accept: 'application/json',
  'content-type': 'application/json',
  'api-key': token,
}

export interface SendEmailAttachment {
  content: string
  name: string
}
export interface SendTextParams {
  to: string
  subject: string
  textContent: string
  attachment?: SendEmailAttachment[]
}

export const sendEmail = async ({
  subject,
  textContent,
  to,
  attachment,
}: SendTextParams) => {
  const body = {
    sender,
    to: [{ email: to }],
    attachment: attachment && attachment.length > 0 ? attachment : undefined,
    subject,
    textContent,
  }

  const result = await fetch(`${baseUrl}/smtp/email`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (result.status !== 201) {
    const message = `Error sending email to ${to}`
    console.error(message)
    console.error(await result.json())
    throw new Error(message)
  }

  return result
}

export const makeAttachment = (name: string, content: any) => ({
  name,
  content: Buffer.from(content).toString('base64'),
})
