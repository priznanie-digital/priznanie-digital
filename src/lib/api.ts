import { AutoformResponseBody, PSCResponseBody } from '../types/api'
import { translit } from './utils'

export const getCity = async (zip: string) => {
  const response = await fetch(
    `https://api.posta.sk/private/search?q=${zip.replace(/\D/g, '')}&m=zip`,
  )
  const pscData: PSCResponseBody = await response.json()
  return pscData?.offices?.[0]?.name ?? ''
}

export const getAutoformByPersonName = async (
  name: string,
): Promise<AutoformResponseBody[]> => {
  return fetch(`/api/autoform?name=${name}`).then((response) => response.json())
}

export const getNgoByName = async (
  name: string,
): Promise<AutoformResponseBody[]> => {
  return fetch(`/api/ngo?name=${name}`).then((response) => response.json())
}

export const getNace = async () => {
  return fetch(`nace.json`)
    .then((response) => response.json())
    .then((values) => {
      return values.map((item) => ({ ...item, translit: translit(item.label) }))
    })
}
