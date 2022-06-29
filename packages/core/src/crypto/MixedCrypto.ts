import type { CreateKeyParams, Crypto, SignParams, VerifyParams } from './Crypto'
import type { KeyPair } from './types'

import * as ed25519 from '@stablelib/ed25519'
import { inject, Lifecycle, scoped } from 'tsyringe'

import { InjectionSymbols } from '../constants'
import { AriesFrameworkError } from '../error'
import { Buffer } from '../utils'
import { encodeToBase58 } from '../utils/base58'
import { randomString } from '../utils/string'
import { Wallet } from '../wallet'

import { defaultKeyType, KeyType } from './types'

@scoped(Lifecycle.ContainerScoped)
export class MixedCrypto implements Crypto {
  private wallet: Wallet

  public constructor(@inject(InjectionSymbols.Wallet) wallet: Wallet) {
    this.wallet = wallet
  }

  public async createKey(params: CreateKeyParams): Promise<KeyPair> {
    /// FIXME: Workaround - generate ED keys in Libindy - it allows us to use fast crypto functions
    const seed = params.seed || randomString(32)
    await this.wallet.createKey({ seed })

    const keyType = params.keyType || defaultKeyType
    switch (keyType) {
      case KeyType.Ed25519: {
        return this.createEd25519Key(seed)
      }
      case KeyType.X25519: {
        return this.createX25519Key(seed)
      }
      default:
        throw new AriesFrameworkError(`Key type is not supported: ${keyType}`)
    }
  }

  public async sign(params: SignParams): Promise<Buffer> {
    const keyType = params.keyType || defaultKeyType
    switch (keyType) {
      case KeyType.Ed25519: {
        // FIXME: workaround - using libindy sign API to get faster implementation
        const verKey = encodeToBase58(params.verKey)
        return await this.wallet.sign(params.payload, verKey)
      }
      default:
        throw new AriesFrameworkError(`Unsupported key type: ${keyType}`)
    }
  }

  public async verify(params: VerifyParams): Promise<boolean> {
    const keyType = params.keyType || defaultKeyType
    switch (keyType) {
      case KeyType.Ed25519: {
        // FIXME: workaround - using libindy verify API to get faster implementation
        const verKey = encodeToBase58(params.key)
        return await this.wallet.verify(verKey, params.payload, params.signature)
      }
      default:
        throw new AriesFrameworkError(`Unsupported key type: ${keyType}`)
    }
  }

  public async encrypt(): Promise<Buffer> {
    throw new Error('Unimplemented')
  }

  public async decrypt(): Promise<Buffer> {
    throw new Error('Unimplemented')
  }

  public async convertEd25519ToX25519Key(keyPair: KeyPair): Promise<KeyPair> {
    return {
      privateKey: ed25519.convertSecretKeyToX25519(keyPair.privateKey),
      publicKey: ed25519.convertPublicKeyToX25519(keyPair.publicKey),
    }
  }

  private async createEd25519Key(seed?: string): Promise<KeyPair> {
    const keyPair = seed ? ed25519.generateKeyPairFromSeed(new Buffer(seed)) : ed25519.generateKeyPair()
    return {
      privateKey: keyPair.secretKey,
      publicKey: keyPair.publicKey,
    }
  }

  private async createX25519Key(seed?: string): Promise<KeyPair> {
    const keyPair = await this.createEd25519Key(seed)
    return {
      privateKey: ed25519.convertSecretKeyToX25519(keyPair.privateKey),
      publicKey: ed25519.convertPublicKeyToX25519(keyPair.publicKey),
    }
  }
}
