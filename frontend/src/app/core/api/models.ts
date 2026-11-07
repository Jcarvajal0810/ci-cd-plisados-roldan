// Friendly names for the API types generated from the contract (research R18).
// Do not hand-write API shapes; regenerate with `npm run contract:generate`.
import type { components } from './generated/openapi';

type Schemas = components['schemas'];

export type Image = Schemas['Image'];
export type BusinessProfile = Schemas['BusinessProfile'];
export type OfferingSummary = Schemas['OfferingSummary'];
export type OfferingDetail = Schemas['OfferingDetail'];
export type OfferingInput = Schemas['OfferingInput'];
export type AdminOffering = Schemas['AdminOffering'];
export type SuccessCaseSummary = Schemas['SuccessCaseSummary'];
export type SuccessCaseDetail = Schemas['SuccessCaseDetail'];
export type SuccessCaseInput = Schemas['SuccessCaseInput'];
export type AdminSuccessCase = Schemas['AdminSuccessCase'];
export type Testimonial = Schemas['Testimonial'];
export type TestimonialInput = Schemas['TestimonialInput'];
export type AdminTestimonial = Schemas['AdminTestimonial'];
export type HomeView = Schemas['HomeView'];
export type LoginRequest = Schemas['LoginRequest'];
export type AdminMe = Schemas['AdminMe'];
export type Problem = Schemas['Problem'];
