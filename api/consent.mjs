import {consentResponse} from '../lib/vercel-api.mjs';

export default {fetch:request=>consentResponse(request)};
