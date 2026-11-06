import serverless from 'serverless-http';
import { app } from '../../server.js';

const expressHandler = serverless(app);

export const handler = (event, context) => {
    // Redirects below retain the original route after the function name. Express
    // must receive that original route rather than Netlify's internal prefix.
    const prefix = '/.netlify/functions/api';
    const path = event.path?.startsWith(prefix) ? event.path.slice(prefix.length) || '/' : event.path;
    return expressHandler({...event, path}, context);
};
