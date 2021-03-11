interface DatahubCorporateBody {
  id: number
  url: string
}

export interface AutoformResponseBody {
  id: number
  /**  IČ0 */
  cin: string
  /**  DIČ niekedy sa z api vracia null*/
  tin?: string
  /** IČ DPH */
  vatin: string
  name: string
  formatted_address: string
  street: string
  reg_number: number
  building_number: string
  street_number: string
  formatted_street: string
  postal_code: string
  municipality: string
  country: string
  established_on: string
  terminated_on: string
  vatin_paragraph: string
  registration_office: string
  registration_number: string
  datahub_corporate_body: DatahubCorporateBody
  legal_form?: string
}

interface Offices {
  id?: string
  nsk?: string
  name?: string
}

export interface PSCResponseBody {
  addresses: never[]
  offices?: Offices[]
}
