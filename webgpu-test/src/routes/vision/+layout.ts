import type { LayoutLoad } from './$types';

export const load = (({ route }) => {
    return {
        path: route.id.split("/").at(-1),
    };
}) satisfies LayoutLoad;