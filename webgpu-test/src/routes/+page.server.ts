import { redirect } from '@sveltejs/kit';

// Redirect this route to /hello
export function load({ }) {
    console.log()
    throw redirect(302, '/vision/slice');
}