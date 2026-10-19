import {formResponse} from '../lib/vercel-api.mjs';

export default {fetch:request=>formResponse(request)};
