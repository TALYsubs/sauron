import { Prisma } from '@prisma/client';

export default Prisma.defineExtension({
    name: 'prisma-media-extension',
    result: {
        plan: {
          media_cover: {
            needs: { media_cover: true },
            compute(plan) {
              if(!plan.media_cover) return null;
              const planAny = (plan as any);
              return {...planAny.media_cover, url: (planAny.media_cover.key)}
            },
          },
        },
        product_media: { 
            media: { 
                needs: { media: true },
                compute(productMedia) { 
                    if(!productMedia.media) return null; 
                    const productMediaAny = (productMedia as any); 
                    return {...productMediaAny.media, url: (productMediaAny.media.key)}
                }
            }
        }
      },
  })