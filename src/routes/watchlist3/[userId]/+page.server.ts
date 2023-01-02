import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { userId } = params;

  return {
    props: {
      userId,
    },
  };
};

