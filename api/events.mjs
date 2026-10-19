import {eventResponse} from '../lib/vercel-api.mjs';

export default {fetch:request=>eventResponse(request)};
