/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai'
import { ethers } from 'hardhat'
import type { SnapshotRestorer } from '@nomicfoundation/hardhat-network-helpers'
import { takeSnapshot } from '@nomicfoundation/hardhat-network-helpers'
import type { AAC } from '../typechain-types'
import { type SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

describe('AAC test', () => {
	let token: AAC
	let snapshot: SnapshotRestorer
	let owner: SignerWithAddress
	let addr1: SignerWithAddress
	let addr2: SignerWithAddress
	let minterRole: string
	const creatorName = 'John Doe'
	const problemUrl = 'https://example.com/problem'

	before(async () => {
		const signers = await ethers.getSigners()
		owner = signers[0]
		addr1 = signers[1]
		addr2 = signers[2]
		const factory = await ethers.getContractFactory('AAC')
		token = (await factory.deploy()) as AAC
		await token.deployed()
		await token.initialize()
		minterRole = await token.MINTER_ROLE()
	})

	beforeEach(async () => {
		snapshot = await takeSnapshot()
	})

	afterEach(async () => {
		await snapshot.restore()
	})

	describe('name', () => {
		it('check name', async () => {
			const value = await token.name()
			expect(value.toString()).to.equal('Anti-AGI Cryptographers')
		})
	})

	describe('symbol', () => {
		it('check symbol', async () => {
			const symbol = await token.symbol()
			expect(symbol.toString()).to.equal('AAC')
		})
	})

	describe('minting tokens', () => {
		it('mint token and verifies metadata', async () => {
			await token.connect(owner).mint(addr1.address, creatorName, problemUrl)
			const tokenId = 0
			const metadata = await token.getMetaData(tokenId)
			expect(metadata.creatorName).to.equal(creatorName)
			expect(metadata.free).to.equal('')
			expect(metadata.problemUrl).to.equal(problemUrl)
			const tmp = await token.ownerOf(tokenId)
			expect(tmp).to.equal(owner.address)
		})

		it('mints token and verifies metadata', async () => {
			await token.connect(owner).mint(addr1.address, creatorName, problemUrl)
			await token.connect(owner).mint(addr1.address, creatorName, problemUrl)
			const tokenId = 1
			const metadata = await token.getMetaData(tokenId)
			expect(metadata.creatorName).to.equal(creatorName)
			expect(metadata.free).to.equal('')
			expect(metadata.problemUrl).to.equal(problemUrl)
			const tmp = await token.ownerOf(tokenId)
			expect(tmp).to.equal(owner.address)
		})

		it('mint reverse token and verifies metadata', async () => {
			await token
				.connect(owner)
				.mintReverse(addr1.address, creatorName, problemUrl)
			const maxTokenId = ethers.constants.MaxUint256
			const tokenId = maxTokenId
			const metadata = await token.getMetaData(tokenId)
			expect(metadata.creatorName).to.equal(creatorName)
			expect(metadata.free).to.equal('')
			expect(metadata.problemUrl).to.equal(problemUrl)
			const tmp = await token.ownerOf(tokenId)
			expect(tmp).to.equal(owner.address)
		})

		it('mint reverse token and verifies metadata', async () => {
			await token
				.connect(owner)
				.mintReverse(addr1.address, creatorName, problemUrl)
			await token
				.connect(owner)
				.mintReverse(addr1.address, creatorName, problemUrl)
			const maxTokenId = ethers.constants.MaxUint256
			const tokenId = maxTokenId.sub(1)
			const metadata = await token.getMetaData(tokenId)
			expect(metadata.creatorName).to.equal(creatorName)
			expect(metadata.free).to.equal('')
			expect(metadata.problemUrl).to.equal(problemUrl)
			const tmp = await token.ownerOf(tokenId)
			expect(tmp).to.equal(owner.address)
		})

		it('non-minter cannot mint token', async () => {
			await expect(
				token.connect(addr1).mint(addr1.address, creatorName, problemUrl)
			).to.be.revertedWith(
				'AccessControl: account 0x84d59f6e878ca36a1d6e38a6a58a6a553c46e1b8 is missing role 0x859339de7a6a3d2b7c9e49eeedf7bce1b4f4e4d4e0652a7c4ad036f25a9b9bf1'
			)
		})
		it('non-minter cannot mint token', async () => {
			await expect(
				token.connect(addr1).mintReverse(addr1.address, creatorName, problemUrl)
			).to.be.revertedWith(
				'AccessControl: account 0x84d59f6e878ca36a1d6e38a6a58a6a553c46e1b8 is missing role 0x859339de7a6a3d2b7c9e49eeedf7bce1b4f4e4d4e0652a7c4ad036f25a9b9bf1'
			)
		})
	})
	describe('supportsInterface', () => {
		it('checks supported interfaces', async () => {
			const accessControlInterfaceId = '0x7962d6e0'
			const erc721InterfaceId = '0x80ac58cd'
			const erc165InterfaceId = '0x01ffc9a7'

			expect(await token.supportsInterface(accessControlInterfaceId)).to.be.true
			expect(await token.supportsInterface(erc721InterfaceId)).to.be.true
			expect(await token.supportsInterface(erc165InterfaceId)).to.be.true

			const unsupportedInterfaceId = '0xffffffff'
			expect(await token.supportsInterface(unsupportedInterfaceId)).to.be.false
		})
	})

	describe('updating metadata', () => {
		beforeEach(async () => {
			await token.connect(owner).mint(addr1.address, creatorName, problemUrl)
		})

		it('updates free', async () => {
			const newFree = 'New free content'
			await token.connect(addr1).updateFree(1, newFree)
			const metadata = await token.getMetaData(1)
			expect(metadata.free).to.equal(newFree)
		})

		it('non-owner cannot update free', async () => {
			const newFree = 'New free content'
			await expect(
				token.connect(addr2).updateFree(1, newFree)
			).to.be.revertedWith('caller is not owner')
		})

		it('updates creatorName and problemUrl', async () => {
			const newCreatorName = 'Jane Smith'
			const newProblemUrl = 'https://example.com/new_problem'
			await token
				.connect(owner)
				.updateMetaData(1, newCreatorName, newProblemUrl)
			const metadata = await token.getMetaData(1)
			expect(metadata.creatorName).to.equal(newCreatorName)
			expect(metadata.problemUrl).to.equal(newProblemUrl)
		})

		it('non-minter cannot update creatorName and problemUrl', async () => {
			const newCreatorName = 'Jane Smith'
			const newProblemUrl = 'https://example.com/new_problem'
			await expect(
				token.connect(addr1).updateMetaData(1, newCreatorName, newProblemUrl)
			).to.be.revertedWith(
				'AccessControl: account 0x84d59f6e878ca36a1d6e38a6a58a6a553c46e1b8 is missing role 0x859339de7a6a3d2b7c9e49eeedf7bce1b4f4e4d4e0652a7c4ad036f25a9b9bf1'
			)
		})
	})

	describe('minter role management', () => {
		it('grants and revokes minter role', async () => {
			await token.connect(owner).grantMinterRole(addr1.address)
			expect(await token.hasRole(minterRole, addr1.address)).to.be.true

			await token.connect(owner).revokeMinterRole(addr1.address)
			expect(await token.hasRole(minterRole, addr1.address)).to.be.false
		})

		it('non-admin cannot grant or revoke minter role', async () => {
			await expect(
				token.connect(addr1).grantMinterRole(addr2.address)
			).to.be.revertedWith(
				'AccessControl: account 0x84d59f6e878ca36a1d6e38a6a58a6a553c46e1b8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000'
			)
			await expect(
				token.connect(addr1).revokeMinterRole(addr2.address)
			).to.be.revertedWith(
				'AccessControl: account 0x84d59f6e878ca36a1d6e38a6a58a6a553c46e1b8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000'
			)
		})
	})
})
