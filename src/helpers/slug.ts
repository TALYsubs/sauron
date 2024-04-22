import { prisma } from '../services/prisma';

export const generateSlug = async (planName: string, tmpSlugs?: string[]): Promise<string> => {
  const baseSlug = planName
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '-');

  // Fetch all conflicting slugs in one query
  const conflictingSlugs = await prisma.plan.findMany({
    where: {
      slug: {
        startsWith: baseSlug
      }
    },
    select: {
      slug: true
    }
  });

  const slugSet = new Set([...conflictingSlugs.map((p) => p.slug), ...(tmpSlugs ?? [])]);
  if (!slugSet.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (slugSet.has(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
};
