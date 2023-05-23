import type { PageLoad } from './$types';

export const load = (({ params }) => {

    return {
        dimension: params.dimension,

    };

}) satisfies PageLoad;