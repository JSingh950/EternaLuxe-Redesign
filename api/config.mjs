import {configResponse} from '../lib/vercel-api.mjs';

export default {fetch:request=>configResponse(request)};
