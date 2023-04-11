# AAC

```bash
//setup
git clone ${repository url}
yarn
yarn build
```

```bash
//test
yarn test
```

```deploy
//test
cp .env.example .env
(edit .env file)
npx hardhat run dist/scripts/deploy-aac.js --network mainnet
```
