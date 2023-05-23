import type { PageLoad } from './$types';
import type { Universes } from './universeStore';

export const load = (({ params }) => {

    let dimension = params.dimension as "1d" | "2d" | "3d";
    let dimensionInt = parseInt(dimension[0]);
    let dimensionId = `u${dimensionInt}` as keyof Universes;

    return {
        dimension,
        dimensionInt,
        dimensionId
    };

}) satisfies PageLoad;