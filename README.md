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

To run federation with all microservices:
`npm run dev`

To run specific subgraphs:

```bash
bun run dev:custom-federation user product payment
```

The code runs using bun.

To install bun:

```bash
curl -fsSL https://bun.sh/install | bash
```

Project tree:

```
.
├── README.md
├── apps
│   └── federation
├── bun.lockb
├── package-lock.json
├── package.json
├── packages
├── subgraphs
│   ├── company
│   ├── ecommerce
│   ├── payment
│   ├── plan
│   ├── product
│   ├── subscription
│   └── user
└── turbo.json
```
