/* eslint-disable @typescript-eslint/no-non-null-assertion */

import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import '@nomicfoundation/hardhat-chai-matchers'
import * as dotenv from 'dotenv'

dotenv.config()

const privateKey =
	typeof process.env.PRIVATE_KEY === 'undefined'
		? '0000000000000000000000000000000000000000000000000000000000000000'
		: process.env.PRIVATE_KEY

const config = {
	solidity: {
		version: '0.8.18',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	networks: {
		mainnet: {
			url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ARCHEMY_KEY!}`,
			accounts: [privateKey],
		},
	},
	etherscan: {
		apiKey: {
			mainnet: process.env.ETHERSCAN_API_KEY!,
		},
	},
}

export default config
