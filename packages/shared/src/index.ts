/** Liveness only: this does not imply database readiness or verified content. */
export interface HealthResponse {
  status: 'ok';
  service: 'reservation-watch-api';
}
