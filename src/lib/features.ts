// Site sections that can be switched off without deleting their code.

/**
 * Travel (/travel, every /travel/<trip>, and /api/trips) is hidden for now: all of it 404s and it's
 * left out of the site terminal. The pages, endpoints and `fetchTrips` / `fetchTrip` are untouched,
 * so flipping this back to true (and re-adding `travel` to `buildTree` in $lib/terminal/shell)
 * brings it back.
 */
export const TRAVEL_ENABLED = false;
