import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { server } from './graphql';
import fastifyApollo, { ApolloFastifyContextFunction } from '@as-integrations/fastify';
import cors from '@fastify/cors';
import pkg from '../package.json';
import { isAuthorized } from './authorizer';
import 'dotenv/config';
import { Context } from './types/global';

const { ADDRESS = 'localhost', PORT = '3100' } = process.env;

const init = async (): Promise<FastifyInstance> => {
    try {
        const app = Fastify({ logger: true });

        // DEBUG
        /*
        app.addHook('onRequest', async (request, reply) => {
          console.log('INFO: Incoming Headers:', request.headers);
        });
    
        app.addHook('onSend', async (request, reply, payload) => {
          console.log('INFO: Outgoing Headers:', request.headers);
        });
        */

        app.register(cors, {
            origin: '*',
            methods: 'POST,OPTIONS',
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        });

        app.get('/version', async (request: FastifyRequest, reply: FastifyReply) => {
            return await reply.send({
                type: 'federation',
                version: pkg.version
            });
        });


        const regApollo = await server(app);

        if (regApollo) {
            await regApollo.start();

            const contextFunction: ApolloFastifyContextFunction<Context> = async (request, reply) => {
                if (request.headers.authorization) {
                    const authorization = await isAuthorized(request.headers.authorization as string);
                    const { email, profile } = await authorization;
                    return ({
                        actor: email,
                        group: profile,
                    })
                } else {
                    return ({
                        authorization: ""
                    })

                }
            };



            app.register(fastifyApollo(regApollo), {
                context: contextFunction
            });
        } else {
            throw new Error('Apollo Server not found');
        }

        return app;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

if (require.main === module) {
    // called directly i.e. "node app"
    (async () => {
        const app = await init();

        app.listen({ host: ADDRESS, port: parseInt(PORT, 10) }, (err, address) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.log(`Server listening at http://${ADDRESS}:${PORT}/graphql`);
        });
    })();
}

export default init;
