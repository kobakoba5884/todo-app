import http from 'http'

import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@apollo/server/express4'
import express from 'express'
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'

const typeDefs = `#graphql
    type Query {
        health: Boolean
        greet: String
    }
`

const resolvers = {
  Query: {
    // eslint-disable-next-line @typescript-eslint/require-await
    health: async (_: any, args: any, context: MyContext, info: any) => {
      return true
    },
    // eslint-disable-next-line @typescript-eslint/require-await
    greet: async (_: any, args: any, context: MyContext, info: any) => {
      return 'hello world'
    },
  },
}

type MyContext = {
  req: express.Request
  res: express.Response
}

const main = async () => {
  const PORT = process.env.PORT || 5555
  const app = express()

  const httpServer = http.createServer(app)
  const server = new ApolloServer<MyContext>({
    typeDefs: mergeTypeDefs([typeDefs]),
    resolvers: mergeResolvers([resolvers]),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })

  await server.start()

  app.use(express.json())

  app.use(
    '/graphql',
    expressMiddleware(server, {
      // eslint-disable-next-line @typescript-eslint/require-await
      context: async ({ req, res }) => ({ req, res }),
    })
  )

  await new Promise<void>((resolve) => {
    httpServer.listen({ port: PORT }, resolve)
  })

  console.log(`server is up and running at http://localhost:${PORT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

console.log('hello world')
