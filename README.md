# sauron

![](https://i.imgflip.com/8mebjb.jpg)

One ring to rule them all.

Sauro is a monorepo that will allow developers of the back end to manage and edit microservices using a monorepo approach , using turborepo. This allows developers to single handed :

- Update changes of the repositories
- Create and use branches on specific subgraph
- Test locally federation integration

This is allowed because all directories are git submodules , which means it points to the microservices actual repositories.

To install:
`npm install`

To run:
`npm run dev`

The code runs using bun.

To install bun:

```bash
curl -fsSL https://bun.sh/install | bash
```
