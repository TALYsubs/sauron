export interface Context {
    authorization?: JwtPayload | string | null;
    actor?: string | null;
    group?: string | null;
}


export interface Jwks {
    keys: Array<{
        kid: string;
        [key: string]: any;
    }>;
}

declare module 'Fastify' {
    interface FastifyRequest {
        authorization?: any; // Replace 'any' with the actual type of your authorization object
    }
}
