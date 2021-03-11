import { TaxFormUserInput } from '../types/TaxFormUserInput'
import { NextRouter } from 'next/dist/next-server/lib/router/router'
import { TaxForm } from '../types/TaxForm'
import { checkCookie } from './cookie'
import { PostponeUserInput } from '../types/PostponeUserInput'

// route to home page, should be '/' when app is ready
export type HomeRoute = '/'
export const homeRoute: HomeRoute = '/'

export type PostponeHomeRoute = '/'
export const postponeHomeRoute: PostponeHomeRoute = '/'

export type Route =
  | HomeRoute
  | '/prijmy-a-vydavky'
  | '/zamestnanie'
  | '/partner'
  | '/deti'
  | '/dochodok'
  | '/hypoteka'
  | '/kupele'
  | '/dve-percenta'
  | '/osobne-udaje'
  | '/suhrn'
  | '/iban'
  | '/vysledky'
  | '/pokracovat'

export const getOrderedRoutes = (taxForm: TaxForm): ReadonlyArray<Route> => {
  const getChildRoute = (): Route[] => {
    return taxForm.eligibleForChildrenBonus ? ['/deti'] : []
  }
  const getTwoPercentRoute = (): Route[] => {
    return taxForm.canDonateTwoPercentOfTax ? ['/dve-percenta'] : []
  }
  const getIbanRoute = (): Route[] => {
    const isIbanRequired =
      taxForm.mozeZiadatVyplatitDanovyBonus ||
      taxForm.mozeZiadatVratitDanovyPreplatok
    return isIbanRequired ? ['/iban'] : []
  }

  return [
    homeRoute,
    '/prijmy-a-vydavky',
    '/zamestnanie',
    '/partner',
    ...getChildRoute(),
    '/dochodok',
    '/kupele',
    ...getTwoPercentRoute(),
    '/osobne-udaje',
    '/suhrn',
    ...getIbanRoute(),
    '/vysledky',
    '/pokracovat',
  ]
}

const isEditing = () =>
  typeof window !== 'undefined' && window.location.search.includes('edit')

export const getRoutes = (currentRoute: Route, taxForm: TaxForm) => {
  const orderedRoutes = getOrderedRoutes(taxForm)
  const currentRouteIndex = orderedRoutes.indexOf(currentRoute)
  return {
    currentRoute,
    nextRoute: () => {
      if (isEditing()) {
        return '/suhrn'
      } else if (currentRouteIndex < 0) {
        return homeRoute
      } else {
        return orderedRoutes[currentRouteIndex + 1]
      }
    },
    previousRoute: () => {
      if (isEditing()) {
        return '/suhrn'
      } else if (currentRouteIndex < 0) {
        return homeRoute
      } else {
        return orderedRoutes[currentRouteIndex - 1]
      }
    },
  }
}

export type PostponeRoute =
  | PostponeHomeRoute
  | '/odklad/prijmy-zo-zahranicia'
  | '/odklad/osobne-udaje'
  | '/odklad/suhrn'
  | '/odklad/pokracovat'

const postponeRoutesOrder: ReadonlyArray<PostponeRoute> = [
  postponeHomeRoute,
  '/odklad/prijmy-zo-zahranicia',
  '/odklad/osobne-udaje',
  '/odklad/suhrn',
  '/odklad/pokracovat',
]

export const getPostponeRoutes = (currentRoute: PostponeRoute) => {
  const currentRouteIndex = postponeRoutesOrder.indexOf(currentRoute)
  return {
    currentRoute,
    nextRoute: postponeRoutesOrder[currentRouteIndex + 1],
    previousRoute: postponeRoutesOrder[currentRouteIndex + -1],
  }
}

export const validateRoute = (
  router: NextRouter,
  taxForm: TaxForm,
  taxFormUserInput: TaxFormUserInput,
  postponeUserInput: PostponeUserInput,
) => {
  if (!checkCookie('you-shall', 'not-pass')) {
    const isPostponeRoute = router.route.match(/\/odklad\//)

    let requirement
    let value

    if (isPostponeRoute) {
      const requirements = {
        '/odklad/osobne-udaje': 'prijmy_zo_zahranicia',
        '/odklad/suhrn': 'priezvisko',
        '/odklad/pokracovat': 'priezvisko',
      }
      requirement = requirements[router.route]
      value = postponeUserInput[requirement]
    } else {
      const requirements = {
        '/zamestnanie': 't1r10_prijmy',
        '/partner': 'employed',
        '/deti': 'r032_uplatnujem_na_partnera',
        '/dochodok': taxForm.eligibleForChildrenBonus
          ? 'hasChildren'
          : 'r032_uplatnujem_na_partnera',
        // TODO reanable with mortgage feature
        // '/hypoteka': 'platil_prispevky_na_dochodok',
        // '/kupele': 'r037_uplatnuje_uroky',
        '/kupele': 'platil_prispevky_na_dochodok',
        '/dve-percenta': 'kupele',
        '/osobne-udaje': taxForm.XIIoddiel_uplatnujem2percenta
          ? 'XIIoddiel_uplatnujem2percenta'
          : 'platil_prispevky_na_dochodok',
        '/suhrn': 'r004_priezvisko',
        '/vysledky': 'r004_priezvisko',
        '/iban': 'r004_priezvisko',
        '/pokracovat': 'r004_priezvisko',
      }
      requirement = requirements[router.route]
      value = taxFormUserInput[requirement]
    }

    if (requirement && (value === undefined || value === '')) {
      router.replace(homeRoute)
    }
  }
}
