import { CalendarDays, HelpCircle, Mountain, ShoppingBag, UtensilsCrossed } from 'lucide-react'

// Mirrors ItemCategory in backend/app/schemas/extraction.py.
export const CATEGORIES = {
  events: {
    label: 'Events',
    blurb: 'Parties, concerts, weddings, meetups',
    icon: CalendarDays,
    badge: 'bg-rose-100 text-rose-800 ring-rose-200',
    tile: 'bg-rose-50 hover:bg-rose-100 ring-rose-200/70',
    iconWrap: 'bg-rose-500 text-white',
    accent: 'bg-rose-500',
  },
  restaurants_food: {
    label: 'Food',
    blurb: 'Restaurants, cafés, street food',
    icon: UtensilsCrossed,
    badge: 'bg-amber-100 text-amber-900 ring-amber-200',
    tile: 'bg-amber-50 hover:bg-amber-100 ring-amber-200/70',
    iconWrap: 'bg-amber-500 text-white',
    accent: 'bg-amber-500',
  },
  travel_activities: {
    label: 'Travel',
    blurb: 'Trips, hikes, tours, experiences',
    icon: Mountain,
    badge: 'bg-teal-100 text-teal-900 ring-teal-200',
    tile: 'bg-teal-50 hover:bg-teal-100 ring-teal-200/70',
    iconWrap: 'bg-teal-600 text-white',
    accent: 'bg-teal-600',
  },
  shops_must_visit: {
    label: 'Shops',
    blurb: 'Boutiques, markets, must-visit spots',
    icon: ShoppingBag,
    badge: 'bg-violet-100 text-violet-900 ring-violet-200',
    tile: 'bg-violet-50 hover:bg-violet-100 ring-violet-200/70',
    iconWrap: 'bg-violet-600 text-white',
    accent: 'bg-violet-600',
  },
  unknown: {
    label: 'Unsorted',
    blurb: "Didn't fit a category",
    icon: HelpCircle,
    badge: 'bg-stone-100 text-stone-700 ring-stone-200',
    tile: 'bg-stone-50 hover:bg-stone-100 ring-stone-200/70',
    iconWrap: 'bg-stone-500 text-white',
    accent: 'bg-stone-500',
  },
}

export const MAIN_CATEGORIES = ['events', 'restaurants_food', 'travel_activities', 'shops_must_visit']

export function categoryOf(key) {
  return CATEGORIES[key] ?? CATEGORIES.unknown
}
